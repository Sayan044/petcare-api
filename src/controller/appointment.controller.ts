import { Request, Response } from 'express'
import { createAppointmentInput } from '../lib/types'
import { createAppointment, getBookedAppointmentsFromCurrentDate } from '../service/appointment.service'
import { sendMail } from '../lib/mail'
import { APIError, AppError } from '../lib/errors'

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

    const appointmentDate = new Date(parsedData.data.date)

    if (isNaN(appointmentDate.getTime())) {
        res.status(400).json({
            message: "Invalid date format"
        })
        return
    }

    const { time, note, doctor_email } = parsedData.data

    try {
        const result = await createAppointment(appointmentDate, time, note, customerID, doctor_email)

        sendMail(
            {
                name: result.customer_name,
                email: result.customer_email,
                date: appointmentDate.toLocaleDateString('en-IN'),
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

export async function bookedAppointmentsController(req: Request, res: Response) {
    const { doctor_email } = req.params
    const { date } = req.query

    if (!date) {
        res.status(400).send({
            message: "No date provided."
        })
        return
    }

    const queryDate = new Date(date.toString())

    if (isNaN(queryDate.getTime())) {
        res.status(400).json({
            message: "Invalid date format"
        })
        return
    }

    try {
        const appointments = await getBookedAppointmentsFromCurrentDate(doctor_email.toString(), queryDate)

        res.status(200).json({ data: appointments })
    }
    catch (err) {
        if (err instanceof AppError) {
            console.error("Error fetching appointments: ", err.message)
        }
        res.status(200).json({ data: [] })
    }
}
