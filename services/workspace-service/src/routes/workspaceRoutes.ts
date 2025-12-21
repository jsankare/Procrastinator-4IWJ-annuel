// @ts-ignore: types resolved in container runtime
import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import { extractTokenFromHeader, verifyToken } from '../utils/jwt.js'
import Database from '../config/database.js'
import { WorkspaceModel } from '../models/Workspace.js'

const router = Router()

// Types relaxed to avoid IDE namespace errors
router.get('/workspaces', async (req: any, res: any) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    if (!token) return res.status(401).json({ success: false, message: 'Authorization token required' })
    const payload = verifyToken(token)
    if (!payload) return res.status(401).json({ success: false, message: 'Invalid token' })

    const items = await WorkspaceModel.findByMember(payload.userId)
    res.json({ success: true, data: items })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Internal error' })
  }
})

router.get('/workspaces/:id', async (req: any, res: any) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    if (!token) return res.status(401).json({ success: false, message: 'Authorization token required' })
    const payload = verifyToken(token)
    if (!payload) return res.status(401).json({ success: false, message: 'Invalid token' })

    const item = await WorkspaceModel.findById(req.params.id)
    if (!item || !item.members.includes(payload.userId)) {
      return res.status(404).json({ success: false, message: 'Workspace not found' })
    }
    res.json({ success: true, data: item })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Internal error' })
  }
})

router.post('/workspaces', async (req: any, res: any) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    if (!token) return res.status(401).json({ success: false, message: 'Authorization token required' })
    const payload = verifyToken(token)
    if (!payload) return res.status(401).json({ success: false, message: 'Invalid token' })

    const { name, description, visibility } = req.body
    if (!name || !visibility) return res.status(400).json({ success: false, message: 'Missing fields' })

    const inviteCode = nanoid(10)
    const ws = await WorkspaceModel.create(payload.userId, { name, description, visibility, inviteCode })
    res.status(201).json({ success: true, data: ws })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Internal error' })
  }
})

router.post('/workspaces/join', async (req: any, res: any) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    if (!token) return res.status(401).json({ success: false, message: 'Authorization token required' })
    const payload = verifyToken(token)
    if (!payload) return res.status(401).json({ success: false, message: 'Invalid token' })

    const { invite } = req.body
    if (!invite) return res.status(400).json({ success: false, message: 'Invite code required' })

    const ws = await WorkspaceModel.findByInvite(invite)
    if (!ws) return res.status(404).json({ success: false, message: 'Invalid invite code' })

    const updated = await WorkspaceModel.addMember(ws._id!, payload.userId)
    res.json({ success: true, data: updated })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Internal error' })
  }
})

export default router
