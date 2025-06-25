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

        console.log('=== TESTING BOTH VERIFICATION METHODS ===')

        const isValid1 = await verifyKey(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!)
        const isValid2 = await verifyKeyAlternative(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!)

        console.log('Method 1 result:', isValid1)
        console.log('Method 2 result:', isValid2)

        if (!isValid1 && !isValid2) {
            console.log('Both verification methods failed')
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
        console.log('Verifying key with:')
        console.log('- rawBody length:', rawBody.length)
        console.log('- rawBody content:', rawBody.substring(0, 200) + '...') // Solo los primeros 200 chars
        console.log('- signature:', signature)
        console.log('- timestamp:', timestamp)
        console.log('- publicKey length:', publicKey.length)
        console.log('- publicKey:', publicKey)

        const timestampData = new TextEncoder().encode(timestamp)
        const bodyData = new TextEncoder().encode(rawBody)
        const message = new Uint8Array([...timestampData, ...bodyData])

        console.log('- message length:', message.length)
        console.log('- timestampData length:', timestampData.length)
        console.log('- bodyData length:', bodyData.length)

        const key = await crypto.subtle.importKey('raw', hexToUint8Array(publicKey), { name: 'Ed25519' }, false, [
            'verify',
        ])

        const result = await crypto.subtle.verify('Ed25519', key, hexToUint8Array(signature), message)
        console.log('- verification result:', result)
        return result
    } catch (error) {
        console.error('Verification error:', error)
        return false
    }
}

function hexToUint8Array(hex: string) {
    const matches = hex.match(/.{1,2}/g)
    if (!matches) {
        throw new Error('Invalid hex string')
    }
    return new Uint8Array(matches.map((byte) => parseInt(byte, 16)))
}

async function verifyKeyAlternative(rawBody: string, signature: string, timestamp: string, publicKey: string) {
    try {
        console.log('=== ALTERNATIVE VERIFICATION ===')

        const publicKeyBytes = hexToUint8Array(publicKey)
        console.log('- publicKeyBytes length:', publicKeyBytes.length)

        const signatureBytes = hexToUint8Array(signature)
        console.log('- signatureBytes length:', signatureBytes.length)

        const timestampBytes = new TextEncoder().encode(timestamp)
        const bodyBytes = new TextEncoder().encode(rawBody)
        const message = new Uint8Array(timestampBytes.length + bodyBytes.length)
        message.set(timestampBytes, 0)
        message.set(bodyBytes, timestampBytes.length)

        console.log('- message length:', message.length)

        const key = await crypto.subtle.importKey('raw', publicKeyBytes, { name: 'Ed25519' }, false, ['verify'])

        const isValid = await crypto.subtle.verify({ name: 'Ed25519' }, key, signatureBytes, message)

        console.log('- alternative verification result:', isValid)
        return isValid
    } catch (error) {
        console.error('Alternative verification error:', error)
        return false
    }
}
