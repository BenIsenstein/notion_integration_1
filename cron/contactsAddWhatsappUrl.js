const { contactsAddWhatsappUrl } = require('../controllers')

module.exports = ['0 * * * *', contactsAddWhatsappUrl, 'contactsAddWhatsappUrl']