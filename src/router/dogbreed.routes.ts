import { Router } from 'express'
import { isAdmin } from '../middleware/verifyAdmin'
import { createDogBreedController, getDogBreedsController } from '../controller/dogbreed.controller'

const router = Router()

router.route('/').post(isAdmin, createDogBreedController)
router.route('/').get(getDogBreedsController)

export { router as dogBreedRouter }
