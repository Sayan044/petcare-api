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

export async function getCategories(): Promise<Category[]> {
    const categories = await db.category.findMany()

    if (!categories) throw new AppError("Could not fetch categories")

    return categories
}
