import { Router } from 'express'
import transferController from './transfer.controller'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()

router.use(authMiddleware)

router.get('/sophieu', transferController.getSoPhieu)
router.get('/', transferController.getAll)
router.get('/:id', transferController.getById)
router.post('/', transferController.create)
router.put('/:id', transferController.update)
router.delete('/:id', transferController.delete)

export default router
