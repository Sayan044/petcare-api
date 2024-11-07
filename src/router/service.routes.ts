import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { isAdmin } from '../middleware/verifyAdmin'
import { getServiceProfileController, getServicesByCategoryIdController, getSpecificServiceController, loginServiceController, registerServiceController, updateServiceProfileController } from '../controller/service.controller'

const router = Router()

const uploadFolder = path.join('uploads', 'SERVICE')

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

router.route('/').post(isAdmin, registerServiceController)
router.route('/login').post(loginServiceController)

router.route('/').get(getServicesByCategoryIdController)
router.route('/:service_email').get(getSpecificServiceController)

router.route('/profile/:service_id').get(getServiceProfileController)
router.route('/profile/update').put(upload.single('photo'), updateServiceProfileController)

export { router as serviceRouter }