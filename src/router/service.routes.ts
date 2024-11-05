import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { isAdmin } from '../middleware/verifyAdmin'
import { getServiceProfileController, loginServiceController, registerServiceController } from '../controller/service.controller'

const router = Router()

const uploadPath = path.join('uploads', 'SERVICE')

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

router.route('/').post(isAdmin, registerServiceController)
router.route('/login').post(loginServiceController)
router.route('/profile/:service_id').get(getServiceProfileController)

export { router as serviceRouter }