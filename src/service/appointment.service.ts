import { db } from "../config/prisma.config"
import { APIError, AppError } from "../lib/errors"

export async function createAppointment(date: Date, time: string, note: string | undefined, customer_id: string, doctor_email: string): Promise<{ customer_name: string; customer_email: string; doctor_name: string }> {
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

export async function getBookedAppointmentsFromCurrentDate(doctor_email: string, date: Date): Promise<{ date: string; time: string }[]> {
    const appointments = await db.$transaction(async (tx) => {
        const doctor = await tx.doctor.findUnique({
            where: { email: doctor_email }
        })

        if (!doctor) return

        const result = await tx.appointment.findMany({
            where: {
                doctor_id: doctor.id,
                date: {
                    gte: date
                }
            }
        })

        return result
    })

    if (!appointments) {
        throw new AppError("Doctor not found")
    }

    return appointments.map((appointment) => ({
        date: appointment.date.toLocaleDateString("en-CA"),
        time: appointment.time
    }))
}
