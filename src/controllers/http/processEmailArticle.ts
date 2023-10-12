import { isFullPageOrDatabase } from "@notionhq/client"
import { gmail, notion } from '../../repositories'
import { parseGmail, getStorageDateString, stripEmojis, stripTags, makeDateAndTime } from '../../helpers'
import { NOTION_GMAIL_LABEL_ID } from '../../values'
import { sendAuthTokenResetEmail } from "../../services"
import axios, { AxiosResponse } from 'axios'

interface ITimestampedError {
  date: string
  time: string
  timestamp: number
  error: string
}

// Get a message
const getEmail = async (email) => {
  try {
    let messageId
    
    const listMsgRes = await gmail.users.messages.list({
      userId: email,
      labelIds: [NOTION_GMAIL_LABEL_ID],
      maxResults: 1,
      includeSpamTrash: false
    })

    messageId = listMsgRes.data.messages?.[0]?.id

    if (!messageId) return 'ALL_PROCESSED'

    const rawMessageRes = await gmail.users.messages.get({
      userId: email,
      id: messageId,
      format: 'raw'
    })

    const defaultMessageRes = await gmail.users.messages.get({
      userId: email,
      id: messageId
    })
    
    return {
      raw: rawMessageRes?.data,
      multipart: defaultMessageRes?.data
    }
  }
  catch(err) {
    console.log(err)
    return false
  }
}

// Extract sender, subject and content
const extractInfoFromMessage = async ({ raw, multipart }) => {
  if (!raw || !multipart) {
    throw new Error('Missing either raw or multipart email content')
  }

  const { headers } = multipart.payload
  const parsed = parseGmail(raw)
  const messageid = parsed?.messageid
  const mailHtml = Array.isArray(parsed.content) 
    ? (parsed.content?.[1]?.content || parsed.content?.[0]?.content) as string
    : parsed?.content

  if (!messageid || !mailHtml) {
    throw new Error('Missing either messageid or mail html')
  }

  const subject = headers.find(h => h.name === 'Subject')?.value?.slice(0,96)
  const from = stripTags(headers.find(h => h.name === 'From')?.value)
  
  const filePath = `${stripEmojis(from)}/${getStorageDateString()}/${subject}`
  let imageServiceRes: AxiosResponse<{ htmlUrl: string, pdfUrl: string }, unknown>

  try {
    imageServiceRes = await axios.post(`${process.env.IMAGE_SERVICE_URL}/upload`, { filePath, html: mailHtml })
  } catch (e) {
    console.log('Image service error: ', e)
  }

  return {
    from,
    subject,
    messageid,
    pdfUrl: imageServiceRes.data.pdfUrl,
    htmlUrl: imageServiceRes.data.htmlUrl
  }
}

// save to notion DB
const createNotionArticlePage = async ({ from, subject, pdfUrl, htmlUrl }) => {
    if ([from, subject, pdfUrl, htmlUrl].some(el => !el)) return false

    const [year, month, day] = getStorageDateString().split('_')
    
    const query = await notion.queryDb({
      database_id: process.env.ARTICLES_DB_ID,
      filter: {
        and: [
          {
            property: "Title",
            title: { equals: subject }
          },
          {
            property: "Created",
            created_time: { on_or_after: new Date(+year, +month, +day).toISOString() }
          },
          {
            property: "Source",
            select: { equals: from }
          }
        ]
      }
    })

    for (const page of query.results) {
      if (!isFullPageOrDatabase(page)) continue

      const titleProp = page.properties.Title

      if (titleProp.type !== 'title') continue
      if (titleProp.title.find(res => res.plain_text === subject)) {
        return false
      }
    }

    return await notion.createPage({
        parent: {
            type: 'database_id',
            database_id: process.env.ARTICLES_DB_ID
        },
        icon: {
          type: 'emoji',
          emoji: '📰'
        },
        cover: {
          type: 'external',
          external: {
            url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-1.2.1&q=80&cs=tinysrgb&fm=jpg&crop=entropy'
          }
        },
        properties: {
            Title: { title: [{ text: { content: subject } }] },
            Source: { select: { name: from }},
            Topic: { multi_select: [] },
            Read: { checkbox: false },
            Download: { files: [{ type: "external", name: `${subject}.pdf`, external: { url: pdfUrl }}]}
        },
        children: [
          {
            type: 'embed',
            embed: {
              url: htmlUrl
            }
          }
        ]
    })
}

export const processEmailArticle = async (req, res) => {
  try {
    if (!req.body?.message) {
      throw new Error('No message')
    }  
    if (!req.body.message.data) {
      throw new Error('No message data')
    }

    const { data } = req.body.message
    const dataJson = Buffer.from(data, 'base64').toString()
    const { emailAddress } = JSON.parse(dataJson)
    const email = await getEmail(emailAddress)
  
    if (!email) {
      throw new Error('No email at the given message id or inbox')
    }
    if (email === 'ALL_PROCESSED') {
      res.sendStatus(204)
      return
    }
  
    const info = await extractInfoFromMessage(email)
  
    if (!info) {
      throw new Error('No info extracted from email')
    }
  
    const createPageRes = await createNotionArticlePage(info)
  
    if (createPageRes) {
      //await insertOne('processed-emails', { messageId: info.messageid })
      await gmail.users.messages.trash({
        userId: emailAddress,
        id: info.messageid
      })
  
      res.sendStatus(204)
      return
    }
  
    throw new Error('Unsuccessful Notion page creation')
  } catch (error) {
    // await withConnectAndClose<ITimestampedError, void>(
    //   'prod',
    //   'article-pubsub-failures',
    //   async (col) => {
    //     await col.insertOne({ ...makeDateAndTime(), error: error.toString() })
    //   }
    // )
    if (error.message.includes("reading 'access_token'")) {
      await sendAuthTokenResetEmail()
    }
    console.log(error)
    res.status(500).send(error)
  }
}
