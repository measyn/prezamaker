import { COLORS, SPACING, SLIDE, RADII } from '../design-system/tokens.js'
import { pickType, wrapText } from '../design-system/typography.js'
import { esc, logoBadge, svgLines } from './utils.js'

export function renderStats(data) {
  const { w, h } = SLIDE
  const { title = '', metrics = [] } = data

  const t = pickType('slideTitle', title)
  const titleLines = wrapText(title, t.size, w - SPACING.slideH * 2 - 120)

  const contentY = 270
  const contentH = h - contentY - SPACING.slideV
  const count = Math.min(metrics.length, 6) || 1
  const cols = count <= 3 ? count : Math.ceil(count / 2)
  const rows = count <= 3 ? 1 : 2

  const cardW = Math.floor((w - SPACING.slideH * 2 - SPACING.gap * (cols - 1)) / cols)
  const cardH = Math.floor((contentH - (rows > 1 ? SPACING.gap : 0)) / rows)

  const cards = metrics.slice(0, 6).map((m, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const cx = SPACING.slideH + col * (cardW + SPACING.gap)
    const cy = contentY + row * (cardH + SPACING.gap)
    const isDark = i % 2 === 0

    const bg = isDark ? COLORS.cardDark : COLORS.cardLight
    const valueFill = isDark ? COLORS.metricValue : COLORS.cardDark
    const labelFill = isDark ? COLORS.metricLabel : COLORS.orange
    const subLabelFill = isDark ? COLORS.textAccent : '#888888'

    const metricLines = wrapText(m.value || '', 64, cardW - SPACING.inner * 2)

    return `
    <rect x="${cx}" y="${cy}" width="${cardW}" height="${cardH}"
          rx="${RADII.card}" fill="${bg}"/>
    <text x="${cx + SPACING.inner}" y="${cy + cardH * 0.5}"
          font-family="Arial Black, Arial" font-size="64" font-weight="800"
          fill="${valueFill}">${esc(metricLines[0] || m.value)}</text>
    <text x="${cx + SPACING.inner}" y="${cy + cardH * 0.5 + 50}"
          font-family="Arial, sans-serif" font-size="22" font-weight="700"
          fill="${labelFill}">${esc(m.label)}</text>
    ${m.sublabel ? `<text x="${cx + SPACING.inner}" y="${cy + cardH * 0.5 + 82}"
          font-family="Arial, sans-serif" font-size="18" font-weight="400"
          fill="${subLabelFill}">${esc(m.sublabel)}</text>` : ''}
    `
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${COLORS.orange}"/>

  <!-- title -->
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

  ${cards}
  ${logoBadge()}
</svg>`
}
