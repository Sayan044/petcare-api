import { Symptom } from "@prisma/client";
import { db } from "../config/prisma.config";
import { APIError } from "../lib/errors";

export async function createSymptom(symptom_name: string): Promise<Symptom> {
    const symptom = await db.symptom.create({
        data: {
            symptom_name
        }
    })

    if (!symptom) throw new APIError("Symptom not created")

    return symptom
}

export async function getSymptoms(): Promise<Array<string>> {
    const symptoms = await db.symptom.findMany({
        select: {
            symptom_name: true
        }
    })

    if (!symptoms) throw new APIError("Failed to fetch symptoms")

    return symptoms.map((symptom) => symptom.symptom_name)
}
