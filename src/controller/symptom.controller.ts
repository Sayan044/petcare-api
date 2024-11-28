import { Request, Response } from 'express'
import { createSymptomInput } from '../lib/types'
import { APIError } from '../lib/errors'
import { createSymptom, getSymptoms } from '../service/symptom.service'

export async function createSymptomController(req: Request, res: Response) {
    const parsedData = createSymptomInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    try {
        const symptom = await createSymptom(parsedData.data.symptom_name)
        console.log("SYMPTOM CREATED -> ", symptom)

        res.status(201).json({ message: "Symptom created successfully" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error creating symptom: ", err.message)
        }
        res.status(500).json({ message: "Failed to create symptom" })
    }
}

export async function getSymptomsController(req: Request, res: Response) {
    try {
        const symptoms = await getSymptoms()

        res.status(200).json({ data: symptoms })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error(err.message)
        }
        res.status(500).json({ data: [] })
    }
}
