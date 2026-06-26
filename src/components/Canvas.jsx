import { renderSlide } from '../layouts/index.js'

export default function Canvas({ slide }) {
  if (!slide) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
      Выберите слайд
    </div>
  )

  const svgStr = renderSlide(slide)

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, background: '#1a1a1a', overflow: 'auto',
    }}>
      <div style={{
        width: '100%', maxWidth: 960,
        aspectRatio: '16/9',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
      }}>
        <div
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{
            __html: svgStr
              .replace(/width="1920"/, 'width="100%"')
              .replace(/height="1080"/, 'height="100%"'),
          }}
        />
      </div>
    </div>
  )
}
