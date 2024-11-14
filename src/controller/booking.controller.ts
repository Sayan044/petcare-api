import { Request, Response } from 'express'
import { createBookingInput } from '../lib/types'
import { APIError, AppError } from '../lib/errors'
import { createBooking, getBookedServicesFromCurrentDate } from '../service/booking.service'
import { sendMail } from '../lib/mail'

export async function makeBookingController(req: Request, res: Response) {
    // @ts-ignore
    const customerID = req.customerID

    const parsedData = createBookingInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    const bookingDate = new Date(parsedData.data.date)

    if (isNaN(bookingDate.getTime())) {
        res.status(400).json({
            message: "Invalid date format"
        })
        return
    }

    const { time, note, service_email } = parsedData.data

    try {
        const result = await createBooking(bookingDate, time, note, customerID, service_email)

        sendMail(
            {
                name: result.customer_name,
                email: result.customer_email,
                date: bookingDate.toLocaleDateString('en-IN'),
                time,
                serviceName: result.service_name
            },
            undefined, true, undefined, undefined
        )

        res.status(201).json({ message: "Service booked successfully." })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("SERVICE BOOKING -> ", err.message)

            res.status(500).json({ message: err.message })
        }
    }
}

export async function bookedServicesController(req: Request, res: Response) {
    const { service_email } = req.params
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
        const bookings = await getBookedServicesFromCurrentDate(service_email.toString(), queryDate)

        res.status(200).json({ data: bookings })
    }
    catch (err) {
        if (err instanceof AppError) {
            console.error("Error fetching bookings: ", err.message)
        }
        res.status(200).json({ data: [] })
    }
}
