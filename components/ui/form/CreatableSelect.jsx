// components/ui/form/CreatableSelect.jsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const CreatableSelect = ({
  // form props
  label,
  hint,
  error,
  required,
  id,
  className = "",

  // data props
  options = [], // [{ value, label, meta }] — data awal / cache
  value, // selected value (single)
  onChange, // (option: { value, label }) => void
  onSearch, // async (query: string) => [{ value, label, meta }]
  onCreate, // async (label: string) => { value, label } | null

  // display
  placeholder = "Ketik untuk mencari...",
  createLabel = "Tambah", // prefix teks tombol create
  emptyText = "Tidak ada hasil",
  loadingText = "Mencari...",
  creatingText = "Menyimpan...",
  size = "md",
  clearable = true,
  disabled = false,

  // behaviour
  minSearchLength = 0, // mulai search setelah N karakter
  debounceMs = 300,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(options);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [focused, setFocused] = useState(-1);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const selected =
    items.find((o) => o.value === value) ??
    options.find((o) => o.value === value) ??
    null;

  const sizeClass =
    { sm: "input-sm", md: "input-md", lg: "input-lg" }[size] ?? "input-md";

  // ── close on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── search ────────────────────────────────────────────────────
  const runSearch = useCallback(
    async (q) => {
      if (q.length < minSearchLength) {
        setItems(options);
        setLoading(false);
        return;
      }
      if (!onSearch) {
        // local filter jika tidak ada onSearch
        setItems(
          options.filter((o) =>
            o.label.toLowerCase().includes(q.toLowerCase()),
          ),
        );
        return;
      }
      setLoading(true);
      try {
        const result = await onSearch(q);
        setItems(result ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [onSearch, options, minSearchLength],
  );

  const handleQueryChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    setFocused(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), debounceMs);
  };

  // ── open / close ──────────────────────────────────────────────
  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setItems(options);
    setFocused(-1);
    setTimeout(() => inputRef.current?.focus(), 30);
    if (onSearch) runSearch("");
  };

  const close = () => {
    setOpen(false);
    setQuery("");
    setFocused(-1);
    clearTimeout(debounceRef.current);
  };

  // ── select ────────────────────────────────────────────────────
  const select = (opt) => {
    onChange?.(opt);
    // cache ke items supaya label tetap muncul
    setItems((prev) =>
      prev.find((o) => o.value === opt.value) ? prev : [...prev, opt],
    );
    close();
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange?.(null);
  };

  // ── create ────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!onCreate || !query.trim() || creating) return;
    setCreating(true);
    try {
      const newOpt = await onCreate(query.trim());
      if (newOpt) {
        setItems((prev) => [newOpt, ...prev]);
        select(newOpt);
      }
    } catch {
      // handle error di luar jika diperlukan
    } finally {
      setCreating(false);
    }
  };

  // ── show "create" button? ─────────────────────────────────────
  const trimmedQuery = query.trim();
  const exactMatch = items.some(
    (o) => o.label.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const showCreate =
    !!onCreate && trimmedQuery.length > 0 && !exactMatch && !loading;

  // ── keyboard navigation ───────────────────────────────────────
  const onKeyDown = (e) => {
    if (!open) return;
    const max = items.length + (showCreate ? 0 : -1);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused((v) => Math.min(v + 1, items.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused((v) => Math.max(v - 1, -1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (focused >= 0 && items[focused]) {
        select(items[focused]);
      } else if (focused === -1 && showCreate) {
        handleCreate();
      }
    }
    if (e.key === "Escape") close();
    if (e.key === "Tab") close();
  };

  // ── highlight matched text ────────────────────────────────────
  const highlight = (text, q) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark
          style={{
            background: "var(--color-primary-bg)",
            color: "var(--color-primary)",
            borderRadius: 2,
            padding: "0 1px",
          }}
        >
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div
      className={["form-group", className].filter(Boolean).join(" ")}
      ref={wrapRef}
      style={{ position: "relative" }}
    >
      {/* label */}
      {label && (
        <label htmlFor={id} className='form-label'>
          {label}
          {required && <span className='req'> *</span>}
        </label>
      )}

      {/* trigger */}
      <div
        className={[
          "input-base input-default",
          sizeClass,
          "creatable-trigger",
          open ? "is-open" : "",
          error ? "is-error" : "",
          disabled ? "creatable-disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={openDropdown}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
        }}
      >
        {open ? (
          /* search input */
          <input
            ref={inputRef}
            type='text'
            value={query}
            onChange={handleQueryChange}
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()}
            placeholder={placeholder}
            className='creatable-search-input'
            disabled={creating}
          />
        ) : /* selected value / placeholder */
        selected ? (
          <div className='creatable-selected'>
            {selected.icon && (
              <span className='creatable-selected-icon'>{selected.icon}</span>
            )}
            <span className='creatable-selected-label'>{selected.label}</span>
            {selected.meta && (
              <span className='creatable-selected-meta'>{selected.meta}</span>
            )}
          </div>
        ) : (
          <span className='creatable-placeholder'>{placeholder}</span>
        )}

        {/* right controls */}
        <div
          className='creatable-controls'
          onClick={(e) => e.stopPropagation()}
        >
          {loading && (
            <i className='fa-solid fa-circle-notch fa-spin creatable-spinner' />
          )}
          {clearable && value && !open && !disabled && (
            <button type='button' className='creatable-clear' onClick={clear}>
              <i className='fa-solid fa-xmark' />
            </button>
          )}
          <i
            className={`fa-solid fa-chevron-${open ? "up" : "down"} creatable-chevron`}
          />
        </div>
      </div>

      {/* dropdown */}
      {open && (
        <div className='creatable-dropdown'>
          {/* loading state */}
          {loading && (
            <div className='creatable-state'>
              <i
                className='fa-solid fa-circle-notch fa-spin'
                style={{ fontSize: 14, color: "var(--color-text-muted)" }}
              />
              <span>{loadingText}</span>
            </div>
          )}

          {/* empty state */}
          {!loading && items.length === 0 && !showCreate && (
            <div className='creatable-state'>
              <i
                className='fa-regular fa-folder-open'
                style={{ fontSize: 18, color: "var(--color-text-muted)" }}
              />
              <span>
                {trimmedQuery
                  ? `${emptyText} untuk "${trimmedQuery}"`
                  : emptyText}
              </span>
            </div>
          )}

          {/* items list */}
          {!loading && items.length > 0 && (
            <ul className='creatable-list'>
              {items.map((opt, i) => (
                <li
                  key={opt.value}
                  className={[
                    "creatable-item",
                    i === focused ? "creatable-item-focused" : "",
                    opt.value === value ? "creatable-item-selected" : "",
                    opt.disabled ? "creatable-item-disabled" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => !opt.disabled && select(opt)}
                  onMouseEnter={() => setFocused(i)}
                >
                  {opt.icon && (
                    <span className='creatable-item-icon'>{opt.icon}</span>
                  )}
                  <span className='creatable-item-body'>
                    <span className='creatable-item-label'>
                      {highlight(opt.label, query)}
                    </span>
                    {opt.meta && (
                      <span className='creatable-item-meta'>{opt.meta}</span>
                    )}
                  </span>
                  {opt.value === value && (
                    <i className='fa-solid fa-check creatable-item-check' />
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* create button */}
          {showCreate && (
            <div className='creatable-create-wrap'>
              {items.length > 0 && <div className='creatable-divider' />}
              <button
                type='button'
                className='creatable-create-btn'
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <i
                      className='fa-solid fa-circle-notch fa-spin'
                      style={{ fontSize: 13 }}
                    />
                    <span>{creatingText}</span>
                  </>
                ) : (
                  <>
                    <span className='creatable-create-icon'>
                      <i className='fa-solid fa-plus' />
                    </span>
                    <span>
                      {createLabel} <strong>"{trimmedQuery}"</strong>
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* error / hint */}
      {error && (
        <div className='form-error'>
          <i className='fa-solid fa-circle-exclamation' />
          {error}
        </div>
      )}
      {hint && !error && <div className='form-hint'>{hint}</div>}
    </div>
  );
};

export default CreatableSelect;
