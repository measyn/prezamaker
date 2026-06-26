import { COLORS, SPACING, SLIDE, RADII } from '../design-system/tokens.js'
import { pickType, wrapText } from '../design-system/typography.js'
import { esc, logoBadge, svgLines } from './utils.js'

export function renderTimeline(data) {
  const { w, h } = SLIDE
  const { title = '', points = [] } = data

  const t = pickType('slideTitle', title)
  const titleLines = wrapText(title, t.size, w - SPACING.slideH * 2 - 120)

  const count = Math.min(points.length, 6) || 1
  const contentY = 280
  const contentH = h - contentY - SPACING.slideV

  const pointW = Math.floor((w - SPACING.slideH * 2 - SPACING.gap * (count - 1)) / count)
  const lineY = contentY + Math.round(contentH * 0.35)

  const pointEls = points.slice(0, count).map((pt, i) => {
    const px = SPACING.slideH + i * (pointW + SPACING.gap)
    const isActive = pt.active === true || pt.active === 'true'

    const dotR = isActive ? 20 : 14
    const dotFill = isActive ? COLORS.white : 'rgba(255,255,255,0.4)'
    const dotStroke = COLORS.white

    const vt = pickType('cardBody', pt.value || '')
    const lt = pickType('bullet', pt.label || '')
    const valLines = wrapText(pt.value || '', vt.size, pointW - 16)
    const lblLines = wrapText(pt.label || '', lt.size, pointW - 16)

    const cardX = px
    const cardY = isActive ? lineY - 170 : lineY - 140
    const cardW2 = pointW
    const cardH2 = isActive ? 120 : 100

    return `
    <!-- value card -->
    <rect x="${cardX}" y="${cardY}" width="${cardW2}" height="${cardH2}"
          rx="${RADII.badge}" fill="${isActive ? COLORS.cardDark : 'rgba(0,0,0,0.25)'}"/>
    ${svgLines({
      lines: valLines,
      x: cardX + 20,
      y: cardY + (isActive ? 44 : 36),
      fontFamily: 'Arial Black, Arial',
      fontSize: isActive ? 36 : 28,
      fontWeight: 800,
      fill: isActive ? COLORS.white : 'rgba(255,255,255,0.8)',
      lineHeight: 1.2,
    })}

    <!-- connector line to dot -->
    <line x1="${px + pointW / 2}" y1="${cardY + cardH2}"
          x2="${px + pointW / 2}" y2="${lineY - dotR}"
          stroke="${COLORS.white}" stroke-width="${isActive ? 3 : 1}" opacity="0.5"/>

    <!-- timeline dot -->
    <circle cx="${px + pointW / 2}" cy="${lineY}"
            r="${dotR}" fill="${dotFill}" stroke="${dotStroke}" stroke-width="3"/>

    <!-- label below -->
    ${svgLines({
      lines: lblLines,
      x: cardX,
      y: lineY + dotR + lt.size + 8,
      fontFamily: 'Arial, sans-serif',
      fontSize: lt.size,
      fontWeight: lt.weight,
      fill: isActive ? COLORS.white : COLORS.textAccent,
      lineHeight: lt.lineHeight,
    })}
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

  <!-- timeline horizontal line -->
  <line x1="${SPACING.slideH}" y1="${lineY}" x2="${w - SPACING.slideH}" y2="${lineY}"
        stroke="${COLORS.white}" stroke-width="3" opacity="0.4"/>

  ${pointEls}
  ${logoBadge()}
</svg>`
}
