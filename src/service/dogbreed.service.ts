import { DogBreed } from "@prisma/client";
import { db } from "../config/prisma.config";
import { APIError } from "../lib/errors";

export async function createDogBreed(breed_name: string): Promise<DogBreed> {
    const dog_breed = await db.dogBreed.create({
        data: {
            breed_name
        }
    })

    if (!dog_breed) throw new APIError("Dog breed not created")

    return dog_breed
}

export async function getDogBreeds(): Promise<Array<string>> {
    const dog_breeds = await db.dogBreed.findMany({
        select: {
            breed_name: true
        }
    })

    if (!dog_breeds) throw new APIError("Failed to fetch dog-breeds")

    return dog_breeds.map((dog_breed) => dog_breed.breed_name)
}
