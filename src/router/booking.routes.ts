import { Router } from 'express'
import { authMiddleware } from '../middleware/verifySession'
import { makeBookingController } from '../controller/booking.controller'

const router = Router()

router.route('/').post(authMiddleware, makeBookingController)

export { router as bookingRouter }