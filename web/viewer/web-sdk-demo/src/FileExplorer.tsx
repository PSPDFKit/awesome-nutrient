import { useState, type DragEvent } from 'react'
import type { FileEntry } from './types/files'

type Props = {
  files: FileEntry[]
  activeId: string | null
  onSelect: (id: string) => void
  onUpload: (files: File[]) => void
  onRemove: (id: string) => void
  inkActive: boolean
  onToggleInk: () => void
  textActive: boolean
  onToggleText: () => void
}

export function FileExplorer({
  files,
  activeId,
  onSelect,
  onUpload,
  onRemove,
  inkActive,
  onToggleInk,
  textActive,
  onToggleText,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
    )
    if (dropped.length > 0) onUpload(dropped)
  }

  return (
    <aside
      className={`sidebar${isDragging ? ' sidebar--drag' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="sidebar__header">
        <h2 className="sidebar__title">Files</h2>
      </div>

      <button
        type="button"
        className={`sidebar__mode-btn${inkActive ? ' sidebar__mode-btn--active' : ''}`}
        onClick={onToggleInk}
      >
        <DrawIcon />
        <span>Drawing mode</span>
      </button>

      <button
        type="button"
        className={`sidebar__mode-btn${textActive ? ' sidebar__mode-btn--active' : ''}`}
        onClick={onToggleText}
      >
        <TextIcon />
        <span>Text mode</span>
      </button>

      <div className="sidebar__section">
        <div className="sidebar__section-header">
          <span>Quick access</span>
          <label className="upload-btn" title="Upload PDF">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => {
                if (e.target.files) onUpload(Array.from(e.target.files))
                e.target.value = ''
              }}
            />
            +
          </label>
        </div>

        {files.length === 0 ? (
          <p className="sidebar__empty">Drag PDFs here to upload.</p>
        ) : (
          <ul className="file-list">
            {files.map((file) => (
              <li
                key={file.id}
                className={`file-item${activeId === file.id ? ' file-item--active' : ''}`}
                onClick={() => onSelect(file.id)}
              >
                <FileIcon />
                <div className="file-item__meta">
                  <span className="file-item__name">{file.name}</span>
                  {file.size > 0 && (
                    <span className="file-item__size">{formatSize(file.size)}</span>
                  )}
                </div>
                {!file.isBuiltin && (
                  <button
                    className="file-item__remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(file.id)
                    }}
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isDragging && (
        <div className="drop-overlay">
          <span>Drop PDFs to upload</span>
        </div>
      )}
    </aside>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DrawIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 16l3-1 9-9-2-2-9 9-1 3z" />
      <path d="M12 4l2 2" />
    </svg>
  )
}

function TextIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 5h12M10 5v11M7 16h6" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 2h7l3 3v13H5z" />
      <path d="M12 2v3h3" />
    </svg>
  )
}
