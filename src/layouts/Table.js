import { COLORS, SPACING, SLIDE, RADII } from '../design-system/tokens.js'
import { pickType, wrapText } from '../design-system/typography.js'
import { esc, logoBadge, svgLines } from './utils.js'

export function renderTable(data) {
  const { w, h } = SLIDE
  const { title = '', columns = ['Категория', 'Детали'], rows = [] } = data

  const t = pickType('slideTitle', title)
  const titleLines = wrapText(title, t.size, w - SPACING.slideH * 2 - 120)

  const contentY = 270
  const contentW = w - SPACING.slideH * 2
  const maxRows = Math.min(rows.length, 7)
  const rowH = Math.floor((h - contentY - SPACING.slideV - 56) / (maxRows + 1))

  const col1W = Math.round(contentW * 0.28)
  const col2W = Math.round(contentW * 0.52)
  const col3W = contentW - col1W - col2W

  const headerBg = COLORS.cardDark
  const evenBg = 'rgba(255,255,255,0.12)'
  const oddBg = 'rgba(0,0,0,0.08)'

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

  <!-- table container -->
  <rect x="${SPACING.slideH}" y="${contentY}" width="${contentW}" height="${h - contentY - SPACING.slideV}"
        rx="${RADII.card}" fill="rgba(0,0,0,0.18)"/>

  <!-- header row -->
  <rect x="${SPACING.slideH}" y="${contentY}" width="${contentW}" height="${rowH}"
        rx="${RADII.card}" fill="${headerBg}"/>
  <rect x="${SPACING.slideH}" y="${contentY + rowH - 8}" width="${contentW}" height="8" fill="${headerBg}"/>
  <text x="${SPACING.slideH + 24}" y="${contentY + rowH / 2 + 10}"
        font-family="Arial Black, Arial" font-size="22" font-weight="700"
        fill="${COLORS.white}">${esc(columns[0] || '')}</text>
  <text x="${SPACING.slideH + col1W + 24}" y="${contentY + rowH / 2 + 10}"
        font-family="Arial Black, Arial" font-size="22" font-weight="700"
        fill="${COLORS.white}">${esc(columns[1] || '')}</text>
  ${col3W > 80 && columns[2] ? `<text x="${SPACING.slideH + col1W + col2W + 24}" y="${contentY + rowH / 2 + 10}"
        font-family="Arial Black, Arial" font-size="22" font-weight="700"
        fill="${COLORS.metricLabel}">${esc(columns[2])}</text>` : ''}

  <!-- data rows -->
  ${rows.slice(0, maxRows).map((row, i) => {
    const ry = contentY + rowH * (i + 1)
    const bg = i % 2 === 0 ? evenBg : oddBg
    const ct = pickType('cardBody', row.category || '')
    const dt = pickType('cardBody', row.detail || '')
    const catLines = wrapText(row.category || '', ct.size, col1W - 32)
    const detLines = wrapText(row.detail || '', dt.size, col2W - 32)
    return `
    <rect x="${SPACING.slideH}" y="${ry}" width="${contentW}" height="${rowH}" fill="${bg}"/>
    <line x1="${SPACING.slideH}" y1="${ry}" x2="${SPACING.slideH + contentW}" y2="${ry}"
          stroke="${COLORS.separator}" stroke-width="1"/>
    ${svgLines({
      lines: catLines,
      x: SPACING.slideH + 24,
      y: ry + Math.max(0, (rowH - ct.size * ct.lineHeight * catLines.length) / 2) + ct.size,
      fontFamily: 'Arial, sans-serif',
      fontSize: ct.size,
      fontWeight: 700,
      fill: COLORS.white,
      lineHeight: ct.lineHeight,
    })}
    ${svgLines({
      lines: detLines,
      x: SPACING.slideH + col1W + 24,
      y: ry + Math.max(0, (rowH - dt.size * dt.lineHeight * detLines.length) / 2) + dt.size,
      fontFamily: 'Arial, sans-serif',
      fontSize: dt.size,
      fontWeight: dt.weight,
      fill: COLORS.textAccent,
      lineHeight: dt.lineHeight,
    })}
    ${row.metric ? `<text x="${SPACING.slideH + col1W + col2W + 24}" y="${ry + rowH / 2 + 10}"
          font-family="Arial Black, Arial" font-size="22" font-weight="800"
          fill="${COLORS.metricLabel}">${esc(row.metric)}</text>` : ''}
    `
  }).join('')}

  ${logoBadge()}
</svg>`
}
