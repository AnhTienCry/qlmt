import { Router } from 'express'
import { AuthController } from './auth.controller'
import { authMiddleware } from '../../shared/middlewares/auth'

const router = Router()
const authController = new AuthController()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', authMiddleware, authController.me)
router.post('/logout', authController.logout)

export default router
