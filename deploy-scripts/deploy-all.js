const { readdirSync } = require('fs')
const { runDeployScript } = require('../helpers')

const FILENAMES_FOR_OMMISSION = [
    'deploy-all.js',
    'deploy-current-target.js'
]

readdirSync(__dirname)
    .filter(filename => !FILENAMES_FOR_OMMISSION.includes(filename))
    .forEach(script => runDeployScript(__dirname, script))
