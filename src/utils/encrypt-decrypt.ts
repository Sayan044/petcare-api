import CryptoJS from 'crypto-js'
import { CONFIG } from '../config'

const iv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000")

export function encrypt(item: string) {
    return CryptoJS.AES.encrypt(item, CryptoJS.enc.Utf8.parse(CONFIG.ENCRYPTION_SECRET), { iv: iv }).toString()
}

export function decrypt(item: string) {
    const bytes = CryptoJS.AES.decrypt(item, CryptoJS.enc.Utf8.parse(CONFIG.ENCRYPTION_SECRET), { iv: iv })

    return bytes.toString(CryptoJS.enc.Utf8)
}
