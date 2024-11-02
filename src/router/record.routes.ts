import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'

const router = Router()

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            //@ts-ignore
            const uploadPath = path.join('uploads', req.customerID, 'RECORDS')

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

export { router as recordRouter }