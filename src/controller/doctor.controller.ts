import CryptoJS from 'crypto-js'
import { Request, Response } from 'express'
import { createDoctorInput } from '../lib/types'
import { APIError } from '../lib/errors'
import { createDoctor } from '../service/doctor.service'
import { CONFIG } from '../config'
import { CategoryDomain } from '@prisma/client'

export async function registerDoctorController(req: Request, res: Response) {
    const parsedData = createDoctorInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    const categoryDomain = parseCategoryDomain(parsedData.data.category_name)
    if (!categoryDomain) {
        res.status(400).json({
            message: "Invalid category name."
        })
        return
    }

    try {
        const doctor = await createDoctor(
            parsedData.data.email,
            CryptoJS.AES.encrypt(parsedData.data.password, CONFIG.PASSWORD_SECRET).toString(),
            parsedData.data.name,
            categoryDomain
        )
        console.log("DOCTOR CREATED -> ", doctor)

        res.status(201).json({ message: "Doctor created successfully" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error creating doctor: ", err.message)

            res.status(500).json({ message: err.message })
        }
    }
}

function parseCategoryDomain(name: string): CategoryDomain | null {
    if (Object.values(CategoryDomain).includes(name as CategoryDomain)) {
        return name as CategoryDomain
    }
    return null
}
