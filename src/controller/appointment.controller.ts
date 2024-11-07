import { Request, Response } from 'express'
import { createAppointmentInput } from '../lib/types'
import { createAppointment } from '../service/appointment.service'
import { sendMail } from '../lib/mail'
import { APIError } from '../lib/errors'

export async function makeAppointmentController(req: Request, res: Response) {
    // @ts-ignore
    const customerID = req.customerID

    const parsedData = createAppointmentInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    const { date, time, note, doctor_email } = parsedData.data

    try {
        const result = await createAppointment(date, time, note, customerID, doctor_email)

        sendMail(
            {
                name: result.customer_name,
                email: result.customer_email,
                date,
                time,
                doctorName: result.doctor_name
            },
            true, undefined, undefined, undefined
        )

        res.status(201).json({ message: "Appointment created successfully." })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("APPOINMENT MAKING -> ", err.message)

            res.status(500).json({ message: err.message })
        }
    }
}
