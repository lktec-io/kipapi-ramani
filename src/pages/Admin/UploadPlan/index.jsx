import { useState, useRef } from 'react'
import {
  ImagePlus, FileArchive, UploadCloud, Loader2,
  CheckCircle2, AlertCircle, X, FileCheck2,
} from 'lucide-react'
import './UploadPlan.css'

const EMPTY = {
  title: '', description: '', price: '', style: '',
  bedrooms: '', bathrooms: '', stories: '', plot_size: '',
}

const STYLES   = ['Modern', 'Contemporary', 'Traditional']
const STORIES  = [{ value: '1', label: 'Bungalow (Single-Storey)' }, { value: '2', label: 'Multi-Storey (Ghorofa)' }]
const BEDROOMS = [1, 2, 3, 4, 5]
const BATHS    = [1, 2, 3, 4]

const fmtSize = (bytes) => {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1_048_576)  return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

export default function UploadPlan() {
  const [fields,       setFields]       = useState(EMPTY)
  const [errors,       setErrors]       = useState({})
  const [thumbnail,    setThumbnail]    = useState(null)
  const [thumbPreview, setThumbPreview] = useState(null)
  const [secureFile,   setSecureFile]   = useState(null)
  const [status,       setStatus]       = useState('idle') // idle | uploading | success | error
  const [progress,     setProgress]     = useState(0)

  const thumbRef  = useRef()
  const secureRef = useRef()

  const set = (k, v) => {
    setFields(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }))
  }

  // ── File handlers ────────────────────────────────────────────────────────
  const handleThumbnail = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnail(file)
    const reader = new FileReader()
    reader.onload = ev => setThumbPreview(ev.target.result)
    reader.readAsDataURL(file)
    if (errors.thumbnail) setErrors(p => ({ ...p, thumbnail: '' }))
  }

  const handleSecureFile = (e) => {
    setSecureFile(e.target.files?.[0] || null)
    if (errors.secureFile) setErrors(p => ({ ...p, secureFile: '' }))
  }

  const removeThumbnail = () => {
    setThumbnail(null); setThumbPreview(null)
    thumbRef.current.value = ''
  }

  const removeSecureFile = () => {
    setSecureFile(null)
    secureRef.current.value = ''
  }

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!fields.title.trim())       errs.title       = 'Plan title is required.'
    if (!fields.price || isNaN(Number(fields.price))) errs.price = 'Enter a valid price in TZS.'
    if (!fields.style)              errs.style       = 'Select an architectural style.'
    if (!fields.bedrooms)           errs.bedrooms    = 'Select number of bedrooms.'
    if (!fields.bathrooms)          errs.bathrooms   = 'Select number of bathrooms.'
    if (!fields.stories)            errs.stories     = 'Select storey type.'
    if (!thumbnail)                 errs.thumbnail   = 'A thumbnail image is required.'
    if (!secureFile)                errs.secureFile  = 'A plan file (PDF / AutoCAD) is required.'
    return errs
  }

  // ── Submit (simulated multipart upload) ─────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setStatus('uploading')
    setProgress(0)

    // Simulate chunked upload progress
    const tick = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(tick); return p }
        return p + Math.random() * 18
      })
    }, 220)

    await new Promise(r => setTimeout(r, 2600))
    clearInterval(tick)
    setProgress(100)

    await new Promise(r => setTimeout(r, 400))
    setStatus('success')

    // Reset after 4 seconds
    setTimeout(() => {
      setStatus('idle')
      setProgress(0)
      setFields(EMPTY)
      setThumbnail(null)
      setThumbPreview(null)
      setSecureFile(null)
      if (thumbRef.current)  thumbRef.current.value  = ''
      if (secureRef.current) secureRef.current.value = ''
    }, 4000)
  }

  const uploading = status === 'uploading'

  return (
    <div className="upload-page">

      <div className="admin-page-header">
        <div>
          <p className="admin-page-header__eyebrow">Inventory</p>
          <h1 className="admin-page-header__title">Upload New Plan</h1>
        </div>
      </div>

      {/* Success banner */}
      {status === 'success' && (
        <div className="upload-alert upload-alert--success">
          <CheckCircle2 size={18} strokeWidth={2} />
          <div>
            <strong>Plan uploaded successfully!</strong>
            <p>It is now live in the catalogue. The form will reset shortly.</p>
          </div>
        </div>
      )}

      <form className="upload-form" onSubmit={handleSubmit} noValidate>

        {/* ── Plan Details ──────────────────────────────────────────────── */}
        <section className="upload-section">
          <h2 className="upload-section__title">Plan Details</h2>

          {/* Title — full width */}
          <div className="upload-field upload-field--full">
            <label className="upload-label" htmlFor="u-title">Plan Title *</label>
            <input
              id="u-title" type="text" className={`upload-input${errors.title ? ' upload-input--err' : ''}`}
              placeholder="e.g. Villa Serena" value={fields.title}
              onChange={e => set('title', e.target.value)} disabled={uploading}
            />
            {errors.title && <span className="upload-err">{errors.title}</span>}
          </div>

          {/* Description — full width */}
          <div className="upload-field upload-field--full">
            <label className="upload-label" htmlFor="u-desc">Description</label>
            <textarea
              id="u-desc" rows={4} className="upload-input upload-textarea"
              placeholder="Describe the architectural highlights, features, and ideal buyer profile…"
              value={fields.description} onChange={e => set('description', e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Price + Style */}
          <div className="upload-field">
            <label className="upload-label" htmlFor="u-price">Price (TZS) *</label>
            <input
              id="u-price" type="number" min="0"
              className={`upload-input${errors.price ? ' upload-input--err' : ''}`}
              placeholder="e.g. 1400000" value={fields.price}
              onChange={e => set('price', e.target.value)} disabled={uploading}
            />
            {errors.price && <span className="upload-err">{errors.price}</span>}
          </div>

          <div className="upload-field">
            <label className="upload-label" htmlFor="u-style">Architectural Style *</label>
            <div className="upload-select-wrap">
              <select
                id="u-style" className={`upload-select${errors.style ? ' upload-input--err' : ''}`}
                value={fields.style} onChange={e => set('style', e.target.value)} disabled={uploading}
              >
                <option value="">Select style…</option>
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {errors.style && <span className="upload-err">{errors.style}</span>}
          </div>

          {/* Bedrooms + Bathrooms + Stories + Plot */}
          <div className="upload-field">
            <label className="upload-label" htmlFor="u-bed">Bedrooms *</label>
            <div className="upload-select-wrap">
              <select
                id="u-bed" className={`upload-select${errors.bedrooms ? ' upload-input--err' : ''}`}
                value={fields.bedrooms} onChange={e => set('bedrooms', e.target.value)} disabled={uploading}
              >
                <option value="">Select…</option>
                {BEDROOMS.map(n => <option key={n} value={n}>{n} Bedroom{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            {errors.bedrooms && <span className="upload-err">{errors.bedrooms}</span>}
          </div>

          <div className="upload-field">
            <label className="upload-label" htmlFor="u-bath">Bathrooms *</label>
            <div className="upload-select-wrap">
              <select
                id="u-bath" className={`upload-select${errors.bathrooms ? ' upload-input--err' : ''}`}
                value={fields.bathrooms} onChange={e => set('bathrooms', e.target.value)} disabled={uploading}
              >
                <option value="">Select…</option>
                {BATHS.map(n => <option key={n} value={n}>{n} Bathroom{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            {errors.bathrooms && <span className="upload-err">{errors.bathrooms}</span>}
          </div>

          <div className="upload-field">
            <label className="upload-label" htmlFor="u-stories">Stories *</label>
            <div className="upload-select-wrap">
              <select
                id="u-stories" className={`upload-select${errors.stories ? ' upload-input--err' : ''}`}
                value={fields.stories} onChange={e => set('stories', e.target.value)} disabled={uploading}
              >
                <option value="">Select…</option>
                {STORIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {errors.stories && <span className="upload-err">{errors.stories}</span>}
          </div>

          <div className="upload-field">
            <label className="upload-label" htmlFor="u-plot">Plot Size</label>
            <input
              id="u-plot" type="text"
              className="upload-input"
              placeholder="e.g. 15m × 20m"
              value={fields.plot_size} onChange={e => set('plot_size', e.target.value)}
              disabled={uploading}
            />
          </div>
        </section>

        {/* ── File Uploads ──────────────────────────────────────────────── */}
        <section className="upload-section">
          <h2 className="upload-section__title">File Uploads</h2>

          {/* Thumbnail */}
          <div className="upload-field upload-field--full">
            <label className="upload-label">
              Public Thumbnail Image *
              <span className="upload-label__hint"> — JPEG, PNG, WebP · Max 5 MB</span>
            </label>

            {thumbPreview ? (
              <div className="thumb-preview">
                <img src={thumbPreview} alt="Thumbnail preview" className="thumb-preview__img" />
                <div className="thumb-preview__info">
                  <span className="thumb-preview__name">{thumbnail.name}</span>
                  <span className="thumb-preview__size">{fmtSize(thumbnail.size)}</span>
                </div>
                <button type="button" className="thumb-preview__remove" onClick={removeThumbnail} disabled={uploading}>
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`upload-dropzone${errors.thumbnail ? ' upload-dropzone--err' : ''}`}
                onClick={() => thumbRef.current.click()}
                disabled={uploading}
              >
                <ImagePlus size={28} strokeWidth={1.5} />
                <span className="upload-dropzone__main">Click to upload thumbnail</span>
                <span className="upload-dropzone__sub">Recommended: 800×600px, JPEG or PNG</span>
              </button>
            )}
            <input
              ref={thumbRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="upload-file-hidden" onChange={handleThumbnail}
            />
            {errors.thumbnail && <span className="upload-err">{errors.thumbnail}</span>}
          </div>

          {/* Secure plan file */}
          <div className="upload-field upload-field--full">
            <label className="upload-label">
              Secure Plan Files *
              <span className="upload-label__hint"> — PDF, DWG, DXF, or ZIP · Max 100 MB</span>
            </label>

            {secureFile ? (
              <div className="secure-file-preview">
                <FileCheck2 size={20} strokeWidth={1.75} className="secure-file-preview__icon" />
                <div className="secure-file-preview__info">
                  <span className="secure-file-preview__name">{secureFile.name}</span>
                  <span className="secure-file-preview__size">{fmtSize(secureFile.size)}</span>
                </div>
                <button type="button" className="thumb-preview__remove" onClick={removeSecureFile} disabled={uploading}>
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`upload-dropzone upload-dropzone--secure${errors.secureFile ? ' upload-dropzone--err' : ''}`}
                onClick={() => secureRef.current.click()}
                disabled={uploading}
              >
                <FileArchive size={28} strokeWidth={1.5} />
                <span className="upload-dropzone__main">Click to upload plan files</span>
                <span className="upload-dropzone__sub">Stored securely — never publicly accessible via direct URL</span>
              </button>
            )}
            <input
              ref={secureRef} type="file" accept=".pdf,.dwg,.dxf,.zip"
              className="upload-file-hidden" onChange={handleSecureFile}
            />
            {errors.secureFile && <span className="upload-err">{errors.secureFile}</span>}
          </div>
        </section>

        {/* ── Progress + Submit ──────────────────────────────────────────── */}
        {uploading && (
          <div className="upload-progress">
            <div className="upload-progress__bar-wrap">
              <div
                className="upload-progress__bar"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="upload-progress__label">
              Uploading… {Math.min(Math.round(progress), 100)}%
            </span>
          </div>
        )}

        <div className="upload-actions">
          <button type="submit" className="upload-submit-btn" disabled={uploading || status === 'success'}>
            {uploading
              ? <><Loader2 size={18} className="auth-spinner" /> Uploading…</>
              : <><UploadCloud size={18} strokeWidth={1.75} /> Publish Plan to Catalogue</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
