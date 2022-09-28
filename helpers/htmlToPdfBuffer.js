const puppeteer = require('puppeteer')

module.exports.htmlToPdfBuffer = async (html) => {
  try {
    const browser = await puppeteer.launch({})
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.setContent(html)
    const content = await page.pdf({ format: 'a4' })
    await browser.close()
    
    return content
  }
  catch (err) {
    console.log('html to pdf buffer ERROR: ', err)
    return false
  }
}
