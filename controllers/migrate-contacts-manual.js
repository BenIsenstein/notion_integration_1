const { Client, isFullPage } = require("@notionhq/client")

for (const [key, value] of Object.entries(require('../env.json'))) {
    process.env[key] = value
}

const main = async () => {
    const notion = new Client({
        auth: process.env.NOTION_API_KEY
    })
    let contactsForUpdate

    try {
        contactsForUpdate = await notion.databases.query({
            database_id: process.env.CONTACTS_DB_ID,
            filter: {
                property: "Phone",
                phone_number: {
                    is_not_empty: true
                }
            }
        })
    } catch (err) {
        return
    }

    for (const contact of contactsForUpdate.results) {
        if (!isFullPage(contact)) continue

        try {
            const { id, properties } = contact
            const phone = properties.Phone.phone_number.replace(/\+|\-|\s/g, '')

            await notion.pages.update({
                page_id: id,
                properties: {
                    "WhatsApp Msg": `https://api.whatsapp.com/send?phone=${phone}`
                }
            })
        } catch (err) {
            console.log(err)
        }
    }
}

main()