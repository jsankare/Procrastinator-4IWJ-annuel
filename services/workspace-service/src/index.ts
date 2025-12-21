import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import Database from './config/database.js'
import workspaceRoutes from './routes/workspaceRoutes.js'
import { WorkspaceModel } from './models/Workspace.js'

const PORT = process.env.PORT || 3004
const app = express()

app.use(helmet())
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:85'], credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/', workspaceRoutes)

async function start() {
  const db = Database.getInstance()
  await db.connect()
  WorkspaceModel.initialize()
  app.listen(PORT, () => console.log(`workspace-service listening on ${PORT}`))
}

start().catch(err => {
  console.error('Failed to start workspace-service', err)
  process.exit(1)
})
