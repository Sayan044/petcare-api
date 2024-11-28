import { Router } from 'express'
import { isAdmin } from '../middleware/verifyAdmin'
import { createSymptomController, getSymptomsController } from '../controller/symptom.controller'

const router = Router()

router.route('/').post(isAdmin, createSymptomController)
router.route('/').get(getSymptomsController)

export { router as symptomRouter }
