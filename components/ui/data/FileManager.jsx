// components/ui/data/FileManager.jsx
'use client'
import { useState, useRef } from 'react'
import Badge from '@/components/ui/data/Badge'

const FILE_ICONS = {
  pdf:  { icon: 'fa-file-pdf',        color: '#e03131' },
  doc:  { icon: 'fa-file-word',       color: '#4f83cc' },
  docx: { icon: 'fa-file-word',       color: '#4f83cc' },
  xls:  { icon: 'fa-file-excel',      color: '#2f9e44' },
  xlsx: { icon: 'fa-file-excel',      color: '#2f9e44' },
  ppt:  { icon: 'fa-file-powerpoint', color: '#f08c00' },
  pptx: { icon: 'fa-file-powerpoint', color: '#f08c00' },
  zip:  { icon: 'fa-file-zipper',     color: '#868e96' },
  rar:  { icon: 'fa-file-zipper',     color: '#868e96' },
  mp4:  { icon: 'fa-file-video',      color: '#9b59b6' },
  mp3:  { icon: 'fa-file-audio',      color: '#1abc9c' },
  txt:  { icon: 'fa-file-lines',      color: '#868e96' },
  csv:  { icon: 'fa-file-csv',        color: '#2f9e44' },
  js:   { icon: 'fa-file-code',       color: '#f08c00' },
  jsx:  { icon: 'fa-file-code',       color: '#61dafb' },
  ts:   { icon: 'fa-file-code',       color: '#4f83cc' },
  tsx:  { icon: 'fa-file-code',       color: '#4f83cc' },
}

const IMAGE_EXTS = ['jpg','jpeg','png','gif','webp','svg','bmp']

function getExt(name) {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function isImage(name) {
  return IMAGE_EXTS.includes(getExt(name))
}

function formatSize(bytes) {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const FileManager = ({
  files        = [], // [{ id, name, size, type, url, thumb, uploadedAt, folder }]
  folders      = [], // [{ id, name, count }]
  onUpload,          // (FileList) => void
  onDelete,          // (id) => void
  onRename,          // (id, newName) => void
  onCopyUrl,         // (url) => void
  onFolderClick,     // (folderId) => void
  currentFolder,
  loading      = false,
  accept,
  maxSize,
  className    = '',
}) => {
  const [view,      setView]      = useState('grid') // 'grid' | 'list'
  const [selected,  setSelected]  = useState([])
  const [search,    setSearch]    = useState('')
  const [renaming,  setRenaming]  = useState(null)  // id
  const [renameVal, setRenameVal] = useState('')
  const [preview,   setPreview]   = useState(null)
  const [dragOver,  setDragOver]  = useState(false)
  const inputRef = useRef(null)

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id, e) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      setSelected(prev =>
        prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
      )
    } else {
      setSelected(prev => prev.includes(id) && prev.length === 1 ? [] : [id])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dt = e.dataTransfer.files
    if (dt.length) onUpload?.(dt)
  }

  const startRename = (file, e) => {
    e.stopPropagation()
    setRenaming(file.id)
    setRenameVal(file.name)
  }

  const commitRename = (id) => {
    if (renameVal.trim()) onRename?.(id, renameVal.trim())
    setRenaming(null)
  }

  const copyUrl = (file, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(file.url)
    onCopyUrl?.(file.url)
  }

  const FileIcon = ({ name, size = 32 }) => {
    const ext = getExt(name)
    const meta = FILE_ICONS[ext] ?? { icon: 'fa-file', color: 'var(--color-text-muted)' }
    return <i className={`fa-solid ${meta.icon}`} style={{ fontSize: size, color: meta.color }} />
  }

  const GridItem = ({ file }) => {
    const isSelected = selected.includes(file.id)
    const ext = getExt(file.name)
    return (
      <div
        className={['fm-grid-item', isSelected ? 'fm-item-selected' : ''].filter(Boolean).join(' ')}
        onClick={(e) => toggleSelect(file.id, e)}
        onDoubleClick={() => isImage(file.name) && setPreview(file)}
      >
        {/* checkbox */}
        <div className="fm-item-check">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            onClick={e => e.stopPropagation()}
          />
        </div>

        {/* thumbnail / icon */}
        <div className="fm-grid-thumb">
          {isImage(file.name) && file.thumb ? (
            <img src={file.thumb} alt={file.name} className="fm-grid-img" />
          ) : (
            <FileIcon name={file.name} size={36} />
          )}
        </div>

        {/* name */}
        <div className="fm-grid-name">
          {renaming === file.id ? (
            <input
              autoFocus
              className="fm-rename-input"
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onBlur={() => commitRename(file.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename(file.id)
                if (e.key === 'Escape') setRenaming(null)
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span title={file.name}>{file.name}</span>
          )}
        </div>

        <div className="fm-grid-meta">{formatSize(file.size)}</div>

        {/* actions */}
        <div className="fm-item-actions" onClick={e => e.stopPropagation()}>
          {isImage(file.name) && (
            <button type="button" className="fm-action-btn" title="Preview" onClick={() => setPreview(file)}>
              <i className="fa-solid fa-eye" />
            </button>
          )}
          <a href={file.url} download={file.name} className="fm-action-btn" title="Download">
            <i className="fa-solid fa-download" />
          </a>
          <button type="button" className="fm-action-btn" title="Salin URL" onClick={(e) => copyUrl(file, e)}>
            <i className="fa-solid fa-copy" />
          </button>
          <button type="button" className="fm-action-btn" title="Rename" onClick={(e) => startRename(file, e)}>
            <i className="fa-solid fa-pen" />
          </button>
          <button type="button" className="fm-action-btn fm-action-danger" title="Hapus" onClick={(e) => { e.stopPropagation(); onDelete?.(file.id) }}>
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      </div>
    )
  }

  const ListItem = ({ file }) => {
    const isSelected = selected.includes(file.id)
    return (
      <div
        className={['fm-list-item', isSelected ? 'fm-item-selected' : ''].filter(Boolean).join(' ')}
        onClick={(e) => toggleSelect(file.id, e)}
      >
        <input type="checkbox" checked={isSelected} onChange={() => {}} onClick={e => e.stopPropagation()} />
        <div className="fm-list-icon">
          {isImage(file.name) && file.thumb
            ? <img src={file.thumb} alt="" className="fm-list-thumb" />
            : <FileIcon name={file.name} size={20} />
          }
        </div>
        <div className="fm-list-name">
          {renaming === file.id ? (
            <input
              autoFocus
              className="fm-rename-input"
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onBlur={() => commitRename(file.id)}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(file.id); if (e.key === 'Escape') setRenaming(null) }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="fm-list-filename">{file.name}</span>
          )}
          <span className="fm-list-ext">{getExt(file.name).toUpperCase()}</span>
        </div>
        <span className="fm-list-size">{formatSize(file.size)}</span>
        <span className="fm-list-date">{file.uploadedAt ? formatDate(file.uploadedAt) : '—'}</span>
        <div className="fm-list-actions" onClick={e => e.stopPropagation()}>
          {isImage(file.name) && (
            <button type="button" className="fm-action-btn" title="Preview" onClick={() => setPreview(file)}>
              <i className="fa-solid fa-eye" />
            </button>
          )}
          <a href={file.url} download={file.name} className="fm-action-btn" title="Download">
            <i className="fa-solid fa-download" />
          </a>
          <button type="button" className="fm-action-btn" title="Salin URL" onClick={(e) => copyUrl(file, e)}>
            <i className="fa-solid fa-copy" />
          </button>
          <button type="button" className="fm-action-btn" title="Rename" onClick={(e) => startRename(file, e)}>
            <i className="fa-solid fa-pen" />
          </button>
          <button type="button" className="fm-action-btn fm-action-danger" title="Hapus" onClick={(e) => { e.stopPropagation(); onDelete?.(file.id) }}>
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={['fm', className].filter(Boolean).join(' ')}>

      {/* toolbar */}
      <div className="fm-toolbar">
        <div className="fm-toolbar-left">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => inputRef.current?.click()}
          >
            <i className="fa-solid fa-cloud-arrow-up" />
            Upload
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            style={{ display: 'none' }}
            onChange={e => { onUpload?.(e.target.files); e.target.value = '' }}
          />
          {selected.length > 0 && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => { selected.forEach(id => onDelete?.(id)); setSelected([]) }}
            >
              <i className="fa-solid fa-trash" />
              Hapus ({selected.length})
            </button>
          )}
        </div>

        <div className="fm-toolbar-right">
          {/* search */}
          <div className="input-wrap" style={{ width: 220 }}>
            <span className="slot-icon left"><i className="fa-solid fa-magnifying-glass" /></span>
            <input
              type="search"
              className="input-base input-default input-sm input-icon-left"
              placeholder="Cari file..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* view toggle */}
          <div className="btn-group">
            <button
              type="button"
              className={`btn btn-secondary btn-sm ${view === 'grid' ? 'btn-primary' : ''}`}
              onClick={() => setView('grid')}
              style={{ borderRadius: 0 }}
            >
              <i className="fa-solid fa-grip" />
            </button>
            <button
              type="button"
              className={`btn btn-secondary btn-sm ${view === 'list' ? 'btn-primary' : ''}`}
              onClick={() => setView('list')}
              style={{ borderRadius: 0 }}
            >
              <i className="fa-solid fa-list" />
            </button>
          </div>
        </div>
      </div>

      {/* breadcrumb / folder path */}
      {folders.length > 0 && (
        <div className="fm-folders">
          {folders.map(folder => (
            <button
              key={folder.id}
              type="button"
              className={['fm-folder', currentFolder === folder.id ? 'fm-folder-active' : ''].filter(Boolean).join(' ')}
              onClick={() => onFolderClick?.(folder.id)}
            >
              <i className="fa-solid fa-folder" />
              <span>{folder.name}</span>
              {folder.count !== undefined && (
                <Badge variant="secondary" size="sm">{folder.count}</Badge>
              )}
            </button>
          ))}
        </div>
      )}

      {/* drop zone + content */}
      <div
        className={['fm-body', dragOver ? 'fm-body-dragover' : ''].filter(Boolean).join(' ')}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="fm-state">
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 28, color: 'var(--color-text-muted)' }} />
            <span>Memuat file...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="fm-state">
            <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 36, color: 'var(--color-text-muted)' }} />
            <span>{search ? `Tidak ada file yang cocok dengan "${search}"` : 'Belum ada file. Drag & drop atau klik Upload.'}</span>
          </div>
        ) : view === 'grid' ? (
          <div className="fm-grid">
            {filtered.map(f => <GridItem key={f.id} file={f} />)}
          </div>
        ) : (
          <div className="fm-list">
            <div className="fm-list-header">
              <span />
              <span />
              <span>Nama</span>
              <span>Ukuran</span>
              <span>Tanggal</span>
              <span />
            </div>
            {filtered.map(f => <ListItem key={f.id} file={f} />)}
          </div>
        )}
      </div>

      {/* status bar */}
      <div className="fm-statusbar">
        <span>{files.length} file</span>
        {selected.length > 0 && <span>· {selected.length} dipilih</span>}
        <span style={{ marginLeft: 'auto' }}>
          {files.reduce((a, f) => a + (f.size ?? 0), 0) > 0
            ? formatSize(files.reduce((a, f) => a + (f.size ?? 0), 0)) + ' total'
            : ''
          }
        </span>
      </div>

      {/* image preview lightbox */}
      {preview && (
        <div className="fm-preview-backdrop" onClick={() => setPreview(null)}>
          <div className="fm-preview-box" onClick={e => e.stopPropagation()}>
            <div className="fm-preview-header">
              <span className="fm-preview-name">{preview.name}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={preview.url} download={preview.name} className="btn btn-secondary btn-sm">
                  <i className="fa-solid fa-download" /> Download
                </a>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreview(null)}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>
            <img src={preview.url} alt={preview.name} className="fm-preview-img" />
            <div className="fm-preview-meta">
              {formatSize(preview.size)} · {preview.uploadedAt ? formatDate(preview.uploadedAt) : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileManager