import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import routes from './routes'
import { errorHandler } from './shared/middlewares/errorHandler'
import { seedAdmin } from './shared/utils/seedAdmin'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handler
app.use(errorHandler)

// Start server
const startServer = async () => {
  await seedAdmin()
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
  })
}

startServer()

export default app
