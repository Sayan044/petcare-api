import { db } from "../config/prisma.config"
import { APIError, AppError } from "../lib/errors";

export async function createBooking(date: Date, time: string, note: string | undefined, customer_id: string, service_email: string): Promise<{ customer_name: string; customer_email: string; service_name: string }> {
    const booking = await db.$transaction(async (tx) => {

        const customer = await tx.customer.findFirst({
            where: { id: customer_id }
        })

        if (!customer) return

        const service = await tx.service.findUnique({
            where: { email: service_email }
        })

        if (!service) return

        await tx.booking.create({
            data: {
                date,
                time,
                note,
                customer_id,
                service_id: service.id
            }
        })

        return {
            customer_name: customer.name,
            customer_email: customer.email,
            service_name: service.name
        }
    })

    if (!booking) {
        throw new APIError("Failed creating appoinment")
    }

    //@ts-ignore
    return booking
}

export async function getBookedServicesFromCurrentDate(service_email: string, date: Date): Promise<{ date: string; time: string }[]> {
    const bookings = await db.$transaction(async (tx) => {
        const service = await tx.service.findUnique({
            where: { email: service_email }
        })

        if (!service) return

        const result = await tx.booking.findMany({
            where: {
                service_id: service.id,
                date: {
                    gte: date
                }
            }
        })

        return result
    })

    if (!bookings) {
        throw new AppError("Service not found")
    }

    return bookings.map((booking) => ({
        date: booking.date.toLocaleDateString("en-CA"),
        time: booking.time
    }))
}
