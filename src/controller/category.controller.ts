import path from 'node:path'
import { Request, Response } from 'express'
import { createCategoryInput } from '../lib/types'
import { createCategory, getCategories } from '../service/category.service'
import { APIError, AppError } from '../lib/errors'
import { deleteFile } from '../utils/deleteFile'
import { convertToLinuxPathStyle, imageURL, parseCategoryDomain, parseUploadPath } from '../utils/parse'

export async function createCategoryController(req: Request, res: Response) {
    if (!req.file) {
        res.status(400).send({
            message: "No file uploaded."
        })
        return
    }

    const absolutePath = path.resolve(req.file.path)

    const parsedData = createCategoryInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        deleteFile(absolutePath)
        return
    }

    const categoryDomain = parseCategoryDomain(parsedData.data.name)
    if (!categoryDomain) {
        res.status(400).json({
            message: "Invalid category name."
        })
        deleteFile(absolutePath)
        return
    }

    const filePath = parseUploadPath(convertToLinuxPathStyle(req.file.path))

    try {
        const category = await createCategory(categoryDomain, filePath)
        console.log("CATEGORY CREATED -> ", category)

        res.status(201).json({ message: "Category created successfully" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error creating category: ", err.message)
            deleteFile(absolutePath)
        }
        res.status(500).json({ message: "Failed to create category" })
    }
}

export async function getCategoryController(req: Request, res: Response) {
    try {
        const categories = await getCategories()

        const formattedCategories = categories.map((category) => ({
            ...category,
            icon: imageURL(category.icon)
        }))

        res.status(200).json({ data: formattedCategories })
    }
    catch (err) {
        if (err instanceof AppError) {
            console.error(err.message)

            res.status(500).json({ message: "Failed to fetch categories" })
        }
    }
}
