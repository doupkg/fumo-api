export function encodeBuffer(object: Record<any, unknown>) {
  const stringBuffer = Buffer.from(JSON.stringify(object)).toString('base64')

  return stringBuffer
}

export function decodeBuffer(encoded: string) {
  const buffer = Buffer.from(encoded, 'base64').toString('ascii')

  return JSON.parse(buffer)
}
