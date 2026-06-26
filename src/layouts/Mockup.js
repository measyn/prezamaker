import { COLORS, SPACING, SLIDE, RADII } from '../design-system/tokens.js'
import { pickType, wrapText } from '../design-system/typography.js'
import { esc, logoBadge, svgLines } from './utils.js'
import { iphoneMockup } from '../design-system/mockups.js'

export function renderMockup(data) {
  const { w, h } = SLIDE
  const { title = '', description = '', metric = null } = data

  const t = pickType('slideTitle', title)
  const titleLines = wrapText(title, t.size, Math.round(w * 0.42) - SPACING.slideH)

  const contentY = 270
  const contentH = h - contentY - SPACING.slideV

  const leftW = Math.round(w * 0.42)
  const dt = pickType('cardBody', description)
  const descLines = wrapText(description, dt.size, leftW - SPACING.slideH - 16)

  // Two phone mockups on the right
  const rightX = leftW + SPACING.gap
  const phoneW = Math.round((w - rightX - SPACING.slideH - SPACING.gap) / 2)
  const phoneH = Math.round(phoneW * 2.16)
  const phoneY = contentY + Math.round((contentH - phoneH) / 2)

  const phone1 = iphoneMockup({
    x: rightX,
    y: phoneY,
    w: phoneW,
    dark: true,
    content: `<rect x="${rightX + Math.round(phoneW * 0.04)}" y="${phoneY + Math.round(phoneH * 0.08)}"
      width="${phoneW - Math.round(phoneW * 0.08)}" height="${Math.round(phoneH * 0.84)}"
      rx="12" fill="#1A2A3A"/>
    <text x="${rightX + Math.round(phoneW * 0.5)}" y="${phoneY + Math.round(phoneH * 0.5)}"
      font-family="Arial" font-size="14" fill="rgba(255,255,255,0.3)"
      text-anchor="middle">БЫЛО</text>`,
  })

  const phone2 = iphoneMockup({
    x: rightX + phoneW + SPACING.gap,
    y: phoneY,
    w: phoneW,
    dark: false,
    content: `<rect x="${rightX + phoneW + SPACING.gap + Math.round(phoneW * 0.04)}" y="${phoneY + Math.round(phoneH * 0.08)}"
      width="${phoneW - Math.round(phoneW * 0.08)}" height="${Math.round(phoneH * 0.84)}"
      rx="12" fill="#F5E8DA"/>
    <text x="${rightX + phoneW + SPACING.gap + Math.round(phoneW * 0.5)}" y="${phoneY + Math.round(phoneH * 0.5)}"
      font-family="Arial" font-size="14" fill="rgba(0,0,0,0.3)"
      text-anchor="middle">СТАЛО</text>`,
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${COLORS.orange}"/>

  <!-- title (left side) -->
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
    x: SPACING.slideH,
    y: contentY + 32,
    fontFamily: 'Arial, sans-serif',
    fontSize: dt.size,
    fontWeight: dt.weight,
    fill: COLORS.textAccent,
    lineHeight: dt.lineHeight,
  })}

  ${metric ? `
  <!-- metric badge -->
  <rect x="${SPACING.slideH}" y="${h - SPACING.slideV - 130}" width="320" height="110"
        rx="${RADII.badge}" fill="${COLORS.cardDark}"/>
  <text x="${SPACING.slideH + 20}" y="${h - SPACING.slideV - 130 + 68}"
        font-family="Arial Black, Arial" font-size="52" font-weight="800"
        fill="${COLORS.white}">${esc(metric.value)}</text>
  <text x="${SPACING.slideH + 20}" y="${h - SPACING.slideV - 130 + 100}"
        font-family="Arial, sans-serif" font-size="20" font-weight="700"
        fill="${COLORS.metricLabel}">${esc(metric.label)}</text>
  ` : ''}

  <!-- phone mockups -->
  ${phone1}
  ${phone2}

  ${logoBadge()}
</svg>`
}
