import CryptoJS from 'crypto-js'
import { Request, Response } from 'express'
import { createDoctorInput, loginDoctorInput } from '../lib/types'
import { APIError, AppError } from '../lib/errors'
import { createDoctor, getDoctorById, getDoctorIdByEmail } from '../service/doctor.service'
import { CONFIG } from '../config'
import { parseCategoryDomain } from '../utils/parse'
import { sendMail } from '../lib/mail'

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

        sendMail({ name: 'DOCTOR', email: parsedData.data.email, password: parsedData.data.password }, undefined, undefined, true, undefined)

        res.status(201).json({ message: "Doctor created successfully" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error creating doctor: ", err.message)

            res.status(500).json({ message: err.message })
        }
    }
}

export async function loginDoctorController(req: Request, res: Response) {
    const parsedData = loginDoctorInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    try {
        const doctor_id = await getDoctorIdByEmail(parsedData.data.email, parsedData.data.password)

        res.status(200).json({ id: doctor_id, message: "Login successful" })
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

export async function getDoctorProfileController(req: Request, res: Response) {
    const { doctor_id } = req.params

    try {
        const doctor_profile = await getDoctorById(doctor_id.toString())

        res.status(200).json({ data: doctor_profile })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error fetching profile: ", err.message)
            res.status(400).json({ message: err.message })
        }
    }
}
