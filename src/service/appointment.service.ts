import { db } from "../config/prisma.config"
import { APIError } from "../lib/errors";

export async function createAppointment(date: string, time: string, note: string | undefined, customer_id: string, doctor_email: string): Promise<{ customer_name: string; customer_email: string; doctor_name: string }> {
    const appointment = await db.$transaction(async (tx) => {

        const customer = await tx.customer.findFirst({
            where: { id: customer_id }
        })

        if (!customer) return

        const doctor = await tx.doctor.findUnique({
            where: { email: doctor_email }
        })

        if (!doctor) return

        await tx.appointment.create({
            data: {
                date,
                time,
                note,
                customer_id,
                doctor_id: doctor.id
            }
        })

        return {
            customer_name: customer.name,
            customer_email: customer.email,
            doctor_name: doctor.name
        }
    })

    if (!appointment) {
        throw new APIError("Failed creating appoinment")
    }

    //@ts-ignore
    return appointment
}
