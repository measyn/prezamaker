import { useState, useEffect } from 'react'
import { LAYOUT_LABELS } from '../demoSlides.js'

const LAYOUTS = Object.keys(LAYOUT_LABELS)

export default function PropsPanel({ slide, onUpdate }) {
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState(null)

  useEffect(() => {
    if (slide) setJsonText(JSON.stringify(slide.data, null, 2))
  }, [slide])

  if (!slide) return (
    <aside style={{ width: 280, background: '#111', borderLeft: '1px solid #2a2a2a', padding: 20 }}>
      <div style={{ color: '#555', fontSize: 13, fontFamily: 'Arial, sans-serif' }}>
        Выберите слайд для редактирования
      </div>
    </aside>
  )

  function handleLayoutChange(e) {
    onUpdate({ ...slide, layout: e.target.value })
  }

  function handleJsonChange(e) {
    setJsonText(e.target.value)
    setJsonError(null)
    try {
      const parsed = JSON.parse(e.target.value)
      onUpdate({ ...slide, data: parsed })
    } catch {
      setJsonError('Невалидный JSON')
    }
  }

  return (
    <aside style={{
      width: 280, flexShrink: 0, background: '#111', borderLeft: '1px solid #2a2a2a',
      padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase',
        letterSpacing: 1, fontFamily: 'Arial, sans-serif' }}>
        Слайд #{slide.id}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6,
          fontFamily: 'Arial, sans-serif' }}>Лейаут</label>
        <select
          value={slide.layout}
          onChange={handleLayoutChange}
          style={{
            width: '100%', background: '#1e1e1e', color: 'white', border: '1px solid #333',
            borderRadius: 6, padding: '6px 8px', fontSize: 13, fontFamily: 'Arial, sans-serif',
          }}
        >
          {LAYOUTS.map(l => (
            <option key={l} value={l}>{LAYOUT_LABELS[l]}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6,
          fontFamily: 'Arial, sans-serif' }}>
          Данные (JSON)
        </label>
        <textarea
          value={jsonText}
          onChange={handleJsonChange}
          spellCheck={false}
          style={{
            width: '100%', minHeight: 340, background: '#1e1e1e', color: '#e0e0e0',
            border: `1px solid ${jsonError ? '#FF5500' : '#333'}`, borderRadius: 6,
            padding: 10, fontSize: 12, fontFamily: 'monospace', lineHeight: 1.5,
            resize: 'vertical', boxSizing: 'border-box',
          }}
        />
        {jsonError && (
          <div style={{ color: '#FF5500', fontSize: 11, marginTop: 4, fontFamily: 'Arial, sans-serif' }}>
            {jsonError}
          </div>
        )}
      </div>
    </aside>
  )
}
