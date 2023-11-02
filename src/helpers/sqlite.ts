export const queryPayloadFromObject = (obj: Object) => {
    const payload = {}
    for (const key in obj) payload[`$${key}`] = obj[key]
    return payload
}

export const makeInsertQuery = (table: string, keys: string[]) => {
    return `INSERT into ${table} (${keys.join(', ')})
        VALUES (${keys.map(key => '$' + key).join(', ')});`
}

export const makeUpdateQuery = (table: string, keys: string[], idColumn = 'id') => {
    return `UPDATE ${table}
        SET ${keys.map((key) => `${key} = $${key}`).join(', ')}
        WHERE ${idColumn} = $${idColumn};`
}
