import { NextFunction, Request, Response } from "express"

export function localVariables(req: Request, res: Response, next: NextFunction) {
    if (!req.app.locals.otps) {
        req.app.locals.otps = {}
    }
    next()
}
