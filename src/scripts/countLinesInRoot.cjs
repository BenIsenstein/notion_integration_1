const { join } = require('path')
const { readdirSync, readFileSync } = require('fs')

const DIR_IGNORE = [
    '.vercel',
    'dist',
    'node_modules',
    '.git',
    'package-lock.json',
]

const countLinesInRoot = (root) => {
    const dirents = readdirSync(root, { withFileTypes: true })
    let count = 0

    for (const dirent of dirents) {
        if (DIR_IGNORE.includes(dirent.name)) continue

        if (dirent.isDirectory()) {
            count += countLinesInRoot(join(root, dirent.name))
            continue
        }

        count += readFileSync(join(root, dirent.name), 'utf8').split('\n').length
    }

    return count
}

console.log('lines in project:', countLinesInRoot(join(__dirname, '..', '..')))
