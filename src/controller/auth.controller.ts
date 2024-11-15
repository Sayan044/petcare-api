import { Request, Response } from 'express'
import otpGenerator from 'otp-generator'
import { generareOTPInput, veirfyOTPInput } from '../lib/types'
import { sendMail } from '../lib/mail'
import { APIError, AppError } from '../lib/errors'

export async function generateOTP(req: Request, res: Response) {
    const parsedData = generareOTPInput.safeParse(req.query)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    const otp = otpGenerator.generate(6,
        {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        }
    )

    const expires = Date.now() + 300 * 1000 // OTP expires in 5min

    req.app.locals.otps[parsedData.data.email] = { otp, expires }

    console.log(`OTP for ${parsedData.data.email} -> ${otp}`)

    try {
        sendMail({ email: parsedData.data.email, otp }, undefined, undefined, undefined, true)

        res.status(200).json({
            message: 'OTP has been sent to your email'
        })
    }
    catch (err) {
        if (err instanceof APIError) {
            res.status(400).json({ message: err.message })
        }
        if (err instanceof AppError) {
            console.log("SENDMAIL ERROR -> ", err.message)
            res.status(500).json({ message: "Faild to send OTP" })
        }
    }

}

export async function verifyOTP(req: Request, res: Response) {
    const parsedData = veirfyOTPInput.safeParse(req.query)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    const storedOTPData = req.app.locals.otps[parsedData.data.email as string]

    if (!storedOTPData) {
        res.status(400).json({ message: 'OTP not found or expired' })
        return
    }

    const isOtpValid = storedOTPData.otp === parsedData.data.otp
    const isOtpExpired = Date.now() > storedOTPData.expires

    if (!isOtpValid) {
        res.status(400).json({ message: 'Invalid OTP' })
        return
    }

    if (isOtpExpired) {
        delete req.app.locals.otps[parsedData.data.email as string]
        res.status(400).json({ message: 'OTP has expired' })
        return
    }

    delete req.app.locals.otps[parsedData.data.email as string]
    res.status(200).json({
        verified: true
    })
}
