import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { isAdmin } from '../middleware/verifyAdmin'
import { getDoctorProfileController, getDoctorsController, getSpecificDoctorController, loginDoctorController, registerDoctorController, updateDoctorProfileController } from '../controller/doctor.controller'

const router = Router()

const uploadFolder = path.join('uploads', 'DOCTOR')

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true })
}

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const { id } = req.query
            const uploadPath = uploadFolder + `/${id}`

            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true })
            }
            cb(null, uploadPath)
        },
        filename: function (req, file, cb) {
            cb(null, `${new Date().getTime()}-${file.originalname}`)
        }
    })
})

router.route('/').post(isAdmin, registerDoctorController)
router.route('/login').post(loginDoctorController)

router.route('/').get(getDoctorsController)
router.route('/:doctor_email').get(getSpecificDoctorController)

router.route('/profile/:doctor_id').get(getDoctorProfileController)
router.route('/profile/update').put(upload.single('photo'), updateDoctorProfileController)

export { router as doctorRouter }