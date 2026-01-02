import { Router } from 'express'
const router = Router()
router.get('/in', (req, res) => res.json({ message: 'Stock in routes' }))
router.get('/out', (req, res) => res.json({ message: 'Stock out routes' }))
export default router
