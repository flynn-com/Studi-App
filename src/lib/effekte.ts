/**
 * Belohnende Effekte ohne externe Bibliothek:
 * - Konfetti per DOM-Partikeln (Web Animations API)
 * - kurzer angenehmer Erfolgs-Sound per WebAudio
 * - Vibration (sofern vom Gerät unterstützt; iOS-Safari ignoriert es)
 */

function reduziert(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

const FARBEN = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9']

export function konfetti(menge = 90): void {
  if (typeof document === 'undefined' || reduziert()) return

  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden'
  document.body.appendChild(container)

  const w = window.innerWidth
  const h = window.innerHeight
  const startX = w / 2

  for (let i = 0; i < menge; i++) {
    const p = document.createElement('div')
    const size = 6 + Math.random() * 6
    const farbe = FARBEN[(Math.random() * FARBEN.length) | 0]
    const rund = Math.random() > 0.5
    p.style.cssText =
      `position:absolute;top:${h * 0.28}px;left:${startX}px;width:${size}px;height:${size}px;` +
      `background:${farbe};border-radius:${rund ? '50%' : '2px'};will-change:transform,opacity`
    container.appendChild(p)

    const winkel = Math.random() * Math.PI * 2
    const kraft = 120 + Math.random() * 320
    const dx = Math.cos(winkel) * kraft
    const dy = Math.sin(winkel) * kraft - (160 + Math.random() * 160) // tendenziell nach oben
    const drehung = (Math.random() - 0.5) * 720
    const dauer = 1100 + Math.random() * 900

    p.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy + 480}px) rotate(${drehung}deg)`,
          opacity: 0,
        },
      ],
      { duration: dauer, easing: 'cubic-bezier(0.2,0.6,0.3,1)', fill: 'forwards' },
    )
  }

  setTimeout(() => container.remove(), 2200)
}

let audioCtx: AudioContext | null = null

export function erfolgSound(): void {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    audioCtx = audioCtx || new AC()
    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume()

    // kleiner, freundlicher Dreiklang
    const noten = [523.25, 659.25, 783.99] // C5, E5, G5
    noten.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const t0 = ctx.currentTime + i * 0.08
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + 0.34)
    })
  } catch {
    // Audio nicht verfügbar – ignorieren
  }
}

export function vibrieren(muster: number | number[] = 30): void {
  try {
    navigator.vibrate?.(muster)
  } catch {
    // nicht unterstützt (u. a. iOS) – ignorieren
  }
}

/** Großes Feedback: für abgeschlossene Themen / freigeschaltete Abzeichen. */
export function feiern(): void {
  konfetti()
  erfolgSound()
  vibrieren([20, 40, 30])
}

/** Kleines Feedback: für abgehakte Unterpunkte u. Ä. */
export function tick(): void {
  vibrieren(15)
}
