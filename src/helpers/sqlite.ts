export const queryPayloadFromObject = (obj: Object) => {
    return Object.keys(obj).reduce((result, key) => ({
        ...result,
        ['$' + key]: obj[key]
    }), {})
}

export const makeInsertQuery = (table: string, keys: string[]) => {
    return `INSERT into ${table} (${keys.join(', ')})
        VALUES (${keys.map(key => '$' + key).join(', ')});`
}

export const makeUpdateQuery = (table: string, keys: string[]) => {
    return `UPDATE ${table}
        SET ${keys.map((key) => `${key} = ${'$' + key}`).join(', ')}
        WHERE id = $id;`
}
