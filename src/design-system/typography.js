export const TYPE_SCALE = {
  slideTitle: [
    { maxChars: 40,       size: 72, weight: 800, lineHeight: 1.1  },
    { maxChars: 70,       size: 56, weight: 800, lineHeight: 1.1  },
    { maxChars: 120,      size: 42, weight: 700, lineHeight: 1.15 },
    { maxChars: Infinity, size: 36, weight: 700, lineHeight: 1.2  },
  ],
  coverTitle: [
    { maxChars: 30,       size: 108, weight: 900, lineHeight: 1.05 },
    { maxChars: 55,       size: 80,  weight: 900, lineHeight: 1.05 },
    { maxChars: 80,       size: 64,  weight: 800, lineHeight: 1.1  },
    { maxChars: Infinity, size: 52,  weight: 800, lineHeight: 1.15 },
  ],
  cardHeading: [
    { maxChars: 25,       size: 42, weight: 700, lineHeight: 1.2  },
    { maxChars: 45,       size: 32, weight: 700, lineHeight: 1.2  },
    { maxChars: 70,       size: 26, weight: 600, lineHeight: 1.25 },
    { maxChars: Infinity, size: 22, weight: 600, lineHeight: 1.3  },
  ],
  cardBody: [
    { maxChars: 120,      size: 27, weight: 400, lineHeight: 1.5 },
    { maxChars: 240,      size: 22, weight: 400, lineHeight: 1.5 },
    { maxChars: Infinity, size: 18, weight: 400, lineHeight: 1.5 },
  ],
  bullet: [
    { maxChars: 50,       size: 24, weight: 400, lineHeight: 1.4 },
    { maxChars: Infinity, size: 20, weight: 400, lineHeight: 1.4 },
  ],
  fixed: {
    body:        { size: 27, weight: 400, lineHeight: 1.5  },
    caption:     { size: 21, weight: 400, lineHeight: 1.4  },
    metricValue: { size: 96, weight: 800, lineHeight: 1.0  },
    metricLabel: { size: 30, weight: 700, lineHeight: 1.0  },
    chip:        { size: 22, weight: 600, lineHeight: 1.0  },
  },
}

export function pickType(scaleName, text) {
  const steps = TYPE_SCALE[scaleName]
  if (!steps) return TYPE_SCALE.fixed[scaleName] || TYPE_SCALE.fixed.body
  return steps.find(s => (text || '').length <= s.maxChars)
}

export function svgTypeAttrs(scaleName, text) {
  const t = pickType(scaleName, text)
  return `font-size="${t.size}" font-weight="${t.weight}"`
}

export function estimateLines(text, scaleName, containerWidth) {
  const t = pickType(scaleName, text)
  const charsPerLine = Math.floor(containerWidth / (t.size * 0.55))
  const words = (text || '').split(' ')
  let lines = 1, lineLen = 0
  words.forEach(w => {
    if (lineLen + w.length + 1 > charsPerLine) { lines++; lineLen = w.length }
    else lineLen += w.length + 1
  })
  return { lines, lineHeight: t.lineHeight, totalHeight: lines * t.size * t.lineHeight, size: t.size }
}

export function wrapText(text, fontSize, maxWidth) {
  const charsPerLine = Math.floor(maxWidth / (fontSize * 0.55))
  const words = (text || '').split(' ')
  const lines = []
  let current = ''
  words.forEach(word => {
    if ((current + ' ' + word).trim().length > charsPerLine) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  })
  if (current) lines.push(current.trim())
  return lines.length ? lines : ['']
}
