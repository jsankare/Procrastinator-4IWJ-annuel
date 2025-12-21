import { Router, Request, Response } from 'express'
import { extractTokenFromHeader, verifyToken } from '../utils/jwt.js'
import { TaskModel, TaskStatus } from '../models/Task.js'

const router = Router()

router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    if (!token) return res.status(401).json({ success: false, message: 'Authorization token required' })
    const payload = verifyToken(token)
    if (!payload) return res.status(401).json({ success: false, message: 'Invalid token' })

    const { workspaceId, assignedTo } = req.query
    let data = []
    if (workspaceId && typeof workspaceId === 'string') data = await TaskModel.findByWorkspace(workspaceId)
    else if (assignedTo && typeof assignedTo === 'string') data = await TaskModel.findByAssignedTo(assignedTo)
    else data = []
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Internal error' })
  }
})

router.patch('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    if (!token) return res.status(401).json({ success: false, message: 'Authorization token required' })
    const payload = verifyToken(token)
    if (!payload) return res.status(401).json({ success: false, message: 'Invalid token' })

    const { status } = req.body
    if (!status) return res.status(400).json({ success: false, message: 'Missing status' })
    const updated = await TaskModel.updateStatus(req.params.id, status as TaskStatus)
    if (!updated) return res.status(404).json({ success: false, message: 'Task not found' })
    res.json({ success: true, data: updated })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Internal error' })
  }
})

export default router
