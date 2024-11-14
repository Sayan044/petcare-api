import { Router } from 'express'
import { authMiddleware } from '../middleware/verifySession'
import { bookedServicesController, makeBookingController } from '../controller/booking.controller'

const router = Router()

router.route('/').post(authMiddleware, makeBookingController)
router.route('/booked/:service_email').get(bookedServicesController)

export { router as bookingRouter }