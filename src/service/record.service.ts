import { db } from "../config/prisma.config"
import { APIError } from "../lib/errors"

export async function addRecord(pet_name: string, type: string, symptom: string, medical_history: string, document_link: string | null | undefined, pet_documents: string[], last_vaccination: Date, next_vaccination: Date, weight: number, age: string, emergency_contact: string, customer_id: string) {
    const existingDogBreed = await db.dogBreed.findUnique({
        where: {
            breed_name: type
        }
    })

    const existingSymptom = await db.symptom.findUnique({
        where: {
            symptom_name: symptom
        }
    })

    if (!existingDogBreed || !existingSymptom) throw new APIError("Inavlid Dog-Breed or Symptom")

    const record = await db.record.create({
        data: {
            pet_name,
            medical_history,
            document_link,
            pet_documents,
            last_vaccination,
            next_vaccination,
            weight,
            age,
            emergency_contact,
            customer_id,
            dogBreed_id: existingDogBreed.id,
            symptom_id: existingSymptom.id,
        }
    })

    if (!record) throw new APIError("Failed to add record")

    return record
}

export async function getRecordsByCustomerID(customer_id: string) {
    const records = await db.record.findMany({
        where: {
            customer_id
        },
        include: {
            dogBreed: true,
            symptom: true
        }
    })

    if (!records) throw new APIError("Failed to fetch records")

    return records.map(record => ({
        ...record,
        last_vaccination: record.last_vaccination.toLocaleDateString('en-IN'),
        next_vaccination: record.next_vaccination.toLocaleDateString('en-IN'),
        dogBreed: record.dogBreed.breed_name,
        symptom: record.symptom.symptom_name
    }))
}
