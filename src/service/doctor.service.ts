import CryptoJS from 'crypto-js'
import { CategoryDomain, Doctor } from "@prisma/client";
import { db } from "../config/prisma.config";
import { APIError, AppError } from "../lib/errors";
import { CONFIG } from "../config";

export async function createDoctor(email: string, password: string, category_name: CategoryDomain): Promise<Doctor> {
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
    const doctor = await db.doctor.findFirst({
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

export async function getDoctors(): Promise<Pick<Doctor, 'name' | 'image' | 'address' | 'email'>[]> {
    const doctors = await db.doctor.findMany({
        where: { status: 'VERIFIED' },
        select: {
            name: true,
            email: true,
            image: true,
            address: true,
        }
    })

    if (!doctors) {
        throw new APIError("DB error -> Doctor not found")
    }

    return doctors
}

export async function getDoctorByEmail(email: string): Promise<Pick<Doctor, 'name' | 'image' | 'address' | 'about' | 'experience_yr' | 'start_time' | 'end_time' | 'fees'>> {
    const doctor = await db.doctor.findUnique({
        where: {
            email,
            status: 'VERIFIED'
        },
        select: {
            name: true,
            image: true,
            address: true,
            about: true,
            experience_yr: true,
            start_time: true,
            end_time: true,
            fees: true,
            appointment: {
                select: {
                    date: true,
                    time: true
                }
            }
        }
    })

    if (!doctor) {
        throw new APIError("Doctor not found")
    }

    return doctor
}

export async function updateDoctor(id: string, name: string, image: string, address: string, experience_yr: number, start_time: string, end_time: string, about: string, fees: number): Promise<string> {
    const doctor = await db.doctor.findFirst({
        where: { id }
    })

    if (!doctor) {
        throw new APIError("Doctor not found")
    }

    const updated_doctor = await db.doctor.update({
        where: { id },
        data: {
            name,
            image,
            address,
            experience_yr,
            start_time,
            end_time,
            about,
            fees,
            status: 'VERIFIED'
        }
    })

    if (!updated_doctor) {
        throw new APIError("Profile updation failed")
    }

    return "Profile updated"
}

export async function getDoctorAppointmentsById(id: string): Promise<{ date: string; time: string; customer_name: string }[]> {
    const doctor = await db.doctor.findFirst({
        where: { id },
        include: {
            appointment: {
                include: {
                    customer: true
                }
            }
        }
    })

    if (!doctor || !doctor.appointment) {
        return []
    }

    const formattedAppointments = doctor.appointment.map((appointment) => ({
        date: appointment.date,
        time: appointment.time,
        customer_name: appointment.customer.name
    }))

    return formattedAppointments
}
