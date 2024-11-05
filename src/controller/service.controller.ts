import CryptoJS from 'crypto-js'
import { Request, Response } from 'express'
import { createServiceInput, loginServiceInput } from '../lib/types'
import { APIError, AppError } from '../lib/errors'
import { CONFIG } from '../config'
import { parseCategoryDomain } from '../utils/parse'
import { createService, getServiceById, getServiceIdByEmail } from '../service/service.service'
import { sendMail } from '../lib/mail'

export async function registerServiceController(req: Request, res: Response) {
    const parsedData = createServiceInput.safeParse(req.body)
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
        const service = await createService(
            parsedData.data.email,
            CryptoJS.AES.encrypt(parsedData.data.password, CONFIG.PASSWORD_SECRET).toString(),
            parsedData.data.name,
            categoryDomain
        )
        console.log("SERVICE CREATED -> ", service)

        sendMail({ name: 'SERVICE PROVIDER', email: parsedData.data.email, password: parsedData.data.password }, undefined, undefined, true, undefined)

        res.status(201).json({ message: "Service created successfully" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error creating service: ", err.message)

            res.status(500).json({ message: err.message })
        }
    }
}

export async function loginServiceController(req: Request, res: Response) {
    const parsedData = loginServiceInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    try {
        const service_id = await getServiceIdByEmail(parsedData.data.email, parsedData.data.password)

        res.status(200).json({ id: service_id, message: "Login successful" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error Loging in: ", err.message)
            res.status(400).json({ message: err.message })
        }
        else if (err instanceof AppError) {
            console.error("Error Loging in: ", err.message)
            res.status(500).json({ message: "Try again later" })
        }
    }
}

export async function getServiceProfileController(req: Request, res: Response) {
    const { service_id } = req.params

    try {
        const service_profile = await getServiceById(service_id.toString())

        res.status(200).json({ data: service_profile })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error fetching profile: ", err.message)
            res.status(400).json({ message: err.message })
        }
    }
}
