import CryptoJS from 'crypto-js'
import { CategoryDomain, Doctor } from "@prisma/client";
import { db } from "../config/prisma.config";
import { APIError, AppError } from "../lib/errors";
import { CONFIG } from "../config";

export async function createDoctor(email: string, password: string, name: string, category_name: CategoryDomain): Promise<Doctor> {
    const category = await db.category.findUnique({
        where: {
            name: category_name
        }
    })

    if (!category) throw new APIError("Category not found.")

    const doctor = await db.doctor.create({
        data: {
            email,
            password,
            name,
            category_id: category.id
        }
    })

    if (!doctor) throw new APIError("Failed creating doctor")

    return doctor
}

export async function getDoctorIdByEmail(email: string, password: string): Promise<string> {
    const doctor = await db.doctor.findUnique({
        where: { email }
    })

    if (!doctor) {
        throw new APIError("Doctor not found")
    }

    const decrypted = CryptoJS.AES.decrypt(doctor.password, CONFIG.PASSWORD_SECRET)
    const originalPassword = decrypted.toString(CryptoJS.enc.Utf8)

    if (originalPassword !== password) {
        throw new APIError("Password does not match")
    }
    else if (originalPassword === password) {
        return doctor.id
    }

    throw new AppError("Internal server error")
}

export async function getDoctorById(id: string): Promise<Pick<Doctor, 'name' | 'image' | 'address' | 'about' | 'experience_yr' | 'start_time' | 'end_time' | 'fees'>> {
    const doctor = await db.doctor.findUnique({
        where: { id },
        select: {
            name: true,
            image: true,
            address: true,
            about: true,
            experience_yr: true,
            start_time: true,
            end_time: true,
            fees: true
        }
    })

    if (!doctor) {
        throw new APIError("Doctor not found")
    }

    return doctor
}
