import { Router } from 'express'
import { AuthController } from './auth.controller'
import { authMiddleware, adminMiddleware } from '../../shared/middlewares/auth'

const router = Router()
const authController = new AuthController()

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)

// Authenticated routes
router.get('/me', authMiddleware, authController.me)
router.post('/change-password', authMiddleware, authController.changePassword)

// Admin routes - User management
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers)
router.get('/users/:id', authMiddleware, adminMiddleware, authController.getUserById)
router.post('/users', authMiddleware, adminMiddleware, authController.createUser)
router.put('/users/:id', authMiddleware, adminMiddleware, authController.updateUser)
router.post('/users/:id/reset-password', authMiddleware, adminMiddleware, authController.resetPassword)
router.delete('/users/:id', authMiddleware, adminMiddleware, authController.deleteUser)

export default router
