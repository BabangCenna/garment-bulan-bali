// components/ui/data/KanbanBoard.jsx
'use client'
import { useState, useRef } from 'react'
import Badge from '@/components/ui/data/Badge'
import Avatar from '@/components/ui/data/Avatar'

const KanbanBoard = ({
  columns      = [], // [{ id, title, color, limit }]
  cards        = [], // [{ id, columnId, title, description, labels, assignees, dueDate, priority, cover }]
  onCardMove,        // (cardId, fromCol, toCol, newIndex) => void
  onCardAdd,         // (columnId) => void
  onCardClick,       // (card) => void
  onCardDelete,      // (cardId) => void
  onColumnAdd,       // () => void
  className    = '',
}) => {
  const [dragging,  setDragging]  = useState(null)  // { card, fromCol }
  const [dragOver,  setDragOver]  = useState(null)  // { colId, index }
  const [collapsed, setCollapsed] = useState({})
  const dragCard = useRef(null)

  const getColCards = (colId) =>
    cards.filter(c => c.columnId === colId)

  const PRIORITY_COLORS = {
    high:   'danger',
    medium: 'warning',
    low:    'success',
  }

  const PRIORITY_LABELS = {
    high:   'Tinggi',
    medium: 'Sedang',
    low:    'Rendah',
  }

  // ── drag handlers ────────────────────────────────────────────
  const onDragStart = (e, card) => {
    dragCard.current = card
    setDragging({ card, fromCol: card.columnId })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', card.id)
  }

  const onDragEnd = () => {
    setDragging(null)
    setDragOver(null)
    dragCard.current = null
  }

  const onDragEnterCol = (e, colId, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver({ colId, index })
  }

  const onDropCol = (e, colId) => {
    e.preventDefault()
    const card = dragCard.current
    if (!card) return
    const idx = dragOver?.index ?? getColCards(colId).length
    onCardMove?.(card.id, card.columnId, colId, idx)
    setDragging(null)
    setDragOver(null)
    dragCard.current = null
  }

  const toggleCollapse = (colId) => {
    setCollapsed(v => ({ ...v, [colId]: !v[colId] }))
  }

  // ── card component ────────────────────────────────────────────
  const KanbanCard = ({ card, index }) => {
    const isDraggingThis = dragging?.card.id === card.id
    const isOver = dragOver?.colId === card.columnId && dragOver?.index === index

    return (
      <>
        {/* drop indicator before */}
        {isOver && <div className="kanban-drop-indicator" />}

        <div
          className={['kanban-card', isDraggingThis ? 'kanban-card-dragging' : ''].filter(Boolean).join(' ')}
          draggable
          onDragStart={e => onDragStart(e, card)}
          onDragEnd={onDragEnd}
          onDragOver={e => { e.preventDefault(); onDragEnterCol(e, card.columnId, index) }}
          onClick={() => onCardClick?.(card)}
        >
          {/* cover image */}
          {card.cover && (
            <div className="kanban-card-cover">
              <img src={card.cover} alt="" />
            </div>
          )}

          {/* labels */}
          {card.labels?.length > 0 && (
            <div className="kanban-card-labels">
              {card.labels.map((l, i) => (
                <span
                  key={i}
                  className="kanban-label"
                  style={{ background: l.color ?? 'var(--color-primary)', opacity: .85 }}
                  title={l.name}
                />
              ))}
            </div>
          )}

          {/* title */}
          <div className="kanban-card-title">{card.title}</div>

          {/* description */}
          {card.description && (
            <div className="kanban-card-desc">{card.description}</div>
          )}

          {/* footer */}
          <div className="kanban-card-footer">
            <div className="kanban-card-meta">
              {card.priority && (
                <Badge variant={PRIORITY_COLORS[card.priority] ?? 'secondary'} size="sm">
                  {PRIORITY_LABELS[card.priority] ?? card.priority}
                </Badge>
              )}
              {card.dueDate && (
                <span className="kanban-due">
                  <i className="fa-regular fa-calendar" style={{ fontSize: 10 }} />
                  {card.dueDate}
                </span>
              )}
            </div>
            <div className="kanban-card-right">
              {card.checklist && (
                <span className="kanban-checklist">
                  <i className="fa-solid fa-check-square" style={{ fontSize: 10 }} />
                  {card.checklist.done}/{card.checklist.total}
                </span>
              )}
              {card.assignees?.length > 0 && (
                <div className="kanban-assignees">
                  {card.assignees.slice(0, 3).map((a, i) => (
                    <Avatar key={i} name={a.name} src={a.avatar} size="xs" color="primary" title={a.name} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }} />
                  ))}
                  {card.assignees.length > 3 && (
                    <span className="kanban-assignee-more">+{card.assignees.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* card actions */}
          <div className="kanban-card-actions" onClick={e => e.stopPropagation()}>
            <button type="button" className="kanban-action-btn" title="Edit" onClick={() => onCardClick?.(card)}>
              <i className="fa-solid fa-pen" />
            </button>
            <button type="button" className="kanban-action-btn kanban-action-danger" title="Hapus" onClick={() => onCardDelete?.(card.id)}>
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        </div>
      </>
    )
  }

  // ── column component ──────────────────────────────────────────
  const KanbanColumn = ({ col }) => {
    const colCards   = getColCards(col.id)
    const isCollapsed = collapsed[col.id]
    const isOver     = dragOver?.colId === col.id
    const isAtLimit  = col.limit && colCards.length >= col.limit

    return (
      <div
        className={['kanban-col', isCollapsed ? 'kanban-col-collapsed' : '', isOver ? 'kanban-col-dragover' : ''].filter(Boolean).join(' ')}
        onDragOver={e => { e.preventDefault(); onDragEnterCol(e, col.id, colCards.length) }}
        onDrop={e => onDropCol(e, col.id)}
        onDragLeave={() => setDragOver(null)}
      >
        {/* column header */}
        <div className="kanban-col-header">
          <div className="kanban-col-header-left">
            <span
              className="kanban-col-dot"
              style={{ background: col.color ?? 'var(--color-primary)' }}
            />
            <span className="kanban-col-title">{col.title}</span>
            <span className="kanban-col-count">
              {colCards.length}{col.limit ? `/${col.limit}` : ''}
            </span>
            {isAtLimit && <Badge variant="warning" size="sm">Penuh</Badge>}
          </div>
          <div className="kanban-col-header-right">
            <button
              type="button"
              className="kanban-col-btn"
              onClick={() => toggleCollapse(col.id)}
              title={isCollapsed ? 'Buka' : 'Tutup'}
            >
              <i className={`fa-solid fa-chevron-${isCollapsed ? 'right' : 'down'}`} />
            </button>
            <button
              type="button"
              className="kanban-col-btn"
              onClick={() => onCardAdd?.(col.id)}
              title="Tambah kartu"
            >
              <i className="fa-solid fa-plus" />
            </button>
          </div>
        </div>

        {/* cards */}
        {!isCollapsed && (
          <div className="kanban-cards">
            {colCards.length === 0 && (
              <div
                className="kanban-empty"
                onDragOver={e => { e.preventDefault(); onDragEnterCol(e, col.id, 0) }}
              >
                <i className="fa-regular fa-rectangle-list" style={{ fontSize: 20 }} />
                <span>Belum ada kartu</span>
              </div>
            )}
            {colCards.map((card, i) => (
              <KanbanCard key={card.id} card={card} index={i} />
            ))}
            {/* drop target at end */}
            {dragging && dragOver?.colId === col.id && dragOver?.index === colCards.length && (
              <div className="kanban-drop-indicator" />
            )}

            {/* add card button */}
            <button
              type="button"
              className="kanban-add-card"
              onClick={() => onCardAdd?.(col.id)}
            >
              <i className="fa-solid fa-plus" />
              Tambah kartu
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={['kanban-board', className].filter(Boolean).join(' ')}>
      {columns.map(col => (
        <KanbanColumn key={col.id} col={col} />
      ))}

      {/* add column */}
      {onColumnAdd && (
        <button type="button" className="kanban-add-col" onClick={onColumnAdd}>
          <i className="fa-solid fa-plus" />
          Tambah Kolom
        </button>
      )}
    </div>
  )
}

export default KanbanBoard