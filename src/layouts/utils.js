// Escape XML special chars for SVG text content
export function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// OK logo badge — top-right of every slide
export function logoBadge() {
  return `
    <rect x="1776" y="40" width="100" height="100" rx="20"
          fill="white" opacity="0.18"/>
    <text x="1826" y="102" font-family="Arial Black, Arial" font-size="32"
          font-weight="900" fill="white" text-anchor="middle">ОК</text>
  `
}

// Render multiple SVG <text> lines from wrapText result
export function svgLines({ lines, x, y, fontFamily, fontSize, fontWeight, fill, lineHeight = 1.2 }) {
  return lines.map((line, i) =>
    `<text x="${x}" y="${y + i * fontSize * lineHeight}"
           font-family="${fontFamily}" font-size="${fontSize}"
           font-weight="${fontWeight}" fill="${fill}">${esc(line)}</text>`
  ).join('\n')
}
