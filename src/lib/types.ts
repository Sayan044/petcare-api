import z, { date } from 'zod'

export const createCategoryInput = z.object({
    name: z.string()
})

export const createCustomerInput = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string()
})

export const loginCustomerInput = z.object({
    email: z.string().email(),
    password: z.string()
})

export const generareOTPInput = z.object({
    email: z.string()
})

export const veirfyOTPInput = z.object({
    email: z.string(),
    otp: z.string()
})

export const updateProfileInput = z.object({
    name: z.string(),
    contact: z.string().nullable()
})

export const createDoctorInput = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
    category_name: z.string()
})

export const loginDoctorInput = z.object({
    email: z.string().email(),
    password: z.string()
})

export const updateDoctorInput = z.object({
    name: z.string(),
    address: z.string(),
    experience_yr: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    about: z.string(),
    fees: z.string()
})

export const createServiceInput = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
    category_name: z.string()
})

export const loginServiceInput = z.object({
    email: z.string().email(),
    password: z.string()
})

export const updateServiceInput = z.object({
    name: z.string(),
    address: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    about: z.string(),
    price: z.string()
})

export const createAppointmentInput = z.object({
    date: z.string(),
    time: z.string(),
    note: z.string().optional(),
    doctor_email: z.string()
})
