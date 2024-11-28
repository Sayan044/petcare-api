import { NextFunction, Request, Response, Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { CONFIG } from '../config'
import { authMiddleware } from '../middleware/verifySession'
import { getRecordController, uploadRecordController } from '../controller/record.controller'

const router = Router()

const uploadFolder = path.join(CONFIG.UPLOAD_PATH, 'RECORD')

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
    upload.fields([{ name: 'documents', maxCount: 3 }])(req, res, (err) => {
        if (err) {
            console.log("MULTER ERROR -> ", err.message)
            return res.status(500).json({ message: err.message })
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No file uploaded" })
        }
        next()
    })
}

router.route('/').post(authMiddleware, uploadMiddleware, uploadRecordController)
router.route('/').get(authMiddleware, getRecordController)

export { router as recordRouter }