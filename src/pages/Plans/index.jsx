import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown, Loader2, WifiOff } from 'lucide-react'
import PlanCard from '../../components/ui/PlanCard/PlanCard.jsx'
import { fetchPlans } from '../../services/plansService.js'
import { mockPlans, STYLES, MAX_PRICE } from '../../services/mockPlans.js' // offline fallback
import { formatTZS } from '../../utils/formatters.js'
import './Plans.css'

const BEDROOM_OPTIONS = [
  { label: 'All', value: '' },
  { label: '1',   value: '1' },
  { label: '2',   value: '2' },
  { label: '3',   value: '3' },
  { label: '4',   value: '4' },
  { label: '5+',  value: '5' },
]

const STORY_OPTIONS = [
  { label: 'All',                       value: '' },
  { label: 'Bungalow (Single)',          value: '1' },
  { label: 'Multi-Storey (Ghorofa)',     value: '2' },
]

const SORT_OPTIONS = [
  { label: 'Newest First',      value: 'newest'     },
  { label: 'Price: Low → High', value: 'price_asc'  },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Name A → Z',        value: 'name_asc'   },
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

export default function PlansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters,  setShowFilters]  = useState(false)
  const [localSearch,  setLocalSearch]  = useState(searchParams.get('search') || '')

  // ── API state ───────────────────────────────────────────────────────────
  const [rawPlans,  setRawPlans]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [apiError,  setApiError]  = useState(null) // null = ok, string = offline/error
  const debounceRef = useRef(null)

  // Read filter state from URL
  const filters = {
    search:   searchParams.get('search')   || '',
    style:    searchParams.get('style')    || '',
    bedrooms: searchParams.get('bedrooms') || '',
    stories:  searchParams.get('stories')  || '',
    maxPrice: Number(searchParams.get('maxPrice')) || MAX_PRICE,
    sort:     searchParams.get('sort')     || 'newest',
  }

  // Sync local search input when URL changes externally (e.g. hero search bar)
  useEffect(() => {
    setLocalSearch(searchParams.get('search') || '')
  }, [searchParams])

  // ── Fetch from API whenever structural filters change ───────────────────
  useEffect(() => {
    setLoading(true)
    setApiError(null)

    const params = {}
    if (filters.search)              params.search   = filters.search
    if (filters.style)               params.style    = filters.style
    if (filters.bedrooms)            params.bedrooms = filters.bedrooms
    if (filters.stories)             params.stories  = filters.stories
    if (filters.maxPrice < MAX_PRICE) params.maxPrice = filters.maxPrice

    fetchPlans(params)
      .then(data => { setRawPlans(data); setApiError(null) })
      .catch(err => {
        console.warn('[Plans] API unavailable, falling back to mock data:', err.message)
        setApiError(err.message)
        setRawPlans([...mockPlans]) // graceful offline fallback
      })
      .finally(() => setLoading(false))
  }, [
    filters.search, filters.style, filters.bedrooms,
    filters.stories, filters.maxPrice,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ])

  // Client-side sort (avoids re-fetch just for sort order change)
  const results = useMemo(() => sortList(rawPlans, filters.sort), [rawPlans, filters.sort])

  // ── Filter helpers ──────────────────────────────────────────────────────
  const updateFilter = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value !== '' && value !== undefined && value !== null) {
      next.set(key, String(value))
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const clearAllFilters = () => {
    setLocalSearch('')
    setSearchParams({}, { replace: true })
  }

  // Debounce text search — commit to URL 400 ms after last keystroke
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
    filters.stories || filters.maxPrice < MAX_PRICE

  return (
    <div className="plans-page">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="plans-header">
        <div className="plans-header__inner">
          <div>
            <p className="plans-header__eyebrow">Browse & Filter</p>
            <h1 className="plans-header__title">House Plans Catalogue</h1>
          </div>
          <div className="plans-header__meta">
            {loading ? (
              <span className="plans-header__count">Loading…</span>
            ) : (
              <span className="plans-header__count">
                {results.length} plan{results.length !== 1 ? 's' : ''} found
                {apiError && <span className="plans-header__offline"> · offline mode</span>}
              </span>
            )}
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
        </div>
      </div>

      {/* ── Body: sidebar + grid ────────────────────────────────────────── */}
      <div className="plans-body">

        {/* Mobile filter toggle */}
        <button
          className={`filter-toggle${showFilters ? ' filter-toggle--open' : ''}`}
          onClick={() => setShowFilters(v => !v)}
          aria-expanded={showFilters}
          aria-controls="filter-sidebar"
        >
          <SlidersHorizontal size={16} strokeWidth={1.75} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && <span className="filter-toggle__dot" aria-label="Active filters" />}
        </button>

        {/* ── Filter Sidebar ─────────────────────────────────────────── */}
        <aside
          id="filter-sidebar"
          className={`filter-sidebar${showFilters ? ' filter-sidebar--open' : ''}`}
          aria-label="Filter house plans"
        >
          <div className="filter-sidebar__head">
            <h2 className="filter-sidebar__title">
              <SlidersHorizontal size={16} strokeWidth={1.75} />
              Filters
            </h2>
            {hasActiveFilters && (
              <button className="filter-clear-btn" onClick={clearAllFilters}>
                <X size={13} /> Clear all
              </button>
            )}
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="sidebar-search">Search</label>
            <form onSubmit={handleSearchSubmit} className="filter-search-form">
              <Search size={15} className="filter-search-icon" strokeWidth={1.75} />
              <input
                id="sidebar-search" type="search" className="filter-input"
                placeholder="Name, style, bedrooms…"
                value={localSearch} onChange={handleSearchChange}
              />
            </form>
          </div>

          <div className="filter-group">
            <label className="filter-label">Architectural Style</label>
            <div className="filter-chips">
              <button
                className={`filter-chip${!filters.style ? ' filter-chip--active' : ''}`}
                onClick={() => updateFilter('style', '')}
              >All</button>
              {STYLES.map(s => (
                <button
                  key={s}
                  className={`filter-chip${filters.style === s ? ' filter-chip--active' : ''}`}
                  onClick={() => updateFilter('style', s)}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Bedrooms</label>
            <div className="filter-chips">
              {BEDROOM_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`filter-chip${filters.bedrooms === o.value ? ' filter-chip--active' : ''}`}
                  onClick={() => updateFilter('bedrooms', o.value)}
                >{o.label}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Stories</label>
            <div className="filter-chips filter-chips--col">
              {STORY_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`filter-chip filter-chip--wide${filters.stories === o.value ? ' filter-chip--active' : ''}`}
                  onClick={() => updateFilter('stories', o.value)}
                >{o.label}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="price-range">
              Max Price
              <span className="filter-label__value">{formatTZS(filters.maxPrice)}</span>
            </label>
            <input
              id="price-range" type="range" className="filter-range"
              min={0} max={MAX_PRICE} step={100_000}
              value={filters.maxPrice}
              onChange={e => updateFilter('maxPrice', Number(e.target.value))}
            />
            <div className="filter-range-labels">
              <span>TSh 0</span>
              <span>{formatTZS(MAX_PRICE)}</span>
            </div>
          </div>
        </aside>

        {/* ── Plans Grid ─────────────────────────────────────────────── */}
        <div className="plans-grid-wrap">
          {loading ? (
            <div className="plans-loading">
              <Loader2 size={36} strokeWidth={1.5} className="auth-spinner" />
              <p>Loading plans…</p>
            </div>
          ) : results.length === 0 ? (
            <div className="plans-empty">
              <p className="plans-empty__title">No plans match your filters.</p>
              <p className="plans-empty__sub">Try adjusting or clearing your search criteria.</p>
              <button className="plans-empty__reset" onClick={clearAllFilters}>
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              {apiError && (
                <div className="plans-offline-banner">
                  <WifiOff size={14} strokeWidth={1.75} />
                  Showing cached plans — backend not reachable
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
