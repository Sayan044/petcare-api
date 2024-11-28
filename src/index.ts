import compression from 'compression'
import cors from 'cors'
import cookieSession from 'cookie-session'
import express, { Application } from 'express'
import morgan from 'morgan'
import { createServer } from 'node:http'
import path from 'node:path'
import { CONFIG } from './config'
import { appointmentRouter, authRouter, bookingRouter, categoryRouter, customerRouter, doctorRouter, dogBreedRouter, recordRouter, serviceRouter, symptomRouter } from './router'

const app: Application = express()
const httpServer = createServer(app)

app.use(cors({
    origin: CONFIG.FRONTEND_URL,
    credentials: true
}))

app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use(cookieSession({
    name: 'petcare_token',
    secret: CONFIG.COOKIE_SECRET,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: CONFIG.NODE_ENV === 'development' ? 'lax' : 'none',
    secure: CONFIG.NODE_ENV === 'development' ? false : true
}))
app.use(compression({
    threshold: 2048, // compress over 2KiB
    level: 6
}))
app.use(express.json())
app.use(morgan('common'))

const router = express.Router()

router.use('/uploads', express.static(path.resolve(CONFIG.UPLOAD_PATH)))

router.use('/auth', authRouter)
router.use('/appointment', appointmentRouter)
router.use('/booking', bookingRouter)
router.use('/category', categoryRouter)
router.use('/dog-breed', dogBreedRouter)
router.use('/symptom', symptomRouter)
router.use('/customer', customerRouter)
router.use('/doctor', doctorRouter)
router.use('/record', recordRouter)
router.use('/service', serviceRouter)

app.use('/api', router)

const port = CONFIG.PORT || 8000
httpServer.listen(port, () => {
    console.log(`SERVER PORT -> ${port}`)
})
