import { NextFunction, Request, Response, Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { isAdmin } from '../middleware/verifyAdmin'
import { getDoctorAppointmentsController, getDoctorProfileController, getDoctorsController, getSpecificDoctorController, loginDoctorController, registerDoctorController, updateDoctorProfileController } from '../controller/doctor.controller'
import { CONFIG } from '../config'

const router = Router()

const uploadFolder = path.join(CONFIG.UPLOAD_PATH, 'DOCTOR')

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true })
}

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const { id } = req.query
            if(!id) return

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

function uploadMiddleware(req: Request, res: Response, next: NextFunction) {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            console.log("MULTER ERROR -> ", err.message)
            return res.status(500).json({ message: "Failed to upload" })
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" })
        }
        next()
    })
}

router.route('/').post(isAdmin, registerDoctorController)
router.route('/login').post(loginDoctorController)

router.route('/').get(getDoctorsController)
router.route('/:doctor_email').get(getSpecificDoctorController)

router.route('/profile/:doctor_id').get(getDoctorProfileController)
router.route('/profile/update').put(uploadMiddleware, updateDoctorProfileController)

router.route('/appointments/:doctor_id').get(getDoctorAppointmentsController)

export { router as doctorRouter }