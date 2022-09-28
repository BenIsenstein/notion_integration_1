#! /Users/ben/.nvm/versions/node/v14.17.0/bin/node

const { readFileSync } = require('fs')
const { exec } = require('child_process')
const { deployment_target_name } = require('../package.json')

exec(
    readFileSync(`${__dirname}/${deployment_target_name}.zsh`)
)
