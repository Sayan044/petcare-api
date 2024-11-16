import { NextFunction, Request, Response, Router } from 'express'
import { createCategoryController, getCategoryController, getCategoryTypesController } from '../controller/category.controller'
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

function uploadMiddleware(req: Request, res: Response, next: NextFunction) {
    upload.single('icon')(req, res, (err) => {
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

router.route('/').post(isAdmin, uploadMiddleware, createCategoryController)
router.route('/').get(getCategoryController)
router.route('/types').get(isAdmin, getCategoryTypesController)

export { router as categoryRouter }
