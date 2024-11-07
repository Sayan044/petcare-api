import CryptoJS from 'crypto-js'
import { CategoryDomain, Service } from "@prisma/client";
import { db } from "../config/prisma.config";
import { APIError, AppError } from "../lib/errors";
import { CONFIG } from '../config';

export async function createService(email: string, password: string, name: string, category_name: CategoryDomain): Promise<Service> {
    const category = await db.category.findUnique({
        where: {
            name: category_name
        }
    })

    if (!category) throw new APIError("Category not found.")

    const service = await db.service.create({
        data: {
            email,
            password,
            name,
            category_id: category.id
        }
    })

    if (!service) throw new APIError("Failed creating doctor")

    return service
}

export async function getServiceIdByEmail(email: string, password: string): Promise<string> {
    const service = await db.service.findUnique({
        where: { email }
    })

    if (!service) {
        throw new APIError("Service not found")
    }

    const decrypted = CryptoJS.AES.decrypt(service.password, CONFIG.PASSWORD_SECRET)
    const originalPassword = decrypted.toString(CryptoJS.enc.Utf8)

    if (originalPassword !== password) {
        throw new APIError("Password does not match")
    }
    else if (originalPassword === password) {
        return service.id
    }

    throw new AppError("Internal server error")
}

export async function getServiceById(id: string): Promise<Pick<Service, 'name' | 'image' | 'address' | 'about' | 'start_time' | 'end_time' | 'price'>> {
    const service = await db.service.findFirst({
        where: { id },
        select: {
            name: true,
            image: true,
            address: true,
            about: true,
            start_time: true,
            end_time: true,
            price: true
        }
    })

    if (!service) {
        throw new APIError("Service not found")
    }

    return service
}

export async function getServicesByCategoryId(category_id: string): Promise<Pick<Service, 'name' | 'image' | 'address' | 'email'>[]> {
    const services = await db.service.findMany({
        where: {
            category_id
        },
        select: {
            name: true,
            email: true,
            image: true,
            address: true
        }
    })

    if (!services) {
        throw new APIError("DB error -> Services not found")
    }

    return services
}

export async function getServiceByEmail(email: string): Promise<Pick<Service, 'name' | 'image' | 'address' | 'about' | 'start_time' | 'end_time' | 'price'>> {
    const service = await db.service.findUnique({
        where: { email },
        select: {
            name: true,
            image: true,
            address: true,
            about: true,
            start_time: true,
            end_time: true,
            price: true
        }
    })

    if (!service) {
        throw new APIError("Service not found")
    }

    return service
}

export async function updateService(id: string, name: string, image: string, address: string, start_time: string, end_time: string, about: string, price: number): Promise<string> {
    const service = await db.service.findFirst({
        where: { id }
    })

    if (!service) {
        throw new APIError("Service not found")
    }

    const updated_service = await db.service.update({
        where: { id },
        data: {
            name,
            image,
            address,
            start_time,
            end_time,
            about,
            price,
            status: 'VERIFIED'
        }
    })

    if (!updated_service) {
        throw new APIError("Profile updation failed")
    }

    return "Profile updated"
}
