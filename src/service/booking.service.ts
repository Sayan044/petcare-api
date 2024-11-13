import { db } from "../config/prisma.config"
import { APIError } from "../lib/errors";

export async function createBooking(date: string, time: string, note: string | undefined, customer_id: string, service_email: string): Promise<{ customer_name: string; customer_email: string; service_name: string }> {
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
                service_email
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
