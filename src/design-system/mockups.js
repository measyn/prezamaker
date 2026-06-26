export function iphoneMockup({ x, y, w, content = '', dark = true }) {
  const h = Math.round(w * 2.16)
  const r = Math.round(w * 0.12)
  const screenPad = Math.round(w * 0.04)
  const screenY = Math.round(y + h * 0.08)
  const screenH = Math.round(h * 0.84)
  const bg = dark ? '#1A1A1A' : '#F5F5F5'
  const screenBg = dark ? '#0A0A0A' : '#FFFFFF'
  const speakerColor = dark ? '#333333' : '#CCCCCC'

  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}"
          rx="${r}" fill="${bg}" stroke="#333333" stroke-width="2"/>
    <rect x="${x + screenPad}" y="${screenY}"
          width="${w - screenPad * 2}" height="${screenH}"
          rx="${Math.round(r * 0.6)}" fill="${screenBg}"/>
    <rect x="${Math.round(x + w * 0.35)}" y="${Math.round(y + h * 0.025)}"
          width="${Math.round(w * 0.3)}" height="${Math.round(h * 0.012)}"
          rx="4" fill="${speakerColor}"/>
    ${content}
  `
}

export function androidMockup({ x, y, w, content = '', dark = true }) {
  const h = Math.round(w * 2.05)
  const r = Math.round(w * 0.08)
  const screenPad = Math.round(w * 0.03)
  const screenY = Math.round(y + h * 0.06)
  const screenH = Math.round(h * 0.88)
  const bg = dark ? '#1A1A1A' : '#F0F0F0'
  const screenBg = dark ? '#0A0A0A' : '#FFFFFF'

  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}"
          rx="${r}" fill="${bg}" stroke="#444444" stroke-width="2"/>
    <rect x="${x + screenPad}" y="${screenY}"
          width="${w - screenPad * 2}" height="${screenH}"
          rx="${Math.round(r * 0.5)}" fill="${screenBg}"/>
    <circle cx="${Math.round(x + w * 0.5)}" cy="${Math.round(y + h * 0.03)}"
            r="${Math.round(w * 0.03)}" fill="${dark ? '#333333' : '#BBBBBB'}"/>
    ${content}
  `
}
