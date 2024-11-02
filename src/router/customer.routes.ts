import fs from 'node:fs'
import multer from 'multer'
import path from 'node:path'
import { Router } from 'express'
import { createCustomerController, getProfileController, loginCustomerController, logoutController, updateProfileController } from '../controller/customer.controller'
import { authMiddleware } from '../middleware/verifySession'

const router = Router()

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            //@ts-ignore
            const uploadPath = path.join('uploads', req.customerID)

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

router.route('/').post(createCustomerController)
router.route('/login').post(loginCustomerController)
router.route('/logout').get(logoutController)

router.route('/profile').get(authMiddleware, getProfileController)
router.route('/profile/update').put(authMiddleware, upload.single('photo'), updateProfileController)

export { router as customerRouter }
