import { CategoryDomain } from "@prisma/client"

export function parseCategoryDomain(name: string): CategoryDomain | null {
    if (Object.values(CategoryDomain).includes(name as CategoryDomain)) {
        return name as CategoryDomain
    }
    return null
}
