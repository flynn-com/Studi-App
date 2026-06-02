# Lern-Tracker

Eine kleine Web-App, die dich beim Lernen auf Prüfungen unterstützt. Du legst
deine **Fächer** an, wählst je Fach **Klausur** oder **Projektabgabe**, und siehst
alle Termine in einer **Kalenderübersicht**.

## Funktionen

- **Dashboard „Was lerne ich heute?"** – Fächer nach Dringlichkeit sortiert
  (Termin-Nähe × Gewichtung × offener Lernstoff), mit Countdown-Badge.
- **Fächer** – anlegen/bearbeiten mit Typ, Termin, Farbe, Gewichtung, Zielnote.
  Pro Fach **Themen/Kapitel** abhaken → Fortschrittsbalken.
- **Kalender** – Monatsansicht mit farbigen Terminmarkern + Liste kommender Termine.
- **Lernzeit** – Pomodoro-Timer (25/5 min) und manuelle Erfassung, Statistik pro Fach.
- **Noten** – Zielnote vs. erreichte Note, Notenschnitt.

Alle Daten werden **lokal im Browser** (localStorage) gespeichert – kein Login,
kein Server. (Daten gelten pro Gerät/Browser.)

## Lokal starten

```bash
npm install
npm run dev
```

Dann http://localhost:5173 öffnen.

## Auf GitHub Pages veröffentlichen

1. Repo auf GitHub anlegen und Code pushen (Branch `main`).
2. **Wichtig:** In `vite.config.ts` muss der Wert `base` zum Repo-Namen passen
   (hier gesetzt auf `/Studi-App/`).
3. In den Repo-Einstellungen: **Settings → Pages → Build and deployment →
   Source: GitHub Actions**.
4. Der enthaltene Workflow `.github/workflows/deploy.yml` baut und veröffentlicht
   bei jedem Push auf `main` automatisch. Die Seite erscheint unter
   `https://flynn-com.github.io/Studi-App/`.

## Tech-Stack

Vite · React · TypeScript · Tailwind CSS v4 · React Router · lucide-react
