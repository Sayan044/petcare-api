import z from 'zod'

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
    
})
