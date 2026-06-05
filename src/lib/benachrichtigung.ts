/**
 * Web-Benachrichtigungen (so weit iOS/iPadOS es zulässt).
 * Hinweis: Auf iOS funktionieren Benachrichtigungen am zuverlässigsten,
 * wenn die App über „Zum Home-Bildschirm" installiert wurde. Ein Auslösen,
 * während die App vollständig geschlossen ist, ist ohne Push-Server nicht möglich.
 */

export type Erlaubnis = NotificationPermission | 'unsupported'

export function unterstuetzt(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function status(): Erlaubnis {
  if (!unterstuetzt()) return 'unsupported'
  return Notification.permission
}

export async function erlauben(): Promise<Erlaubnis> {
  if (!unterstuetzt()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export function zeige(titel: string, text: string): void {
  try {
    if (unterstuetzt() && Notification.permission === 'granted') {
      const icon = `${import.meta.env.BASE_URL}icon-192.png`
      // eslint-disable-next-line no-new
      new Notification(titel, { body: text, icon, badge: icon, tag: 'lt-timer' })
    }
  } catch {
    // ignorieren
  }
}
