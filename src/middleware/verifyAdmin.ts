import { NextFunction, Request, Response } from 'express'
import { CONFIG } from '../config'

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
    // Add admin username & password in the headers
    // headers: {
    //     username: admin_username
    //     password: admin_password
    // }

    const { username, password } = req.headers

    if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
        next()
    }
    else {
        res.status(401).json({ message: 'Not authorized' })
        return
    }
}
