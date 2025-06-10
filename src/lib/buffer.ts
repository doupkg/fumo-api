export function encodeBuffer(prefix: string, object: Record<any, unknown>) {
    const stringBuffer = Buffer.from(JSON.stringify(object)).toString('base64')

    return prefix + ':' + stringBuffer
}

export function decodeBuffer(encoded: string) {
    const buffer = Buffer.from(encoded.split(':')[1], 'base64').toString('ascii')

    return JSON.parse(buffer)
}
