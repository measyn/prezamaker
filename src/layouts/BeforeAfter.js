import { COLORS, SPACING, SLIDE, RADII } from '../design-system/tokens.js'
import { pickType, wrapText } from '../design-system/typography.js'
import { esc, logoBadge, svgLines } from './utils.js'

export function renderBeforeAfter(data) {
  const { w, h } = SLIDE
  const { title = '', description = '', before = '', after = '', metric = null } = data

  const t = pickType('slideTitle', title)
  const titleLines = wrapText(title, t.size, w - SPACING.slideH * 2 - 120)

  const contentY = 270
  const contentH = h - contentY - SPACING.slideV

  // Left: description + metric badge
  const leftW = Math.round(w * 0.38)
  const leftX = SPACING.slideH

  // Right: before/after cards
  const rightX = leftX + leftW + SPACING.gap
  const rightW = w - rightX - SPACING.slideH
  const cardH = Math.round((contentH - SPACING.gap) / 2)

  const dt = pickType('cardBody', description)
  const descLines = wrapText(description, dt.size, leftW - 16)

  const bt = pickType('cardBody', before)
  const beforeLines = wrapText(before, bt.size, rightW - SPACING.inner * 2)

  const at = pickType('cardBody', after)
  const afterLines = wrapText(after, at.size, rightW - SPACING.inner * 2)

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

  <!-- description -->
  ${svgLines({
    lines: descLines,
    x: leftX,
    y: contentY + 32,
    fontFamily: 'Arial, sans-serif',
    fontSize: dt.size,
    fontWeight: dt.weight,
    fill: COLORS.textAccent,
    lineHeight: dt.lineHeight,
  })}

  ${metric ? `
  <!-- metric badge -->
  <rect x="${leftX}" y="${h - SPACING.slideV - 130}" width="340" height="120"
        rx="${RADII.badge}" fill="${COLORS.cardDark}"/>
  <text x="${leftX + 24}" y="${h - SPACING.slideV - 130 + 72}"
        font-family="Arial Black, Arial" font-size="52" font-weight="800"
        fill="${COLORS.white}">${esc(metric.value)}</text>
  <text x="${leftX + 24}" y="${h - SPACING.slideV - 130 + 104}"
        font-family="Arial, sans-serif" font-size="22" font-weight="700"
        fill="${COLORS.metricLabel}">${esc(metric.label)}</text>
  ` : ''}

  <!-- БЫЛО -->
  <rect x="${rightX}" y="${contentY}" width="${rightW}" height="${cardH}"
        rx="${RADII.card}" fill="${COLORS.cardDark}"/>
  <text x="${rightX + SPACING.inner}" y="${contentY + 36}"
        font-family="Arial, sans-serif" font-size="20" font-weight="600"
        fill="${COLORS.textAccent}">БЫЛО</text>
  ${svgLines({
    lines: beforeLines,
    x: rightX + SPACING.inner,
    y: contentY + 36 + bt.size + 8,
    fontFamily: 'Arial, sans-serif',
    fontSize: bt.size,
    fontWeight: bt.weight,
    fill: COLORS.white,
    lineHeight: bt.lineHeight,
  })}

  <!-- СТАЛО -->
  <rect x="${rightX}" y="${contentY + cardH + SPACING.gap}" width="${rightW}" height="${cardH}"
        rx="${RADII.card}" fill="${COLORS.cardLight}"/>
  <text x="${rightX + SPACING.inner}" y="${contentY + cardH + SPACING.gap + 36}"
        font-family="Arial, sans-serif" font-size="20" font-weight="600"
        fill="${COLORS.orange}">СТАЛО</text>
  ${svgLines({
    lines: afterLines,
    x: rightX + SPACING.inner,
    y: contentY + cardH + SPACING.gap + 36 + at.size + 8,
    fontFamily: 'Arial, sans-serif',
    fontSize: at.size,
    fontWeight: at.weight,
    fill: COLORS.cardDark,
    lineHeight: at.lineHeight,
  })}

  ${logoBadge()}
</svg>`
}
