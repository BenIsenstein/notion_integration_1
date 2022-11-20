import { readdirSync } from 'fs'

export const aggNamedExports = (cwd, currentExports) => {
    readdirSync(cwd).forEach((filename) => {
        Object.assign(currentExports, require(`${cwd}/${filename}`))
    })
}