import { CategoryDomain } from "@prisma/client"
import { CONFIG } from "../config"

export function parseCategoryDomain(name: string): CategoryDomain | null {
    if (Object.values(CategoryDomain).includes(name as CategoryDomain)) {
        return name as CategoryDomain
    }
    return null
}

export function convertToLinuxPathStyle(path: string): string {
    return path.replace(/\\/g, '/')
}

export function parseUploadPath(path: string): string {
    return path.replace(`${CONFIG.UPLOAD_PATH}/`, '')
}

export function imageURL(path: string | null): string | null {
    if (!path) {
        return null
    }
    return `${CONFIG.SERVER_URL}/api/uploads/${path}`
}
