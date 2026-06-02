import { Router } from 'express'
import { serveSecureFile } from '../controllers/downloadController.js'

const router = Router()

// No auth middleware — token IS the auth. Controller validates it against DB.
router.get('/:token', serveSecureFile)

export default router
