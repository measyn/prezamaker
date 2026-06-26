import { renderSlide } from '../layouts/index.js'
import { LAYOUT_LABELS } from '../demoSlides.js'

function Thumbnail({ slide, active, onClick }) {
  const svgStr = renderSlide(slide)
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: 8,
        borderRadius: 12,
        background: active ? 'rgba(255,85,0,0.15)' : 'transparent',
        border: active ? '2px solid #FF5500' : '2px solid transparent',
        marginBottom: 8,
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#FF5500',
      }}>
        <div
          style={{ width: '100%', height: '100%', transform: 'scale(1)', transformOrigin: 'top left' }}
          dangerouslySetInnerHTML={{ __html: svgStr.replace(/width="1920"/, 'width="100%"').replace(/height="1080"/, 'height="100%"') }}
        />
      </div>
      <div style={{
        marginTop: 6, fontSize: 11, color: active ? '#FF5500' : '#888',
        fontFamily: 'Arial, sans-serif', textAlign: 'center', fontWeight: active ? 700 : 400,
      }}>
        {slide.id}. {LAYOUT_LABELS[slide.layout] || slide.layout}
      </div>
    </div>
  )
}

export default function Sidebar({ slides, activeId, onSelect }) {
  return (
    <aside style={{
      width: 200, flexShrink: 0, background: '#111', borderRight: '1px solid #2a2a2a',
      overflowY: 'auto', padding: '12px 8px',
    }}>
      <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: 8, paddingLeft: 8, fontFamily: 'Arial, sans-serif' }}>
        Слайды
      </div>
      {slides.map(slide => (
        <Thumbnail
          key={slide.id}
          slide={slide}
          active={slide.id === activeId}
          onClick={() => onSelect(slide.id)}
        />
      ))}
    </aside>
  )
}
