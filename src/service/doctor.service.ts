import { CategoryDomain, Doctor } from "@prisma/client";
import { db } from "../config/prisma.config";
import { APIError } from "../lib/errors";

export async function createDoctor(email: string, password: string, name: string, category_name: CategoryDomain): Promise<Doctor> {
    const category = await db.category.findUnique({
        where: {
            name: category_name
        }
    })

    if (!category) throw new APIError("Category not found.")

    const doctor = await db.doctor.create({
        data: {
            email,
            password,
            name,
            category_id: category.id
        }
    })

    if (!doctor) throw new APIError("Failed creating doctor")

    return doctor
}
