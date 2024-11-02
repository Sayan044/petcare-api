import { Router } from 'express'
import { generateOTP, verifyOTP } from '../controller/auth.controller'
import { localVariables } from '../middleware/localVariable'

const router = Router()

router.route('/get-otp').get(localVariables, generateOTP)
router.route('/verify-otp').get(verifyOTP)

export { router as authRouter }
