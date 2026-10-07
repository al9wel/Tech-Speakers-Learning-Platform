import { isAppRole, type AppRole } from './roles'

export interface VerifiedSession {
    userId: string
    email: string
    role: AppRole
    fullName?: string
    exp: number
}

function getSecretKey(): string {
    return process.env.SUPABASE_SECRET_KEY || 'midad-internal-secret-session-salt'
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
    const enc = new TextEncoder()
    return await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    )
}

function toBase64Url(str: string): string {
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
        base64 += '='
    }
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
}

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

function hexToBuffer(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }
    return bytes
}

export async function createSessionToken(payload: {
    userId: string
    email: string
    role: AppRole
    fullName?: string
}): Promise<string> {
    const enc = new TextEncoder()
    const sessionData: VerifiedSession = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        fullName: payload.fullName,
        exp: Date.now() + 120 * 1000, // 120s validity window
    }
    const jsonStr = JSON.stringify(sessionData)
    const key = await getCryptoKey(getSecretKey())
    const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(jsonStr))
    const sigHex = bufferToHex(sigBuffer)
    const dataB64 = toBase64Url(jsonStr)

    return `${dataB64}.${sigHex}`
}

export async function verifySessionToken(token: string): Promise<VerifiedSession | null> {
    try {
        const parts = token.split('.')
        if (parts.length !== 2) return null
        const [dataB64, sigHex] = parts
        if (!dataB64 || !sigHex) return null

        const jsonStr = fromBase64Url(dataB64)
        const enc = new TextEncoder()
        const key = await getCryptoKey(getSecretKey())
        const sigBytes = hexToBuffer(sigHex)

        const isValid = await crypto.subtle.verify('HMAC', key, sigBytes as unknown as BufferSource, enc.encode(jsonStr))
        if (!isValid) return null

        const parsed = JSON.parse(jsonStr) as VerifiedSession
        if (Date.now() > parsed.exp) return null
        if (!isAppRole(parsed.role)) return null

        return parsed
    } catch {
        return null
    }
}
