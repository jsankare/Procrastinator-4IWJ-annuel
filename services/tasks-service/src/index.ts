import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import Database from './config/database.js'
import taskRoutes from './routes/taskRoutes.js'
import { TaskModel } from './models/Task.js'

const PORT = process.env.PORT || 3002
const app = express()

app.use(helmet())
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:85'], credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/', taskRoutes)

async function start() {
  const db = Database.getInstance()
  await db.connect()
  TaskModel.initialize()
  app.listen(PORT, () => console.log(`tasks-service listening on ${PORT}`))
}

start().catch(err => {
  console.error('Failed to start tasks-service', err)
  process.exit(1)
})
