import CryptoJS from 'crypto-js'
import { Customer } from "@prisma/client"
import { db } from "../config/prisma.config"
import { CONFIG } from '../config'
import { APIError, AppError } from '../lib/errors'

export async function createCustomer(name: string, email: string, password: string): Promise<Customer | void> {
    const existingCustomer = await db.customer.findUnique({
        where: { email }
    })

    if (existingCustomer) throw new APIError("Email already exists")

    const customer = await db.customer.create({
        data: {
            name,
            email,
            password
        }
    })

    if (!customer) throw new APIError("Failed to register")

    return customer
}

export async function getCustomerIdByEmail(email: string, password: string): Promise<string> {
    const customer = await db.customer.findUnique({
        where: { email }
    })

    if (!customer) {
        throw new APIError("Customer not found")
    }

    const decrypted = CryptoJS.AES.decrypt(customer.password, CONFIG.PASSWORD_SECRET)
    const originalPassword = decrypted.toString(CryptoJS.enc.Utf8)

    if (originalPassword !== password) {
        throw new APIError("Password does not match")
    }
    else if (originalPassword === password) {
        return customer.id
    }

    throw new AppError("Internal server error")
}

export async function getCustomerById(id: string): Promise<Pick<Customer, 'email' | 'name' | 'contact' | 'image'>> {
    const customer = await db.customer.findFirst({
        where: { id },
        select: {
            email: true,
            name: true,
            contact: true,
            image: true
        }
    })

    if (!customer) {
        throw new APIError("Customer not found")
    }

    return customer
}

export async function updateCustomer(id: string, name: string, contact: string | null, image: string | null): Promise<string> {
    const customer = await db.customer.findFirst({
        where: { id }
    })

    if (!customer) {
        throw new APIError("Customer not found")
    }

    const updated_customer = await db.customer.update({
        where: { id },
        data: {
            name,
            contact,
            image
        }
    })

    if (!updated_customer) {
        throw new APIError("Profile updation failed")
    }

    return "Profile updated"
}

export async function getCustomerAppointmentsById(id: string): Promise<{}> {
    const customer = await db.customer.findFirst({
        where: { id },
        select: {
            appointment: {
                select: {
                    date: true,
                    time: true,
                    doctor: {
                        select: {
                            name: true,
                            address: true
                        }
                    }
                }
            }
        }
    })

    if (!customer) return []

    return customer.appointment.map((item) => ({
        ...item,
        date: item.date.toLocaleDateString('en-IN')
    }))
}

export async function getCustomerBookingsById(id: string) {
    const customer = await db.customer.findFirst({
        where: { id },
        select: {
            booking: {
                select: {
                    date: true,
                    time: true,
                    service: {
                        select: {
                            name: true,
                            address: true
                        }
                    }
                }
            }
        }
    })

    if (!customer) return []

    return customer.booking.map((item) => ({
        ...item,
        date: item.date.toLocaleDateString('en-IN')
    }))
}
