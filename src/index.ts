import compression from 'compression'
import cors from 'cors'
import cookieSession from 'cookie-session'
import express, { Application } from 'express'
import morgan from 'morgan'
import { createServer } from 'node:http'
import { CONFIG } from './config'
import { appointmentRouter, authRouter, bookingRouter, categoryRouter, customerRouter, doctorRouter, recordRouter, serviceRouter } from './router'

const app: Application = express()
const httpServer = createServer(app)

app.use(cors({
    origin: '*',
    credentials: true
}))
app.use(cookieSession({
    name: 'petcare_token',
    secret: CONFIG.COOKIE_SECRET,
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
}))
app.use(compression({
    threshold: 2048, // compress over 2KiB
    level: 6
}))
app.use(express.json())
app.use(morgan('tiny'))

const router = express.Router()

router.use('/auth', authRouter)
router.use('/appointment', appointmentRouter)
router.use('/booking', bookingRouter)
router.use('/category', categoryRouter)
router.use('/customer', customerRouter)
router.use('/doctor', doctorRouter)
router.use('/record', recordRouter)
router.use('/service', serviceRouter)

app.use('/api', router)

const port = CONFIG.PORT || 8000
httpServer.listen(port, () => {
    console.log(`SERVER PORT -> ${port}`)
})
