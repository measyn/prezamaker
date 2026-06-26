import { useState } from 'react'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Canvas from './components/Canvas.jsx'
import PropsPanel from './components/PropsPanel.jsx'
import { DEMO_SLIDES, LAYOUT_LABELS } from './demoSlides.js'

let nextId = DEMO_SLIDES.length + 1

const BLANK_LAYOUTS = {
  cover:        { title: 'Новый слайд', subtitle: '' },
  stats:        { title: 'Метрики', metrics: [{ value: '100', label: 'Единиц' }] },
  three_cards:  { title: 'Три карточки', cards: [
    { icon: '✦', title: 'Карточка 1', bullets: ['Пункт 1'] },
    { icon: '✦', title: 'Карточка 2', bullets: ['Пункт 1'] },
    { icon: '✦', title: 'Карточка 3', bullets: ['Пункт 1'] },
  ]},
  before_after: { title: 'Было / Стало', description: '', before: 'Старое', after: 'Новое', metric: { value: '+X%', label: 'Метрика' }},
  table:        { title: 'Таблица', columns: ['Категория', 'Детали', 'Метрика'], rows: [
    { category: 'Строка 1', detail: 'Описание', metric: '—' },
  ]},
  timeline:     { title: 'Таймлайн', points: [
    { label: 'Q1', value: 'Этап 1', active: false },
    { label: 'Q2', value: 'Этап 2', active: true },
  ]},
  two_col:      { title: 'Два блока', left: { heading: 'Левый', body: 'Текст слева' }, right: { heading: 'Правый', bullets: ['Пункт 1', 'Пункт 2'] }},
  mockup:       { title: 'Мокап', description: 'Описание интерфейса', metric: { value: '+X%', label: 'Метрика' }},
}

export default function App() {
  const [slides, setSlides] = useState(DEMO_SLIDES)
  const [activeId, setActiveId] = useState(DEMO_SLIDES[0].id)

  const activeSlide = slides.find(s => s.id === activeId) || null

  function handleUpdate(updated) {
    setSlides(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  function handleAddSlide() {
    const layout = 'cover'
    const newSlide = { id: nextId++, layout, data: { ...BLANK_LAYOUTS[layout] } }
    setSlides(prev => [...prev, newSlide])
    setActiveId(newSlide.id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d0d0d' }}>
      <Header onAddSlide={handleAddSlide} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar slides={slides} activeId={activeId} onSelect={setActiveId} />
        <Canvas slide={activeSlide} />
        <PropsPanel slide={activeSlide} onUpdate={handleUpdate} />
      </div>
    </div>
  )
}
