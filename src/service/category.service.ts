import { Category, CategoryDomain } from "@prisma/client"
import { db } from "../config/prisma.config"
import { APIError, AppError } from "../lib/errors"

export async function createCategory(name: CategoryDomain, icon: string): Promise<Category> {
    const category = await db.category.create({
        data: {
            name,
            icon
        }
    })

    if (!category) throw new APIError("Failed creating category")

    return category
}

export async function getCategories(): Promise<{ id: string; name: string; icon: string; }[]> {
    const categories = await db.category.findMany()

    if (!categories) throw new AppError("Could not fetch categories")

    return categories.map(category => ({
        ...category,
        name: mapCategoryDomainToString(category.name),
    }))
}

function mapCategoryDomainToString(domain: CategoryDomain): string {
    switch (domain) {
        case CategoryDomain.CAGING_SERVICE:
            return "Caging Service"
        case CategoryDomain.EVENT_SERVICE:
            return "Event Service"
        case CategoryDomain.SITTING_SERVICE:
            return "Sitting Service"
        case CategoryDomain.PET_GROOMING:
            return "Pet Grooming"
        case CategoryDomain.VET_DOCTOR:
            return "Vet Doctor"
        default:
            return domain
    }
}
