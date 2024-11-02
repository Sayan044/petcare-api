import path from 'node:path'
import { Request, Response } from 'express'
import { createCategoryInput } from '../lib/types'
import { createCategory } from '../service/category.service'
import { CategoryDomain } from '@prisma/client'
import { APIError } from '../lib/errors'
import { deleteFile } from '../utils/deleteFile'

export async function createCategoryController(req: Request, res: Response) {
    if (!req.file) {
        res.status(400).send({
            message: "No file uploaded."
        })
        return
    }

    const parsedData = createCategoryInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    const categoryDomain = parseCategoryDomain(parsedData.data.name)
    if (!categoryDomain) {
        res.status(400).json({
            message: "Invalid category name."
        })
        return
    }

    const filePath = path.resolve(req.file.path)

    try {
        const category = await createCategory(categoryDomain, filePath)
        console.log("CATEGORY CREATED -> ", category)

        res.status(201).json({ message: "Category created successfully" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error creating category: ", err.message)

            deleteFile(filePath)
        }

        res.status(500).json({ message: "Failed to create category" })
    }
}

function parseCategoryDomain(name: string): CategoryDomain | null {
    if (Object.values(CategoryDomain).includes(name as CategoryDomain)) {
        return name as CategoryDomain
    }
    return null
}
