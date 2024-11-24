import { DogBreed, Symptom } from "@prisma/client"
import { db } from "../config/prisma.config"
import { APIError } from "../lib/errors"

export async function addRecord(type: DogBreed, pet_name: string, medical_history: string, document_link: string[], pet_documents: string[], symptom: Symptom, last_vaccination: Date, next_vaccination: Date, weight: number, age: string, emergency_contact: string, customer_id: string) {
    const record = await db.record.create({
        data: {
            type,
            pet_name,
            medical_history,
            document_link,
            pet_documents,
            symptom,
            last_vaccination,
            next_vaccination,
            weight,
            age,
            emergency_contact,
            customer_id
        }
    })

    if (!record) throw new APIError("Failed to add record")

    return record
}

export async function getRecordsByCustomerID(customer_id: string) {
    const records = await db.record.findMany({
        where: {
            customer_id
        }
    })

    if (!records) throw new APIError("Failed to fetch records")

    return records
}
