import { Request, Response } from 'express'
import { createDogBreedInput } from '../lib/types'
import { APIError } from '../lib/errors'
import { createDogBreed, getDogBreeds } from '../service/dogbreed.service'

export async function createDogBreedController(req: Request, res: Response) {
    const parsedData = createDogBreedInput.safeParse(req.body)
    if (!parsedData.success) {
        res.status(411).json({
            message: "You've sent wrong inputs."
        })
        return
    }

    try {
        const dog_breed = await createDogBreed(parsedData.data.breed_name)
        console.log("DOG-BREED CREATED -> ", dog_breed)

        res.status(201).json({ message: "Dog-Breed created successfully" })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error("Error creating dog-breed: ", err.message)
        }
        res.status(500).json({ message: "Failed to create dog-breed" })
    }
}

export async function getDogBreedsController(req: Request, res: Response) {
    try {
        const dog_breeds = await getDogBreeds()

        res.status(200).json({ data: dog_breeds })
    }
    catch (err) {
        if (err instanceof APIError) {
            console.error(err.message)
        }
        res.status(500).json({ data: [] })
    }
}
