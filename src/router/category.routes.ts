import { Router } from 'express'
import { createCategoryController, getCategoryController } from '../controller/category.controller'
import { isAdmin } from '../middleware/verifyAdmin'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { CONFIG } from '../config'

const router = Router()

const uploadPath = path.join(CONFIG.UPLOAD_PATH, 'CATEGORY')

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
router.route('/').get(getCategoryController)

export { router as categoryRouter }
