// components/ui/form/RichTextEditor.jsx
'use client'
import { useRef, useState, useCallback, useEffect } from 'react'

const TOOLS = [
  {
    group: 'history',
    items: [
      { cmd: 'undo',  icon: 'fa-rotate-left',  title: 'Undo', action: (ed) => ed.execCommand('undo') },
      { cmd: 'redo',  icon: 'fa-rotate-right', title: 'Redo', action: (ed) => ed.execCommand('redo') },
    ],
  },
  {
    group: 'format',
    items: [
      { cmd: 'bold',          icon: 'fa-bold',          title: 'Bold',          action: (ed) => ed.execCommand('bold') },
      { cmd: 'italic',        icon: 'fa-italic',        title: 'Italic',        action: (ed) => ed.execCommand('italic') },
      { cmd: 'underline',     icon: 'fa-underline',     title: 'Underline',     action: (ed) => ed.execCommand('underline') },
      { cmd: 'strikeThrough', icon: 'fa-strikethrough', title: 'Strikethrough', action: (ed) => ed.execCommand('strikeThrough') },
    ],
  },
  {
    group: 'align',
    items: [
      { cmd: 'justifyLeft',   icon: 'fa-align-left',    title: 'Rata kiri',   action: (ed) => ed.execCommand('justifyLeft') },
      { cmd: 'justifyCenter', icon: 'fa-align-center',  title: 'Rata tengah', action: (ed) => ed.execCommand('justifyCenter') },
      { cmd: 'justifyRight',  icon: 'fa-align-right',   title: 'Rata kanan',  action: (ed) => ed.execCommand('justifyRight') },
      { cmd: 'justifyFull',   icon: 'fa-align-justify', title: 'Justify',     action: (ed) => ed.execCommand('justifyFull') },
    ],
  },
  {
    group: 'list',
    items: [
      { cmd: 'insertUnorderedList', icon: 'fa-list-ul',    title: 'Bullet list',   action: (ed) => ed.execCommand('insertUnorderedList') },
      { cmd: 'insertOrderedList',   icon: 'fa-list-ol',    title: 'Numbered list', action: (ed) => ed.execCommand('insertOrderedList') },
      { cmd: 'outdent',             icon: 'fa-outdent',    title: 'Outdent',       action: (ed) => ed.execCommand('outdent') },
      { cmd: 'indent',              icon: 'fa-indent',     title: 'Indent',        action: (ed) => ed.execCommand('indent') },
    ],
  },
  {
    group: 'insert',
    items: [
      { cmd: 'link',        icon: 'fa-link',        title: 'Insert link',  special: 'link' },
      { cmd: 'unlink',      icon: 'fa-link-slash',  title: 'Remove link',  action: (ed) => ed.execCommand('unlink') },
      { cmd: 'hr',          icon: 'fa-minus',       title: 'Horizontal rule', action: (ed) => ed.execCommand('insertHorizontalRule') },
    ],
  },
  {
    group: 'clear',
    items: [
      { cmd: 'removeFormat', icon: 'fa-eraser', title: 'Hapus format', action: (ed) => ed.execCommand('removeFormat') },
    ],
  },
]

const HEADING_OPTIONS = [
  { value: 'p',  label: 'Paragraf' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'pre', label: 'Kode' },
]

const FONT_SIZES = ['1','2','3','4','5','6','7']
const FONT_SIZE_LABELS = ['Sangat kecil','Kecil','Normal','Sedang','Besar','Sangat besar','Raksasa']

const RichTextEditor = ({
  label,
  hint,
  error,
  required,
  value       = '',
  onChange,
  placeholder = 'Tulis sesuatu...',
  minHeight   = 200,
  maxHeight,
  readonly    = false,
  id,
  className   = '',
}) => {
  const editorRef  = useRef(null)
  const [active,   setActive]   = useState({})
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl,  setLinkUrl]  = useState('https://')
  const [linkText, setLinkText] = useState('')
  const [showHtml, setShowHtml] = useState(false)
  const savedSel   = useRef(null)

  // sync initial value
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value
    }
  }, [])

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel?.rangeCount) savedSel.current = sel.getRangeAt(0).cloneRange()
  }

  const restoreSelection = () => {
    const sel = window.getSelection()
    if (savedSel.current && sel) {
      sel.removeAllRanges()
      sel.addRange(savedSel.current)
    }
  }

  const updateActive = useCallback(() => {
    const state = {}
    ;['bold','italic','underline','strikeThrough','justifyLeft','justifyCenter','justifyRight','justifyFull','insertUnorderedList','insertOrderedList'].forEach(cmd => {
      try { state[cmd] = document.queryCommandState(cmd) } catch {}
    })
    setActive(state)
  }, [])

  const exec = useCallback((tool) => {
    if (tool.special === 'link') {
      saveSelection()
      const sel = window.getSelection()
      setLinkText(sel?.toString() ?? '')
      setLinkUrl('https://')
      setLinkOpen(true)
      return
    }
    editorRef.current?.focus()
    tool.action(document)
    updateActive()
    emitChange()
  }, [])

  const insertLink = () => {
    editorRef.current?.focus()
    restoreSelection()
    if (linkText) {
      document.execCommand('insertHTML', false, `<a href="${linkUrl}" target="_blank">${linkText}</a>`)
    } else {
      document.execCommand('createLink', false, linkUrl)
    }
    setLinkOpen(false)
    emitChange()
  }

  const execHeading = (val) => {
    editorRef.current?.focus()
    if (val === 'p') {
      document.execCommand('formatBlock', false, 'p')
    } else {
      document.execCommand('formatBlock', false, val)
    }
    emitChange()
  }

  const execFontSize = (val) => {
    editorRef.current?.focus()
    document.execCommand('fontSize', false, val)
    emitChange()
  }

  const emitChange = () => {
    onChange?.(editorRef.current?.innerHTML ?? '')
  }

  const wordCount = () => {
    const text = editorRef.current?.innerText ?? ''
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }

  const charCount = () => (editorRef.current?.innerText ?? '').length

  return (
    <div className={['form-group rte-wrap', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}{required && <span className="req"> *</span>}
        </label>
      )}

      <div className={['rte', error ? 'rte-error' : '', readonly ? 'rte-readonly' : ''].filter(Boolean).join(' ')}>

        {/* toolbar */}
        {!readonly && (
          <div className="rte-toolbar">
            {/* heading select */}
            <select
              className="rte-select"
              onChange={e => execHeading(e.target.value)}
              defaultValue="p"
            >
              {HEADING_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* font size */}
            <select
              className="rte-select rte-select-sm"
              onChange={e => execFontSize(e.target.value)}
              defaultValue="3"
              title="Ukuran font"
            >
              {FONT_SIZES.map((s, i) => (
                <option key={s} value={s}>{FONT_SIZE_LABELS[i]}</option>
              ))}
            </select>

            {/* tool groups */}
            {TOOLS.map((group, gi) => (
              <div key={gi} className="rte-group">
                {group.items.map(tool => (
                  <button
                    key={tool.cmd}
                    type="button"
                    title={tool.title}
                    className={['rte-btn', active[tool.cmd] ? 'rte-btn-active' : ''].filter(Boolean).join(' ')}
                    onMouseDown={e => { e.preventDefault(); exec(tool) }}
                  >
                    <i className={`fa-solid ${tool.icon}`} />
                  </button>
                ))}
              </div>
            ))}

            {/* html toggle */}
            <div className="rte-group">
              <button
                type="button"
                title="Lihat HTML"
                className={['rte-btn', showHtml ? 'rte-btn-active' : ''].filter(Boolean).join(' ')}
                onClick={() => setShowHtml(v => !v)}
              >
                <i className="fa-solid fa-code" />
              </button>
            </div>
          </div>
        )}

        {/* link dialog */}
        {linkOpen && (
          <div className="rte-link-dialog">
            <div className="rte-link-fields">
              <input
                className="rte-link-input"
                placeholder="Teks link"
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
              />
              <input
                autoFocus
                className="rte-link-input"
                placeholder="https://..."
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') insertLink(); if (e.key === 'Escape') setLinkOpen(false) }}
              />
            </div>
            <div className="rte-link-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLinkOpen(false)}>Batal</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={insertLink}>Sisipkan</button>
            </div>
          </div>
        )}

        {/* editor area */}
        {showHtml ? (
          <textarea
            className="rte-html"
            style={{ minHeight, maxHeight }}
            value={editorRef.current?.innerHTML ?? value}
            onChange={e => {
              if (editorRef.current) editorRef.current.innerHTML = e.target.value
              onChange?.(e.target.value)
            }}
          />
        ) : (
          <div
            ref={editorRef}
            id={id}
            className="rte-content"
            contentEditable={!readonly}
            suppressContentEditableWarning
            style={{ minHeight, maxHeight }}
            data-placeholder={placeholder}
            onInput={() => { emitChange(); updateActive() }}
            onKeyUp={updateActive}
            onMouseUp={updateActive}
            onSelect={updateActive}
          />
        )}

        {/* footer */}
        <div className="rte-footer">
          <span className="rte-count">{wordCount()} kata · {charCount()} karakter</span>
          {readonly && <span className="rte-readonly-badge">Readonly</span>}
        </div>
      </div>

      {error && <div className="form-error"><i className="fa-solid fa-circle-exclamation" />{error}</div>}
      {hint && !error && <div className="form-hint">{hint}</div>}
    </div>
  )
}

export default RichTextEditor