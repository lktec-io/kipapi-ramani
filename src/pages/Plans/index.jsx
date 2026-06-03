import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown, Loader2, WifiOff } from 'lucide-react'
import PlanCard from '../../components/ui/PlanCard/PlanCard.jsx'
import { fetchPlans } from '../../services/plansService.js'
import { mockPlans, STYLES, MAX_PRICE } from '../../services/mockPlans.js'
import { formatTZS } from '../../utils/formatters.js'
import './Plans.css'

/* ── Static filter options ──────────────────────────────────────────────── */
const STYLE_OPTIONS    = STYLES  // ['Modern', 'Contemporary', 'Traditional']
const BEDROOM_OPTIONS  = ['1', '2', '3', '4', '5+']
const BATHROOM_OPTIONS = ['1', '2', '3', '4+']
const FLOOR_OPTIONS    = [
  { label: 'Bungalow (Single Floor)', value: '1' },
  { label: 'Multi-Storey (Ghorofa)', value: '2' },
]

const SORT_OPTIONS = [
  { label: 'Newest First',       value: 'newest'     },
  { label: 'Price: Low → High',  value: 'price_asc'  },
  { label: 'Price: High → Low',  value: 'price_desc' },
  { label: 'Name A → Z',         value: 'name_asc'   },
]

const sortList = (list, sort) => {
  const arr = [...list]
  switch (sort) {
    case 'price_asc':  return arr.sort((a, b) => a.price - b.price)
    case 'price_desc': return arr.sort((a, b) => b.price - a.price)
    case 'name_asc':   return arr.sort((a, b) => a.title.localeCompare(b.title))
    default:           return arr.sort((a, b) => b.id - a.id)
  }
}

/* ── Accordion section component ────────────────────────────────────────── */
function AccordionSection({ label, isOpen, onToggle, children }) {
  return (
    <div className="accordion">
      <button
        className={`accordion__header${isOpen ? ' accordion__header--open' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        type="button"
      >
        <span>{label}</span>
        <ChevronDown size={15} strokeWidth={2.2} className="accordion__chevron" />
      </button>
      {isOpen && (
        <div className="accordion__body" role="region">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Single-select checkbox (acts like radio: uncheck if already selected) ─ */
function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="filter-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="filter-checkbox__input"
      />
      <span className="filter-checkbox__label">{label}</span>
    </label>
  )
}

export default function PlansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters,  setShowFilters]  = useState(false)
  const [localSearch,  setLocalSearch]  = useState(searchParams.get('search') || '')

  // Accordion open/closed state
  const [openSections, setOpenSections] = useState({
    style:     true,
    bedrooms:  true,
    bathrooms: false,
    stories:   false,
  })

  const toggleSection = (key) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  // ── API state ──────────────────────────────────────────────────────────
  const [rawPlans,  setRawPlans]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [apiError,  setApiError]  = useState(null)
  const debounceRef = useRef(null)

  // Read filter state from URL (including bathroom which is client-side)
  const filters = {
    search:    searchParams.get('search')    || '',
    style:     searchParams.get('style')     || '',
    bedrooms:  searchParams.get('bedrooms')  || '',
    bathrooms: searchParams.get('bathrooms') || '',
    stories:   searchParams.get('stories')   || '',
    maxPrice:  Number(searchParams.get('maxPrice')) || MAX_PRICE,
    sort:      searchParams.get('sort')      || 'newest',
  }

  // Sync local search when URL changes externally
  useEffect(() => {
    setLocalSearch(searchParams.get('search') || '')
  }, [searchParams])

  // ── Fetch from API on filter changes (bathrooms stays client-side) ──────
  useEffect(() => {
    setLoading(true)
    setApiError(null)

    const params = {}
    if (filters.search)               params.search   = filters.search
    if (filters.style)                params.style    = filters.style
    if (filters.bedrooms)             params.bedrooms = filters.bedrooms
    if (filters.stories)              params.stories  = filters.stories
    if (filters.maxPrice < MAX_PRICE) params.maxPrice = filters.maxPrice

    fetchPlans(params)
      .then(data  => { setRawPlans(data); setApiError(null) })
      .catch(err  => {
        console.warn('[Plans] API offline, using mock data:', err.message)
        setApiError(err.message)
        setRawPlans([...mockPlans])
      })
      .finally(() => setLoading(false))
  }, [
    filters.search, filters.style, filters.bedrooms,
    filters.stories, filters.maxPrice,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ])

  // Client-side sort + bathroom filter (bathroom not in backend model yet)
  const results = useMemo(() => {
    let list = sortList(rawPlans, filters.sort)
    if (filters.bathrooms) {
      const b = Number(filters.bathrooms.replace('+', ''))
      const isPlus = filters.bathrooms.includes('+')
      list = list.filter(p => isPlus ? p.bathrooms >= b : p.bathrooms === b)
    }
    return list
  }, [rawPlans, filters.sort, filters.bathrooms])

  // ── Filter update helpers ──────────────────────────────────────────────
  const updateFilter = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value !== '' && value != null) next.set(key, String(value))
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  // Toggle a single-select filter (click active → clear)
  const toggleFilter = useCallback((key, value) => {
    updateFilter(key, filters[key] === value ? '' : value)
  }, [filters, updateFilter])

  const clearAllFilters = () => {
    setLocalSearch('')
    setSearchParams({}, { replace: true })
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setLocalSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateFilter('search', val.trim()), 400)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    updateFilter('search', localSearch.trim())
  }

  const hasActiveFilters =
    filters.search || filters.style || filters.bedrooms ||
    filters.bathrooms || filters.stories || filters.maxPrice < MAX_PRICE

  return (
    <div className="plans-page">

      {/* ── "Our Products" hero header ───────────────────────────────── */}
      <div className="products-hero">
        <div className="products-hero__inner">
          <p className="products-hero__eyebrow">Catalogue</p>
          <h1 className="products-hero__title">Our Products</h1>
          <p className="products-hero__desc">
            Explore our full range of architect-designed, engineer-verified house plans
            — available for immediate download and certified for council submission
            across Tanzania. Each plan includes PDF drawings, AutoCAD files, and full
            structural specifications.
          </p>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="plans-body">

        {/* Mobile filter toggle */}
        <button
          className={`filter-toggle${showFilters ? ' filter-toggle--open' : ''}`}
          onClick={() => setShowFilters(v => !v)}
          aria-expanded={showFilters}
          aria-controls="filter-sidebar"
          type="button"
        >
          <SlidersHorizontal size={16} strokeWidth={1.75} />
          {showFilters ? 'Hide Filters' : 'Filter Products'}
          {hasActiveFilters && <span className="filter-toggle__dot" aria-hidden="true" />}
        </button>

        {/* ── SIDEBAR — accordion filters ──────────────────────────── */}
        <aside
          id="filter-sidebar"
          className={`filter-sidebar${showFilters ? ' filter-sidebar--open' : ''}`}
          aria-label="Filter products"
        >
          {/* Sidebar header */}
          <div className="filter-sidebar__head">
            <h2 className="filter-sidebar__title">
              <SlidersHorizontal size={15} strokeWidth={1.75} />
              Filter
            </h2>
            {hasActiveFilters && (
              <button className="filter-clear-btn" onClick={clearAllFilters} type="button">
                <X size={12} /> Reset
              </button>
            )}
          </div>

          {/* Search */}
          <div className="filter-search-block">
            <form onSubmit={handleSearchSubmit} className="filter-search-form">
              <Search size={14} className="filter-search-icon" strokeWidth={1.75} />
              <input
                id="sidebar-search"
                type="search"
                className="filter-input"
                placeholder="Search plans…"
                value={localSearch}
                onChange={handleSearchChange}
                aria-label="Search plans"
              />
            </form>
          </div>

          {/* ── Accordion: Product Type (Style) ────────────────────── */}
          <AccordionSection
            label="Product Type"
            isOpen={openSections.style}
            onToggle={() => toggleSection('style')}
          >
            {STYLE_OPTIONS.map(s => (
              <FilterCheckbox
                key={s}
                label={s}
                checked={filters.style === s}
                onChange={() => toggleFilter('style', s)}
              />
            ))}
          </AccordionSection>

          {/* ── Accordion: Number of Bedrooms ──────────────────────── */}
          <AccordionSection
            label="Number of Bedrooms"
            isOpen={openSections.bedrooms}
            onToggle={() => toggleSection('bedrooms')}
          >
            {BEDROOM_OPTIONS.map(val => (
              <FilterCheckbox
                key={val}
                label={`${val} Bedroom${val !== '1' ? 's' : ''}`}
                checked={filters.bedrooms === val}
                onChange={() => toggleFilter('bedrooms', val)}
              />
            ))}
          </AccordionSection>

          {/* ── Accordion: Number of Bathrooms ─────────────────────── */}
          <AccordionSection
            label="Number of Bathrooms"
            isOpen={openSections.bathrooms}
            onToggle={() => toggleSection('bathrooms')}
          >
            {BATHROOM_OPTIONS.map(val => (
              <FilterCheckbox
                key={val}
                label={`${val} Bathroom${!val.includes('+') && val !== '1' ? 's' : ''}${val.includes('+') ? '+' : ''}`}
                checked={filters.bathrooms === val}
                onChange={() => toggleFilter('bathrooms', val)}
              />
            ))}
          </AccordionSection>

          {/* ── Accordion: Number of Floors ────────────────────────── */}
          <AccordionSection
            label="Number of Floors"
            isOpen={openSections.stories}
            onToggle={() => toggleSection('stories')}
          >
            {FLOOR_OPTIONS.map(o => (
              <FilterCheckbox
                key={o.value}
                label={o.label}
                checked={filters.stories === o.value}
                onChange={() => toggleFilter('stories', o.value)}
              />
            ))}
          </AccordionSection>

          {/* Max Price range (non-accordion) */}
          <div className="filter-price-block">
            <div className="filter-price-label">
              <span>Max Price</span>
              <span className="filter-price-value">{formatTZS(filters.maxPrice)}</span>
            </div>
            <input
              id="price-range"
              type="range"
              className="filter-range"
              min={0}
              max={MAX_PRICE}
              step={100_000}
              value={filters.maxPrice}
              onChange={e => updateFilter('maxPrice', Number(e.target.value))}
              aria-label="Maximum price"
            />
            <div className="filter-range-labels">
              <span>TSh 0</span>
              <span>{formatTZS(MAX_PRICE)}</span>
            </div>
          </div>
        </aside>

        {/* ── GRID area ─────────────────────────────────────────────── */}
        <div className="plans-grid-wrap">

          {/* Count + sort bar */}
          <div className="plans-grid-toolbar">
            <span className="plans-grid-toolbar__count">
              {loading ? 'Loading…' : (
                <>
                  {results.length} product{results.length !== 1 ? 's' : ''}
                  {apiError && <span className="plans-header__offline"> · offline</span>}
                </>
              )}
            </span>
            <div className="sort-select-wrap">
              <select
                className="sort-select"
                value={filters.sort}
                onChange={e => updateFilter('sort', e.target.value)}
                aria-label="Sort plans by"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="sort-select__icon" />
            </div>
          </div>

          {/* Plans grid */}
          {loading ? (
            <div className="plans-loading">
              <Loader2 size={36} strokeWidth={1.5} className="auth-spinner" />
              <p>Loading products…</p>
            </div>
          ) : results.length === 0 ? (
            <div className="plans-empty">
              <p className="plans-empty__title">No products match your filters.</p>
              <p className="plans-empty__sub">Try adjusting or resetting your search criteria.</p>
              <button className="plans-empty__reset" onClick={clearAllFilters} type="button">
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              {apiError && (
                <div className="plans-offline-banner">
                  <WifiOff size={14} strokeWidth={1.75} />
                  Showing cached products — server not reachable
                </div>
              )}
              <div className="plans-grid">
                {results.map((plan, i) => (
                  <div
                    key={plan.id}
                    className="plans-grid__item"
                    style={{ '--stagger-delay': `${Math.min(i * 55, 440)}ms` }}
                  >
                    <PlanCard plan={plan} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
