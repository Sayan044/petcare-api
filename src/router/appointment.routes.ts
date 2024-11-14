import { Router } from 'express'
import { authMiddleware } from '../middleware/verifySession'
import { bookedAppointmentsController, makeAppointmentController } from '../controller/appointment.controller'

const router = Router()

router.route('/').post(authMiddleware, makeAppointmentController)
router.route('/booked/:doctor_email').get(bookedAppointmentsController)

export { router as appointmentRouter }