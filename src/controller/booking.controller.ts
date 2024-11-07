import { Request, Response } from 'express'
import { createBookingInput } from '../lib/types'
import { APIError } from '../lib/errors'
import { createBooking } from '../service/booking.service'
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

    const { date, time, note, service_email } = parsedData.data

    try {
        const result = await createBooking(date, time, note, customerID, service_email)

        sendMail(
            {
                name: result.customer_name,
                email: result.customer_email,
                date,
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
