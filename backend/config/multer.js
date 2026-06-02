import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

// Single storage config that routes each field to the correct directory
const planStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail')    return cb(null, 'uploads/thumbnails/')
    if (file.fieldname === 'secure_file')  return cb(null, 'secure_storage/')
    cb(new Error(`Unexpected field: ${file.fieldname}`))
  },
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(16).toString('hex')
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`)
  },
})

const planFileFilter = (req, file, cb) => {
  const allowedImages  = /\.(jpe?g|png|webp)$/i
  const allowedSecure  = /\.(pdf|dwg|dxf|zip)$/i
  const ext = path.extname(file.originalname)

  if (file.fieldname === 'thumbnail'   && allowedImages.test(ext)) return cb(null, true)
  if (file.fieldname === 'secure_file' && allowedSecure.test(ext)) return cb(null, true)

  cb(new Error(`Invalid file type "${ext}" for field "${file.fieldname}"`))
}

// Used on POST /api/plans — handles both fields in one pass
export const uploadPlanFiles = multer({
  storage: planStorage,
  fileFilter: planFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB cap (secure files can be large)
}).fields([
  { name: 'thumbnail',   maxCount: 1 },
  { name: 'secure_file', maxCount: 1 },
])
