const { spawn, exec } = require('child_process')
const execAsync = require('util').promisify(exec)
const { logWithFilenameHOF } = require('.')

module.exports.runDeployScript = async (cwd, filename) => {
    const logWithFilename = logWithFilenameHOF(filename)

    console.log(`Running deploy script "${filename}"`)

    try {
        await execAsync(`chmod u+x "${filename}"`, { cwd })

        return new Promise((resolve, reject) => {
            const deployProcess = spawn(`./${filename}`, { cwd })

            deployProcess.stdout.on('data', (data) => logWithFilename(data.toString()))
            
            deployProcess.stderr.on('data', (data) => logWithFilename(data.toString()))

            deployProcess.on('error', (error) => reject(error))
            
            deployProcess.on('exit', (code) => {
                logWithFilename('child process exited with code ' + code.toString())
                resolve()
            })
        })
    }
    catch (error) {
        console.log(error)
        return
    }
}
