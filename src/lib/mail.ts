import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'
import { CONFIG } from '../config'


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: CONFIG.EMAIL,
        pass: CONFIG.PASSWORD
    }
})

export function sendMail(data: any, isAppointment = false, isService = false, isRegistration = false, isOTP = false) {
    let message: any

    if (isAppointment) {
        const appointmentTemplatePath = path.join(__dirname, 'mails', 'Appointment.html')
        let appointmentTemplate = fs.readFileSync(appointmentTemplatePath, 'utf-8')

        const appointmentData = {
            name: data.name,
            email: data.email,
            date: data.date,
            time: data.time,
            doctorName: data.doctorName
        }

        appointmentTemplate = appointmentTemplate
            .replace(/{{name}}/g, appointmentData.name)
            .replace(/{{doctorName}}/g, appointmentData.doctorName)
            .replace(/{{date}}/g, appointmentData.date)
            .replace(/{{time}}/g, appointmentData.time)

        message = {
            from: `"Petcare" <${CONFIG.EMAIL}>`,
            to: appointmentData.email,
            subject: "Booking Confirmation",
            html: appointmentTemplate
        }
    }
    else if (isService) {
        const serviceTemplatePath = path.join(__dirname, 'mails', 'Service.html')
        let serviceTemplate = fs.readFileSync(serviceTemplatePath, 'utf-8')

        const serviceData = {
            name: data.name,
            email: data.email,
            date: data.date,
            time: data.time,
            serviceName: data.serviceName
        }

        serviceTemplate = serviceTemplate
            .replace(/{{name}}/g, serviceData.name)
            .replace(/{{serviceName}}/g, serviceData.serviceName)
            .replace(/{{date}}/g, serviceData.date)
            .replace(/{{time}}/g, serviceData.time)

        message = {
            from: `"Petcare" <${CONFIG.EMAIL}>`,
            to: serviceData.email,
            subject: "Booking Confirmation",
            html: serviceTemplate
        }
    }
    else if (isRegistration) {
        const registrationTemplatePath = path.join(__dirname, 'mails', 'Registration.html')
        let registrationTemplate = fs.readFileSync(registrationTemplatePath, 'utf-8')

        const registrationData = {
            name: data.name,
            email: data.email,
            password: data.password
        }

        registrationTemplate = registrationTemplate
            .replace(/{{name}}/g, registrationData.name)
            .replace(/{{email}}/g, registrationData.email)
            .replace(/{{password}}/g, registrationData.password)

        message = {
            from: `"Petcare" <${CONFIG.EMAIL}>`,
            to: registrationData.email,
            subject: "Credential for your dashboard",
            html: registrationTemplate
        }
    }
    else if (isOTP) {
        const otpTemplatePath = path.join(__dirname, 'mails', 'OTP.html')
        let otpTemplate = fs.readFileSync(otpTemplatePath, 'utf-8')

        const otpData = {
            email: data.email,
            otp: data.otp
        }

        otpTemplate = otpTemplate
            .replace(/{{otp}}/g, otpData.otp)

        message = {
            from: `"Petcare" <${CONFIG.EMAIL}>`,
            to: otpData.email,
            subject: "Your OTP Code",
            html: otpTemplate
        }
    }

    transporter.sendMail(message)
        .then((res) => {
            console.log(res)
        })
        .catch((error) => {
            console.log(error)
        })
}
