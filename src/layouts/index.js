export { renderCover }      from './Cover.js'
export { renderStats }      from './Stats.js'
export { renderThreeCards } from './ThreeCards.js'
export { renderBeforeAfter } from './BeforeAfter.js'
export { renderTable }      from './Table.js'
export { renderTimeline }   from './Timeline.js'
export { renderTwoCol }     from './TwoCol.js'
export { renderMockup }     from './Mockup.js'

import { renderCover }      from './Cover.js'
import { renderStats }      from './Stats.js'
import { renderThreeCards } from './ThreeCards.js'
import { renderBeforeAfter } from './BeforeAfter.js'
import { renderTable }      from './Table.js'
import { renderTimeline }   from './Timeline.js'
import { renderTwoCol }     from './TwoCol.js'
import { renderMockup }     from './Mockup.js'

export const RENDERERS = {
  cover:        renderCover,
  stats:        renderStats,
  three_cards:  renderThreeCards,
  before_after: renderBeforeAfter,
  table:        renderTable,
  timeline:     renderTimeline,
  two_col:      renderTwoCol,
  mockup:       renderMockup,
}

export function renderSlide(slide) {
  const fn = RENDERERS[slide.layout]
  if (!fn) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#FF5500"/><text x="72" y="200" font-size="48" fill="white">Неизвестный лейаут: ${slide.layout}</text></svg>`
  return fn(slide.data)
}
