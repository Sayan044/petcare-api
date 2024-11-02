import { Router } from 'express'
import { createCategoryController } from '../controller/category.controller'
import { isAdmin } from '../middleware/verifyAdmin'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'

const router = Router()

const uploadPath = path.join('uploads', 'CATEGORY')

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

router.route('/').post(isAdmin, upload.single('icon'), createCategoryController)

export { router as categoryRouter }
