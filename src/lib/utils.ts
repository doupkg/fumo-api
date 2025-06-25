import { subtle } from 'node:crypto'
import { status } from 'elysia'

const discordHeaders = {
    signature: 'X-Signature-Ed25519',
    timestamp: 'X-Signature-Timestamp',
}

export function encodeBuffer(prefix: string, object: Record<any, unknown>) {
    const stringBuffer = Buffer.from(JSON.stringify(object)).toString('base64')

    return prefix + ':' + stringBuffer
}

export function decodeBuffer(encoded: string) {
    const buffer = Buffer.from(encoded.split(':')[1], 'base64').toString('ascii')

    return JSON.parse(buffer)
}

export function validateQuery(query: { has?: string[]; filetype?: string }) {
    const temp = {} as { has: { $all: string[] }; filetype: string }
    if (query.has) {
        temp.has = { $all: query.has }
    }

    if (query.filetype) {
        temp.filetype = query.filetype
    }

    return temp
}

/**
 * Code taken from discord-interactions
 */

/**
 * Based on environment, get a reference to the Web Crypto API's SubtleCrypto interface.
 * @returns An implementation of the Web Crypto API's SubtleCrypto interface.
 */
function getSubtleCrypto(): SubtleCrypto {
    if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto.subtle
    }
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
        return globalThis.crypto.subtle
    }
    if (typeof crypto !== 'undefined') {
        return crypto.subtle
    }
    if (typeof require === 'function') {
        // Cloudflare Workers are doing what appears to be a regex check to look and
        // warn for this pattern. We should never get here in a Cloudflare Worker, so
        // I am being coy to avoid detection and a warning.
        const cryptoPackage = 'node:crypto'
        const crypto = require(cryptoPackage)
        return crypto.webcrypto.subtle
    }
    throw new Error('No Web Crypto API implementation found')
}

export const subtleCrypto = getSubtleCrypto()

export async function rawBodyMiddleware({ request, store }: { request: Request; store: any }) {
    console.log('Raw body middleware')
    try {
        if (!store.rawBody) {
            const rawBody = await request.text().catch(console.error)
            store.rawBody = rawBody
        }
    } catch (ex) {
        console.log(ex)
    }
}

export async function discordInteractionsMiddleware({ request, store }: { request: Request; store: any }) {
    try {
        const signature = request.headers.get(discordHeaders.signature)
        const timestamp = request.headers.get(discordHeaders.timestamp)

        if (!signature || !timestamp) {
            console.log('Missing required headers')
            return status(401, { error: 'Missing required headers' })
        }

        const rawBody = store.rawBody

        const isValid = await verifyKey(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!)

        if (!isValid) {
            console.log('Invalid signature')
            return status(403, { error: 'Invalid request signature' })
        }

        console.log('Valid signature')
        return
    } catch (ex) {
        console.log(ex)
        status(500, 'Internal server error, oops')
    }
}

async function verifyKey(rawBody: string, signature: string, timestamp: string, publicKey: string) {
    try {
        // 1. Prepara los datos para verificación
        const timestampData = new TextEncoder().encode(timestamp)
        const bodyData = new TextEncoder().encode(rawBody)
        const message = new Uint8Array([...timestampData, ...bodyData])

        // 2. Importa la clave pública
        const key = await subtle.importKey('raw', hexToUint8Array(publicKey), { name: 'ED25519' }, false, ['verify'])

        // 3. Verifica la firma
        return await subtle.verify('ED25519', key, hexToUint8Array(signature), message)
    } catch (error) {
        console.error('Verification error:', error)
        return false
    }
}

// Helper para convertir hex a Uint8Array
function hexToUint8Array(hex: string) {
    return new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
}
