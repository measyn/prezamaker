import { COLORS, SPACING, SLIDE, RADII } from '../design-system/tokens.js'
import { pickType, wrapText } from '../design-system/typography.js'
import { esc, logoBadge, svgLines } from './utils.js'

export function renderThreeCards(data) {
  const { w, h } = SLIDE
  const { title = '', cards = [] } = data

  const t = pickType('slideTitle', title)
  const titleLines = wrapText(title, t.size, w - SPACING.slideH * 2 - 120)

  const contentY = 270
  const contentH = h - contentY - SPACING.slideV
  const cardW = Math.floor((w - SPACING.slideH * 2 - SPACING.gap * 2) / 3)
  const cardH = contentH

  const cardEls = (cards.slice(0, 3)).map((card, i) => {
    const cx = SPACING.slideH + i * (cardW + SPACING.gap)
    const cy = contentY
    const isDark = i === 1
    const bg = isDark ? COLORS.cardDark : COLORS.cardLight
    const headFill = isDark ? COLORS.white : COLORS.cardDark
    const bodyFill = isDark ? COLORS.textAccent : '#555555'
    const bulletFill = isDark ? COLORS.textAccent : COLORS.cardDark

    const ht = pickType('cardHeading', card.title || '')
    const headLines = wrapText(card.title || '', ht.size, cardW - SPACING.inner * 2)
    const headBlockH = headLines.length * ht.size * ht.lineHeight

    const bullets = (card.bullets || []).slice(0, 5)

    return `
    <rect x="${cx}" y="${cy}" width="${cardW}" height="${cardH}"
          rx="${RADII.card}" fill="${bg}"/>
    <!-- icon/emoji -->
    <text x="${cx + SPACING.inner}" y="${cy + SPACING.inner + 48}"
          font-size="48" font-family="Arial">${esc(card.icon || '•')}</text>
    <!-- heading -->
    ${svgLines({
      lines: headLines,
      x: cx + SPACING.inner,
      y: cy + SPACING.inner + 120,
      fontFamily: 'Arial Black, Arial',
      fontSize: ht.size,
      fontWeight: ht.weight,
      fill: headFill,
      lineHeight: ht.lineHeight,
    })}
    <!-- bullets -->
    ${bullets.map((b, bi) => {
      const bt = pickType('bullet', b)
      const bLines = wrapText(b, bt.size, cardW - SPACING.inner * 2 - 20)
      return svgLines({
        lines: bLines.map((l, li) => li === 0 ? `→ ${l}` : `   ${l}`),
        x: cx + SPACING.inner,
        y: cy + SPACING.inner + 120 + headBlockH + 24 + bi * (bt.size * bt.lineHeight * (bLines.length > 1 ? bLines.length : 1) + 8),
        fontFamily: 'Arial, sans-serif',
        fontSize: bt.size,
        fontWeight: bt.weight,
        fill: bulletFill,
        lineHeight: bt.lineHeight,
      })
    }).join('\n')}
    `
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${COLORS.orange}"/>

  ${svgLines({
    lines: titleLines,
    x: SPACING.slideH,
    y: SPACING.slideV + t.size,
    fontFamily: 'Arial Black, Arial',
    fontSize: t.size,
    fontWeight: t.weight,
    fill: COLORS.textOnOrange,
    lineHeight: t.lineHeight,
  })}

  ${cardEls}
  ${logoBadge()}
</svg>`
}
