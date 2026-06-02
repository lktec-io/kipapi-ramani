import { Router } from 'express'
import {
  getPlans, getPlan, createPlan, updatePlan, deletePlan,
} from '../controllers/plansController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
import { uploadPlanFiles } from '../config/multer.js'

const router = Router()

// Public routes
router.get('/', getPlans)
router.get('/:id', getPlan)

// Admin-only routes
router.post('/', protect, adminOnly, uploadPlanFiles, createPlan)
router.put('/:id', protect, adminOnly, updatePlan)
router.delete('/:id', protect, adminOnly, deletePlan)

export default router
