import { CategoryDomain, DogBreed, Symptom } from "@prisma/client"
import { CONFIG } from "../config"

export function parseCategoryDomain(name: string): CategoryDomain | null {
    if (Object.values(CategoryDomain).includes(name as CategoryDomain)) {
        return name as CategoryDomain
    }
    return null
}

export function parseDogBreed(name: string): DogBreed | null {
    if (Object.values(DogBreed).includes(name as DogBreed)) {
        return name as DogBreed
    }
    return null
}

export function parseSymptom(name: string): Symptom | null {
    if (Object.values(Symptom).includes(name as Symptom)) {
        return name as Symptom
    }
    return null
}

export function convertToLinuxPathStyle(path: string): string {
    return path.replace(/\\/g, '/')
}

export function parseUploadPath(path: string): string {
    return path.replace(`${CONFIG.UPLOAD_PATH}/`, '')
}

export function convertToURL(path: string | null): string | null {
    if (!path) {
        return null
    }
    return `${CONFIG.SERVER_URL}/api/uploads/${path}`
}
