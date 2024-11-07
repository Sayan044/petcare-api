import { Router } from 'express'
import { authMiddleware } from '../middleware/verifySession'
import { makeAppointmentController } from '../controller/appointment.controller'

const router = Router()

router.route('/').post(authMiddleware, makeAppointmentController)

export { router as appointmentRouter }