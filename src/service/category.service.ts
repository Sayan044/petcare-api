import { Category, CategoryDomain } from "@prisma/client"
import { db } from "../config/prisma.config"
import { APIError } from "../lib/errors"

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
