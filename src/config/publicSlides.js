/**
 * HERO SLIDE CONFIGURATION — Kipapi Ramani
 * ─────────────────────────────────────────
 * This is the ONLY file you need to edit to update the hero slideshow.
 *
 * HOW TO UPDATE:
 *   1. Place your architectural render images inside `public/hero/`
 *      (e.g. public/hero/slide1.jpg, slide2.jpg, slide3.jpg, slide4.jpg)
 *   2. Update the `image` path strings below to match your filenames.
 *   3. Update the `text` strings to match your chosen headline keyword.
 *   4. Run `npm run build` to compile and deploy.
 *
 * IMAGE GUIDELINES:
 *   • Recommended dimensions : 1440 × 900 px (16:9)
 *   • Minimum width           : 1280 px
 *   • Supported formats       : JPG, WebP, PNG
 *   • Target file size         : ≤ 300 KB per image (use WebP for best results)
 *
 * PATHS:
 *   • All paths are relative to the Vite `public/` root.
 *   • `/hero/slide1.jpg` maps to `public/hero/slide1.jpg` during `npm run dev`
 *     and to `dist/hero/slide1.jpg` after `npm run build`.
 *   • Do NOT use `import` or `require` — just plain string paths.
 *
 * FALLBACK:
 *   • If an image is missing the hero section falls back to the solid
 *     dark navy (#091e35) background defined in Home.css, and the
 *     gradient overlay + text remain fully readable.
 */

export const HERO_SLIDES = [
  {
    text:  'Modern Homes',
    image: '/hero/slide1.jpg',
  },
  {
    text:  'Affordable Bungalows',
    image: '/hero/slide2.jpg',
  },
  {
    text:  'Luxury Apartments',
    image: '/hero/slide3.jpg',
  },
  {
    text:  'Contemporary Layouts',
    image: '/hero/slide4.jpg',
  },
]
