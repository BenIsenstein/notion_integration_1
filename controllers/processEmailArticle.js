const { Client, isFullPage } = require("@notionhq/client")
const { storage, gmail, withConnectAndClose } = require('../repositories')
const { parseGmail, htmlToPdfBuffer, getStorageDateString, stripEmojis, stripTags } = require('../helpers')
const { ARTICLES_BUCKET_NAME, NOTION_GMAIL_LABEL_ID } = require('../constants')

const notion = new Client({
  auth: process.env.NOTION_API_KEY
})

// Get a message
const getEmailById = async (email, msgId) => {
  try {
    let hasTriedListMsg = false
    let messageId
    let rawMessageRes
    let defaultMessageRes

    if (msgId) {
      messageId = msgId
    } else {
      const listMsgRes = await gmail.users.messages.list({
        userId: email,
        labelIds: [NOTION_GMAIL_LABEL_ID],
        maxResults: 1,
        includeSpamTrash: false
      })

      messageId = listMsgRes.data.messages?.[0]?.id
      hasTriedListMsg = true
    }

    if (!messageId) return false

    try {
      rawMessageRes = await gmail.users.messages.get({
        userId: email,
        id: messageId,
        format: 'raw'
      })
  
      defaultMessageRes = await gmail.users.messages.get({
        userId: email,
        id: messageId
      })
    }
    catch (err) {
      if (hasTriedListMsg) {
        throw new Error(err)
      }
      const listMsgRes = await gmail.users.messages.list({
        userId: email,
        labelIds: [NOTION_GMAIL_LABEL_ID],
        maxResults: 1,
        includeSpamTrash: false
      })

      messageId = listMsgRes.data.messages?.[0]?.id

      if (!messageId) return 'ALL_PROCESSED'

      rawMessageRes = await gmail.users.messages.get({
        userId: email,
        id: messageId,
        format: 'raw'
      })

      defaultMessageRes = await gmail.users.messages.get({
        userId: email,
        id: messageId
      })
    }

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
  if (!raw || !multipart) return false

  const bucket = storage.bucket(ARTICLES_BUCKET_NAME)
  const { headers } = multipart.payload
  const parsed = parseGmail(raw)
  const messageid = parsed?.messageid
  const mailHtml = parsed?.content?.[1]?.content || parsed?.content?.[0]?.content

  if (!messageid || !mailHtml) return

  const subject = headers.find(h => h.name === 'Subject')?.value?.slice(0,96)
  const from = stripTags(headers.find(h => h.name === 'From')?.value)
  const content = await htmlToPdfBuffer(mailHtml)
  
  const filePath = `${stripEmojis(from)}/${getStorageDateString()}/${subject}`
  const pdfFile = bucket.file(`${filePath}.pdf`)
  const htmlFile = bucket.file(`${filePath}.html`)

  let doFilesAlreadyExist
  try {
    doFilesAlreadyExist = (await pdfFile.isPublic())[0] && (await htmlFile.isPublic())[0]
  } catch (err) {
    doFilesAlreadyExist = false
  }

  if (doFilesAlreadyExist) return false
  if (!content) return false

  await pdfFile.save(content)
  await htmlFile.save(mailHtml)

  return {
    from,
    subject,
    content,
    messageid,
    pdfUrl: pdfFile.publicUrl(),
    htmlUrl: htmlFile.publicUrl()
  }
}

// save to notion DB
const createNotionArticlePage = async ({ from, subject, content, pdfUrl, htmlUrl }) => {
    if ([from, subject, content, pdfUrl, htmlUrl].some(el => !el)) return false

    const [year, month, day] = getStorageDateString().split('_')
    
    const query = await notion.databases.query({
      database_id: process.env.ARTICLES_DB_ID,
      filter: {
        and: [
          {
            property: "Title",
            title: { equals: subject }
          },
          {
            property: "Created",
            created_time: { on_or_after: new Date(year, month, day).toISOString() }
          },
          {
            property: "Source",
            select: { equals: from }
          }
        ]
      }
    })

    for (const page of query.results) {
      if (!isFullPage(page)) continue

      if (page.properties.Title.title.find(res => res.plain_text === subject)) {
        return false
      }
    }

    return await notion.pages.create({
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

module.exports.processEmailArticle = async (req, res) => {
  try {
    if (!req.body?.message) {
      throw new Error('No message')
    }  
    if (!req.body.message.data) {
      throw new Error('No message data')
    }

    const { data, messageId } = req.body.message
    const dataJson = Buffer.from(data, 'base64').toString()
    const { emailAddress } = JSON.parse(dataJson)
    const email = await getEmailById(emailAddress, messageId)
  
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
      await gmail.users.messages.trash({
        userId: emailAddress,
        id: info.messageid
      })
  
      res.sendStatus(204)
      return
    }
  
    throw new Error('Unsuccessful Notion page creation')
  } catch (error) {
    await withConnectAndClose('prod', 'article-pubsub-failures', async (col) => {
      await col.insertOne({ date, time, error })
    })
    console.log(error)
    res.status(500).send(error)
  }
}
