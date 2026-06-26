export default function Header({ onAddSlide }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 56, background: '#1A1A1A', borderBottom: '1px solid #333',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#FF5500',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Arial Black, Arial', fontWeight: 900, fontSize: 16, color: 'white',
        }}>ОК</div>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 16, fontFamily: 'Arial, sans-serif' }}>
          Slide Redesigner
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onAddSlide} style={{
          background: '#FF5500', color: 'white', border: 'none', borderRadius: 8,
          padding: '7px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          fontFamily: 'Arial, sans-serif',
        }}>+ Слайд</button>
      </div>
    </header>
  )
}
