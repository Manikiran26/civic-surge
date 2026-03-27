import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";

export default function FilterPanel({
  open,
  filters,
  typeOptions,
  budgetBounds,
  timelineBounds,
  onToggle,
  onChange,
}) {
  return (
    <aside className={open ? "filter-panel" : "filter-panel is-collapsed"}>
      <button type="button" className="filter-panel__toggle" onClick={onToggle}>
        {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        <span>{open ? "Collapse" : "Filters"}</span>
      </button>

      <div className="filter-panel__content">
        <div className="panel-title">
          <Filter size={16} />
          Project Filters
        </div>

        <label className="filter-field">
          <span>Search</span>
          <div className="search-input">
            <Search size={14} />
            <input
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Search by name, city, type"
            />
          </div>
        </label>

        <label className="filter-field">
          <span>Project Type</span>
          <select
            value={filters.type}
            onChange={(event) => onChange({ type: event.target.value })}
          >
            <option value="all">All types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <div className="filter-field">
          <span>Status</span>
          <div className="filter-pill-row">
            {["all", "completed", "ongoing", "delayed"].map((status) => (
              <button
                key={status}
                type="button"
                className={filters.status === status ? "pill is-active" : "pill"}
                onClick={() => onChange({ status })}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-field">
          <span>Budget Range (₹ crore)</span>
          <div className="range-values">
            <span>{filters.budgetMin}</span>
            <span>{filters.budgetMax}</span>
          </div>
          <input
            type="range"
            min={budgetBounds.min}
            max={budgetBounds.max}
            value={filters.budgetMin}
            onChange={(event) =>
              onChange({ budgetMin: Math.min(Number(event.target.value), filters.budgetMax) })
            }
          />
          <input
            type="range"
            min={budgetBounds.min}
            max={budgetBounds.max}
            value={filters.budgetMax}
            onChange={(event) =>
              onChange({ budgetMax: Math.max(Number(event.target.value), filters.budgetMin) })
            }
          />
        </div>

        <div className="filter-field">
          <span>Timeline (Start to ETA)</span>
          <div className="filter-row">
            <select
              value={filters.timelineStart}
              onChange={(event) =>
                onChange({ timelineStart: Math.min(Number(event.target.value), filters.timelineEnd) })
              }
            >
              {timelineBounds.years.map((year) => (
                <option key={`start-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={filters.timelineEnd}
              onChange={(event) =>
                onChange({ timelineEnd: Math.max(Number(event.target.value), filters.timelineStart) })
              }
            >
              {timelineBounds.years.map((year) => (
                <option key={`end-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}
