const { readdirSync } = require('fs')

module.exports.aggNamedExports = (cwd, currentExports) => {
    readdirSync(cwd).forEach((filename) => {
        Object.assign(currentExports, require(`${cwd}/${filename}`))
    })
}
