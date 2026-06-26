import { COLORS, SPACING, SLIDE } from '../design-system/tokens.js'
import { pickType, wrapText } from '../design-system/typography.js'
import { esc, logoBadge, svgLines } from './utils.js'

export function renderCover(data) {
  const { w, h } = SLIDE
  const { title = 'Презентация', subtitle = '' } = data

  const t = pickType('coverTitle', title)
  const titleLines = wrapText(title, t.size, w * 0.6)
  const titleBlockH = titleLines.length * t.size * t.lineHeight

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <!-- background -->
  <rect width="${w}" height="${h}" fill="${COLORS.orange}"/>

  <!-- decorative circles -->
  <circle cx="${w * 0.82}" cy="${h * 0.3}" r="380" fill="${COLORS.orangeLight}" opacity="0.5"/>
  <circle cx="${w * 0.9}" cy="${h * 0.75}" r="200" fill="${COLORS.orangeDark}" opacity="0.4"/>

  <!-- title -->
  ${svgLines({
    lines: titleLines,
    x: SPACING.slideH,
    y: h * 0.28,
    fontFamily: 'Arial Black, Arial',
    fontSize: t.size,
    fontWeight: t.weight,
    fill: COLORS.textOnOrange,
    lineHeight: t.lineHeight,
  })}

  ${subtitle ? `<text x="${SPACING.slideH}" y="${h * 0.28 + titleBlockH + 40}"
        font-family="Arial, sans-serif" font-size="27" font-weight="400"
        fill="${COLORS.textAccent}">${esc(subtitle)}</text>` : ''}

  ${logoBadge()}
</svg>`
}
