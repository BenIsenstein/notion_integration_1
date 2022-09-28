require('fs')
.readdirSync(__dirname)
.forEach((filename) => {
    Object.assign(module.exports, require(`./${filename}`))
})
