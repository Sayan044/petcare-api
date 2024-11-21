import fs from 'node:fs'
import multer from 'multer'
import path from 'node:path'
import { NextFunction, Request, Response, Router } from 'express'
import { createCustomerController, getCustomerAppointmentsController, getCustomerBookingsController, getProfileController, loginCustomerController, logoutController, updateProfileController } from '../controller/customer.controller'
import { authMiddleware } from '../middleware/verifySession'
import { CONFIG } from '../config'

const router = Router()

const uploadFolder = path.join(CONFIG.UPLOAD_PATH, 'CUSTOMER')

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true })
}

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            //@ts-ignore
            const uploadPath = uploadFolder + `/${req.customerID}`

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

router.route('/').post(createCustomerController)
router.route('/login').post(loginCustomerController)
router.route('/logout').get(logoutController)

router.route('/profile').get(authMiddleware, getProfileController)
router.route('/profile/update').put(authMiddleware, uploadMiddleware, updateProfileController)

router.route('/appointments').get(authMiddleware, getCustomerAppointmentsController)
router.route('/bookings').get(authMiddleware, getCustomerBookingsController)

export { router as customerRouter }
