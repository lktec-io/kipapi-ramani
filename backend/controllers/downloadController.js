import path from 'path'
import fs   from 'fs'
import { fileURLToPath } from 'url'
import * as Download from '../models/downloadModel.js'
import * as Plan     from '../models/planModel.js'

const __dirname  = path.dirname(fileURLToPath(import.meta.url))
// Absolute path to the backend root (one level up from controllers/)
const BACKEND_ROOT = path.resolve(__dirname, '..')
const SECURE_DIR   = path.join(BACKEND_ROOT, 'secure_storage')

export const serveSecureFile = async (req, res, next) => {
  try {
    const { token } = req.params

    // 1. Validate token against DB (checks: exists, not expired, count < max, order paid)
    const record = await Download.findValidToken(token)
    if (!record) {
      return res.status(403).json({
        message: 'Download link is invalid, expired, or has reached its limit.',
      })
    }

    // 2. Retrieve the plan's secure file path (stored as a relative path like "secure_storage/abc.pdf")
    const plan = await Plan.getPlanSecurePath(record.plan_id)
    if (!plan) {
      return res.status(404).json({ message: 'Associated plan not found.' })
    }

    // 3. Resolve to an absolute path and enforce it stays inside secure_storage/
    //    Supports both absolute paths (legacy) and relative paths stored from multer
    const raw = plan.secure_file_path
    const filePath = path.isAbsolute(raw)
      ? path.resolve(raw)
      : path.resolve(BACKEND_ROOT, raw)

    if (!filePath.startsWith(SECURE_DIR)) {
      // Path traversal guard — file must be inside secure_storage/
      console.error(`[SECURITY] Path traversal attempt: ${filePath}`)
      return res.status(403).json({ message: 'Access denied.' })
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Plan file not found on server.' })
    }

    // 4. Increment download count before streaming
    await Download.incrementDownloadCount(token)

    // 5. Stream file with a clean, branded filename (hides the internal random filename)
    const safeTitle = plan.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_')
    const ext       = path.extname(filePath)
    const filename  = `KipapiRamani_${safeTitle}_Plan${ext}`

    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'no-store')  // do not cache secure files

    // res.download() sets Content-Disposition: attachment automatically
    res.download(filePath, filename, (err) => {
      if (err && !res.headersSent) next(err)
    })
  } catch (err) {
    next(err)
  }
}
