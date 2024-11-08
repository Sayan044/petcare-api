import CryptoJS from 'crypto-js'
import jwt from 'jsonwebtoken'
import path from 'node:path'
import { Request, Response } from 'express'
import { createCustomerInput, loginCustomerInput, updateProfileInput } from '../lib/types'
import { createCustomer, getCustomerById, getCustomerIdByEmail, updateCustomer } from '../service/customer.service'
import { CONFIG } from '../config'
import { APIError, AppError } from '../lib/errors'
import { deleteFile } from '../utils/deleteFile'
import { convertToLinuxPathStyle, imageURL, parseUploadPath } from '../utils/parse'

export async function createCustomerController(req: Request, res: Response) {
    const parsedData = createCustomerInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    try {
        const customer = await createCustomer(
            parsedData.data.name,
            parsedData.data.email,
            CryptoJS.AES.encrypt(parsedData.data.password, CONFIG.PASSWORD_SECRET).toString()
        )

        if (!customer) {
            res.status(400).json({ message: "Email is already registered" })
            return
        }

        console.log("CUSTOMER REGISTERED -> ", customer)

        res.status(201).json({ message: "Registered successfully" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error creating customer: ", err.message)
            res.status(500).json({ message: "Failed to register" })
        }
    }
}

export async function loginCustomerController(req: Request, res: Response) {
    const parsedData = loginCustomerInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    try {
        const customer_id = await getCustomerIdByEmail(parsedData.data.email, parsedData.data.password)

        const token = jwt.sign({
            customerID: customer_id,
        },
            CONFIG.JWT_SECRET,
            { expiresIn: '1d' }
        )

        req.session!.petcare = token
        res.status(200).json({ message: "Login successful" })
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

export async function logoutController(req: Request, res: Response) {
    req.session = null
    res.json({ message: 'Logged Out' })
}

export async function getProfileController(req: Request, res: Response) {
    // @ts-ignore
    const customerID = req.customerID

    try {
        const customer_profile = await getCustomerById(customerID)

        const formattedCustomerProfile = {
            ...customer_profile,
            image: imageURL(customer_profile.image)
        }

        res.status(200).json({ data: formattedCustomerProfile })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error fetching profile: ", err.message)
            res.status(400).json({ message: err.message })
        }
    }
}

export async function updateProfileController(req: Request, res: Response) {
    //@ts-ignore
    const customerID = req.customerID

    let filePath = null
    let absolutePath = null
    if (req.file) {
        absolutePath = path.resolve(req.file.path)
        filePath = parseUploadPath(convertToLinuxPathStyle(req.file.path))
    }

    const parsedData = updateProfileInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        if (absolutePath) {
            deleteFile(absolutePath)
        }
        return
    }

    try {
        const result = await updateCustomer(
            customerID,
            parsedData.data.name,
            parsedData.data.contact,
            filePath
        )

        res.status(200).json({ message: result })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error updating profile: ", err.message)
            res.status(400).json({ message: err.message })

            if (absolutePath) {
                deleteFile(absolutePath)
            }
        }
    }
}
