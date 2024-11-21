import CryptoJS from 'crypto-js'
import path from 'node:path'
import { Request, Response } from 'express'
import { createDoctorInput, loginDoctorInput, updateDoctorInput } from '../lib/types'
import { APIError, AppError } from '../lib/errors'
import { createDoctor, getDoctorAppointmentsById, getDoctorByEmail, getDoctorById, getDoctorIdByEmail, getDoctors, updateDoctor } from '../service/doctor.service'
import { CONFIG } from '../config'
import { convertToLinuxPathStyle, imageURL, parseCategoryDomain, parseUploadPath } from '../utils/parse'
import { sendMail } from '../lib/mail'
import { deleteFile } from '../utils/deleteFile'
import { decrypt, encrypt } from '../utils/encrypt-decrypt'

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

        const formattedDoctorProfile = {
            ...doctor_profile,
            image: imageURL(doctor_profile.image)
        }

        res.status(200).json({ data: formattedDoctorProfile })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error fetching profile: ", err.message)
            res.status(400).json({ message: err.message })
        }
    }
}

export async function updateDoctorProfileController(req: Request, res: Response) {
    const { id } = req.query

    //@ts-ignore
    const absolutePath = path.resolve(req.file.path)

    if (!id) {
        res.status(400).send({
            message: "No ID provided."
        })
        deleteFile(absolutePath)
        return
    }

    const parsedData = updateDoctorInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        deleteFile(absolutePath)
        return
    }

    //@ts-ignore
    const filePath = parseUploadPath(convertToLinuxPathStyle(req.file.path))

    try {
        const result = await updateDoctor(
            id.toString(),
            parsedData.data.name,
            filePath,
            parsedData.data.address,
            parseInt(parsedData.data.experience_yr),
            parsedData.data.start_time,
            parsedData.data.end_time,
            parsedData.data.about,
            parseFloat(parsedData.data.fees)
        )

        res.status(200).json({ message: result })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error updating profile: ", err.message)
            res.status(400).json({ message: err.message })

            deleteFile(absolutePath)
        }
    }
}

export async function getDoctorsController(req: Request, res: Response) {
    try {
        const doctors = await getDoctors()

        const formattedDoctors = doctors.map((doctor) => ({
            ...doctor,
            email: encrypt(doctor.email),
            image: imageURL(doctor.image)
        }))

        res.status(200).json({ data: formattedDoctors })
    }
    catch (error) {
        if (error instanceof APIError) {
            console.error(error.message)

            res.status(500).json({ message: "Failed to fetch doctors" })
        }
    }
}

export async function getSpecificDoctorController(req: Request, res: Response) {
    const { doctor_email } = req.params

    try {
        const doctor = await getDoctorByEmail(decrypt(doctor_email))

        const formattedDoctor = {
            ...doctor,
            image: imageURL(doctor.image)
        }

        res.status(200).json({ data: formattedDoctor })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error fetching profile: ", err.message)
            res.status(400).json({ message: err.message })
        }
    }
}

export async function getDoctorAppointmentsController(req: Request, res: Response) {
    const { doctor_id } = req.params

    try {
        const appointments = await getDoctorAppointmentsById(doctor_id)

        res.status(200).json({ data: appointments })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error fetching appointments: ", err.message)
            res.status(500).json({ message: err.message })
        }
    }
}
