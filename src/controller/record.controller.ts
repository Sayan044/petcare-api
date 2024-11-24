import { Request, Response } from 'express'
import { createRecordInput } from '../lib/types'
import { convertToLinuxPathStyle, convertToURL, parseDogBreed, parseSymptom, parseUploadPath } from '../utils/parse'
import { addRecord, getRecordsByCustomerID } from '../service/record.service'
import { APIError } from '../lib/errors'

export async function uploadRecordController(req: Request, res: Response) {
    // @ts-ignore
    const customerID = req.customerID

    // @ts-ignore
    const pet_documents = req.files['documents'].map((document) => parseUploadPath(convertToLinuxPathStyle(document.path))) as string[]

    const parsedData = createRecordInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    const dogBreed = parseDogBreed(parsedData.data.type)
    const symptom = parseSymptom(parsedData.data.symptom)
    if (!dogBreed || !symptom) {
        res.status(400).json({
            message: "Invalid breed or symptom."
        })
        return
    }

    const lastVaccinationDate = new Date(parsedData.data.last_vaccination)
    const nextVaccinationDate = new Date(parsedData.data.next_vaccination)
    if (isNaN(lastVaccinationDate.getTime()) || isNaN(nextVaccinationDate.getTime())) {
        res.status(400).json({
            message: "Invalid date format"
        })
        return
    }

    try {
        const record = await addRecord(
            dogBreed,
            parsedData.data.pet_name,
            parsedData.data.medical_history,
            [parsedData.data.document_link],
            pet_documents,
            symptom,
            lastVaccinationDate,
            nextVaccinationDate,
            parseFloat(parsedData.data.weight),
            parsedData.data.age,
            parsedData.data.emergency_contact,
            customerID
        )
        console.log("RECORD ADDED -> ", record)

        res.status(201).json({ message: "Record added successfully" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error adding record: ", err.message)

            res.status(500).json({ message: err.message })
        }
    }
}

export async function getRecordController(req: Request, res: Response) {
    // @ts-ignore
    const customerID = req.customerID

    try {
        const records = await getRecordsByCustomerID(customerID)

        const updatedRecords = records.map((record) => ({
            ...record,
            pet_documents: record.pet_documents.map((item) => convertToURL(item))
        }))

        res.status(200).json({ data: updatedRecords })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error fetching records: ", err.message)

            res.status(500).json({ message: err.message })
        }
    }
}
