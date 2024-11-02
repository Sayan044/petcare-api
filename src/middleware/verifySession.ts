import { CONFIG } from '../config'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {

    if (!req.session) {
        res.status(401).json({
            message: 'Session Invalid'
        })
        return
    }

    const sessionCookie = req.session['petcare'] ?? ''

    try {
        const decoded = jwt.verify(sessionCookie, CONFIG.JWT_SECRET)
        //@ts-ignore
        if (decoded.customerID) {
            //@ts-ignore
            req.customerID = decoded.customerID as string

            next()
        }
        else {
            res.status(403).json({
                message: 'You are not logged in'
            })
        }
    }
    catch (err) {
        res.status(403).json({
            error: 'Authentication Failed'
        })
    }
}
