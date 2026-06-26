import { COLORS, SPACING, SLIDE, RADII } from '../design-system/tokens.js'
import { pickType, wrapText } from '../design-system/typography.js'
import { esc, logoBadge, svgLines } from './utils.js'

export function renderTwoCol(data) {
  const { w, h } = SLIDE
  const { title = '', left = {}, right = {} } = data

  const t = pickType('slideTitle', title)
  const titleLines = wrapText(title, t.size, w - SPACING.slideH * 2 - 120)

  const contentY = 270
  const contentH = h - contentY - SPACING.slideV
  const colW = Math.floor((w - SPACING.slideH * 2 - SPACING.gap) / 2)

  const lhT = pickType('cardHeading', left.heading || '')
  const lhLines = wrapText(left.heading || '', lhT.size, colW - SPACING.inner * 2)
  const lhH = lhLines.length * lhT.size * lhT.lineHeight

  const lbT = pickType('cardBody', left.body || '')
  const lbLines = wrapText(left.body || '', lbT.size, colW - SPACING.inner * 2)

  const rhT = pickType('cardHeading', right.heading || '')
  const rhLines = wrapText(right.heading || '', rhT.size, colW - SPACING.inner * 2)
  const rhH = rhLines.length * rhT.size * rhT.lineHeight

  const bullets = (right.bullets || []).slice(0, 6)

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

  <!-- left card -->
  <rect x="${SPACING.slideH}" y="${contentY}" width="${colW}" height="${contentH}"
        rx="${RADII.card}" fill="${COLORS.cardDark}"/>
  ${svgLines({
    lines: lhLines,
    x: SPACING.slideH + SPACING.inner,
    y: contentY + SPACING.inner + lhT.size,
    fontFamily: 'Arial Black, Arial',
    fontSize: lhT.size,
    fontWeight: lhT.weight,
    fill: COLORS.white,
    lineHeight: lhT.lineHeight,
  })}
  ${svgLines({
    lines: lbLines,
    x: SPACING.slideH + SPACING.inner,
    y: contentY + SPACING.inner + lhT.size + lhH + 24,
    fontFamily: 'Arial, sans-serif',
    fontSize: lbT.size,
    fontWeight: lbT.weight,
    fill: COLORS.textAccent,
    lineHeight: lbT.lineHeight,
  })}

  <!-- right card -->
  <rect x="${SPACING.slideH + colW + SPACING.gap}" y="${contentY}" width="${colW}" height="${contentH}"
        rx="${RADII.card}" fill="${COLORS.cardLight}"/>
  ${svgLines({
    lines: rhLines,
    x: SPACING.slideH + colW + SPACING.gap + SPACING.inner,
    y: contentY + SPACING.inner + rhT.size,
    fontFamily: 'Arial Black, Arial',
    fontSize: rhT.size,
    fontWeight: rhT.weight,
    fill: COLORS.cardDark,
    lineHeight: rhT.lineHeight,
  })}
  ${bullets.map((b, bi) => {
    const bt = pickType('bullet', b)
    const bLines = wrapText(b, bt.size, colW - SPACING.inner * 2 - 24)
    const startY = contentY + SPACING.inner + rhT.size + rhH + 24 + bi * (bt.size * bt.lineHeight * bLines.length + 12)
    return svgLines({
      lines: bLines.map((l, li) => li === 0 ? `→ ${l}` : `   ${l}`),
      x: SPACING.slideH + colW + SPACING.gap + SPACING.inner,
      y: startY,
      fontFamily: 'Arial, sans-serif',
      fontSize: bt.size,
      fontWeight: bt.weight,
      fill: COLORS.cardDark,
      lineHeight: bt.lineHeight,
    })
  }).join('\n')}

  ${logoBadge()}
</svg>`
}
