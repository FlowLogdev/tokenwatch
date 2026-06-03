import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { cleanEnv } from '@/lib/env'

function getKey() {
  const secret = cleanEnv(process.env.INTEGRATION_ENCRYPTION_KEY)
  if (!secret) {
    throw new Error('INTEGRATION_ENCRYPTION_KEY is not configured')
  }
  return createHash('sha256').update(secret).digest()
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.')
}

export function decryptSecret(value: string) {
  const [ivPart, tagPart, encryptedPart] = value.split('.')
  if (!ivPart || !tagPart || !encryptedPart) {
    throw new Error('Invalid encrypted secret format')
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getKey(),
    Buffer.from(ivPart, 'base64url')
  )
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}
