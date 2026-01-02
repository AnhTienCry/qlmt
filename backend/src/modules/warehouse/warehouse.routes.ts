import { Router } from 'express'
const router = Router()
router.get('/', (req, res) => res.json({ message: 'Warehouse routes' }))
export default router
