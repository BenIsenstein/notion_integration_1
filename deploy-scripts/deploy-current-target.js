const { runDeployScript } = require('../helpers')
const { deployment_target_name } = require('../package.json')

runDeployScript(__dirname, `${deployment_target_name}.zsh`)
