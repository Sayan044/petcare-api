import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { isAdmin } from '../middleware/verifyAdmin'
import { getDoctorProfileController, loginDoctorController, registerDoctorController } from '../controller/doctor.controller'

const router = Router()

const uploadPath = path.join('uploads', 'DOCTOR')

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
}

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadPath)
        },
        filename: function (req, file, cb) {
            cb(null, `${new Date().getTime()}-${file.originalname}`)
        }
    })
})

router.route('/').post(isAdmin, registerDoctorController)
router.route('/login').post(loginDoctorController)
router.route('/profile/:doctor_id').get(getDoctorProfileController)

export { router as doctorRouter }