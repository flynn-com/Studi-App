// Baut das Investoren-Pitch-Deck "Atelierhaus" (Team 11) mit pptxgenjs.
// Aufruf: NODE_PATH=<node_modules mit pptxgenjs, react, react-dom, react-icons, sharp> node pitch/build_deck.cjs
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Lu = require("react-icons/lu");

const IMG = path.join(__dirname, "img", "deck");
const OUT = path.join(__dirname, "Atelierhaus_Pitch_Team11.pptx");

// Farben aus den computed styles der Website (app/globals.css)
const C = {
  dark: "224B33", // --crafty-petrol-dark (dunkle Flächen)
  green: "2C6041", // --crafty-accent / Logo-Grün / Primär-Button
  light: "9FD1B0", // --crafty-accent-light (Text auf Dunkelgrün)
  tint: "E4EFE8", // --crafty-accent-tint
  bg: "F7F3ED", // body background
  ink: "2B2A28", // body color
  muted: "5F5A52", // dunkler als --crafty-muted, damit Kontrast ≥ 4.5:1
  white: "FFFFFF",
  accent: "E2703A", // Akzent Orange (Fallback-Palette), sparsam
};
const F = "Arial"; // Website nutzt Inter; Arial ist überall vorhanden und QA-zuverlässig

const W = 13.333, H = 7.5, M = 0.6;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Atelierhaus – Investoren-Pitch Team 11";
pres.author = "Team 11 – Startup Summer Camp 2026, Hochschule Pforzheim";

async function icon(Comp, color, px = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: px }));
  const buf = await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

const shadow = () => ({ type: "outer", color: "000000", opacity: 0.18, blur: 10, offset: 3, angle: 90 });

// Screenshot im abgerundeten Rahmen mit leichtem Schatten
function shot(slide, file, x, y, w, aspect, opts = {}) {
  const h = w / aspect;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: opts.radius ?? 0.12, fill: { color: C.white }, line: { color: "E2DDD4", width: 0.75 }, shadow: shadow(),
  });
  slide.addImage({ path: path.join(IMG, file), x, y, w, h, altText: opts.alt || file });
  return h;
}

function text(slide, t, o) {
  slide.addText(t, { fontFace: F, color: C.ink, margin: 0, valign: "top", isTextBox: true, ...o });
}

function title(slide, t, o = {}) {
  text(slide, t, { x: M, y: 0.5, w: W - 2 * M, h: 1.0, fontSize: 32, bold: true, valign: "top", ...o });
}

function footer(slide, who, nr, dur, range, dark = false) {
  text(slide, `${who} · Folie ${nr}/10 · ${dur} (${range})`, {
    x: M, y: 6.82, w: 7, h: 0.22, fontSize: 11, color: dark ? C.light : C.muted, valign: "middle",
  });
  text(slide, "Atelierhaus · Team 11", {
    x: W - M - 4, y: 6.82, w: 4, h: 0.22, fontSize: 11, color: dark ? C.light : C.muted, align: "right", valign: "middle",
  });
}

function stat(slide, x, y, w, num, label, o = {}) {
  text(slide, num, { x, y, w, h: o.nh || 0.85, fontSize: o.size || 54, bold: true, color: o.color || C.green, valign: "bottom" });
  text(slide, label, { x, y: y + (o.nh || 0.85) + 0.05, w, h: o.lh || 0.6, fontSize: o.lsize || 16, color: o.lcolor || C.ink });
}

function card(slide, x, y, w, h, fill = C.white) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.15, fill: { color: fill }, line: { color: "E2DDD4", width: 0.75 }, shadow: shadow() });
}

async function iconCircle(slide, Comp, x, y, d, bg = C.tint, fg = C.green) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { type: "none" } });
  const p = d * 0.25;
  slide.addImage({ data: await icon(Comp, fg), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}

(async () => {
  // ───────────── 1 · Titel ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };
    s.addImage({ path: path.join(IMG, "wordmark_white.png"), x: M, y: 0.75, w: 3.6, h: 3.6 * 90 / 843, altText: "Atelierhaus Wortmarke" });
    text(s, "Ein Haus voller Ideen.", { x: M, y: 1.35, w: 5.6, h: 1.8, fontSize: 48, bold: true, color: C.white });
    text(s, "Kreativkurse, Kochen, Bewegung und Markenerlebnisse unter einem Dach – in einer Halle in München.", {
      x: M, y: 3.2, w: 5.4, h: 1.1, fontSize: 20, color: "E6EFE9",
    });
    const sx = [M, M + 2.25, M + 3.65];
    stat(s, sx[0], 4.55, 1.9, "1.500", "m² Halle", { color: C.light, lcolor: C.white, size: 48, nh: 0.75 });
    stat(s, sx[1], 4.55, 1.6, "5", "Räume", { color: C.light, lcolor: C.white, size: 48, nh: 0.75 });
    stat(s, sx[2], 4.55, 2.0, "11", "Kursarten", { color: C.light, lcolor: C.white, size: 48, nh: 0.75 });
    text(s, "3 Kreativstudios · Showküche · Bewegungsstudio", { x: M, y: 5.85, w: 5.6, h: 0.35, fontSize: 16, color: "E6EFE9" });
    shot(s, "hero.png", 6.55, 1.95, 6.18, 1800 / 978, { alt: "Screenshot Startseite: Ein Haus voller Ideen." });
    text(s, "Prototyp: Startseite", { x: 6.55, y: 5.45, w: 6.18, h: 0.3, fontSize: 14, color: C.light, align: "right" });
    footer(s, "[Name A]", 1, "0:15", "0:00–0:15", true);
    s.addNotes(
      "Wir sind Team 11 – und das ist Atelierhaus: ein Haus voller Ideen. Kreativkurse, Kochen, Bewegung und Markenerlebnisse unter einem Dach – 1.500 Quadratmeter in München, fünf Räume, elf Kursarten."
    );
  }

  // ───────────── 2 · Problem ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    title(s, "Kreative Freizeit ist zersplittert – also machen Erwachsene immer das Gleiche oder bleiben zuhause.", { h: 1.2 });
    stat(s, M, 2.0, 4.6, "9 von 13", "nennen fehlendes oder verstreutes Angebot als Problem", { size: 66, nh: 1.0, lh: 0.65 });
    stat(s, M, 3.85, 4.6, "4 von 13", "sagen: keine Zeit, anstrengender Alltag", { size: 48, nh: 0.8, lh: 0.4 });
    text(s, "Basis: 13 dokumentierte Interviews", { x: M, y: 5.25, w: 4.6, h: 0.3, fontSize: 14, color: C.muted });

    // Zitat-Karte
    card(s, 5.75, 2.05, 6.98, 2.35, C.dark);
    text(s, "“", { x: 6.05, y: 2.1, w: 0.8, h: 0.6, fontSize: 60, bold: true, color: C.light });
    text(s, "Im Winter gibt es keine Aktivitäten.", { x: 6.1, y: 2.7, w: 6.3, h: 1.0, fontSize: 32, bold: true, color: C.white });
    text(s, "– Auszubildende, Interview", { x: 6.1, y: 3.82, w: 6.3, h: 0.35, fontSize: 16, color: C.light });

    // Workarounds als Chips
    text(s, "Workarounds heute", { x: 5.75, y: 4.65, w: 6.9, h: 0.35, fontSize: 16, bold: true, color: C.green });
    const chips = [
      ["Bowling, Clubs, Shoppen", 2.9],
      ["Allein: Diamond Painting, iPad", 3.5],
      ["Studios, VHS, Vereine einzeln suchen & buchen", 5.1],
    ];
    let cx = 5.75, cy = 5.05;
    chips.forEach(([t, w]) => {
      if (cx + w > W - M + 0.01) { cx = 5.75; cy += 0.62; }
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w, h: 0.48, rectRadius: 0.24, fill: { color: C.white }, line: { color: "D5CFC4", width: 0.75 } });
      text(s, t, { x: cx, y: cy, w, h: 0.48, fontSize: 16, align: "center", valign: "middle" });
      cx += w + 0.15;
    });
    footer(s, "[Name A]", 2, "0:30", "0:15–0:45");
    s.addNotes(
      "Kennt ihr das? Feierabend, man will etwas Kreatives machen – aber das Angebot ist zersplittert: Töpferstudio hier, VHS dort, Verein woanders. Neun von dreizehn Befragten nennen genau das als Problem, vier sagen: keine Zeit. Also geht man wieder bowlen oder shoppen – oder bleibt allein zuhause mit Diamond Painting. Eine Auszubildende hat es auf den Punkt gebracht: Im Winter gibt es keine Aktivitäten."
    );
  }

  // ───────────── 3 · Kunde & Evidenz ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    title(s, "12 von 13 Befragten haben das Problem – und würden 20–50 € pro Kurs zahlen.", { h: 1.1 });
    const st = [
      ["18", "Interviews (13 dokumentiert + 5 am Mittwoch)"],
      ["12/13", "bestätigen das Problem (1 teilweise)"],
      ["3,7/5", "Ø Leidensdruck"],
      ["20–50 €", "pro Kurs typisch (Spanne 10–150 €)"],
    ];
    const cw = (W - 2 * M - 3 * 0.3) / 4;
    st.forEach(([n, l], i) => stat(s, M + i * (cw + 0.3), 1.8, cw, n, l, { size: 48, nh: 0.8, lh: 0.6 }));

    // Personas
    const py = 3.5, ph = 3.05, pw = (W - 2 * M - 0.3) / 2;
    const personas = [
      [Lu.LuPalette, "Feierabend-Kreative", "20–35 J. · Studierende, Azubis, Berufstätige · wenig Zeit, oft niemand fürs gemeinsame Hobby",
        "„Mir wäre es unangenehm, allein zu einem Kurs zu gehen.“", "→ Gruppen- & Freundesformate"],
      [Lu.LuUsers, "Teamevent-Entscheider:innen", "HR, Kita-Leitungen, Teams · suchen Erlebnisse, die man unkompliziert bucht",
        "„Ich würde es direkt für ein Teamevent buchen.“", "– Kita-Leitung, 44"],
    ];
    for (let i = 0; i < 2; i++) {
      const [ic, h, d, q, a] = personas[i];
      const x = M + i * (pw + 0.3);
      card(s, x, py, pw, ph);
      await iconCircle(s, ic, x + 0.3, py + 0.3, 0.7);
      text(s, h, { x: x + 1.2, y: py + 0.3, w: pw - 1.5, h: 0.4, fontSize: 22, bold: true, color: C.green });
      text(s, d, { x: x + 1.2, y: py + 0.75, w: pw - 1.5, h: 0.85, fontSize: 16 });
      text(s, q, { x: x + 0.3, y: py + 1.75, w: pw - 0.6, h: 0.85, fontSize: 20, bold: true, italic: true });
      text(s, a, { x: x + 0.3, y: py + 2.55, w: pw - 0.6, h: 0.35, fontSize: 16, color: C.muted });
    }
    footer(s, "[Name A]", 3, "0:35", "0:45–1:20");
    s.addNotes(
      "Wir haben 18 Interviews geführt, 13 davon ausführlich dokumentiert. Zwölf von dreizehn bestätigen das Problem, der Leidensdruck liegt im Schnitt bei 3,7 von 5. Zwei Kundengruppen: die Feierabend-Kreativen zwischen 20 und 35 – oft ohne jemanden fürs gemeinsame Hobby. Und Teamevent-Entscheider wie HR oder Kita-Leitungen. Überrascht hat uns: Allein hinzugehen ist eine Hürde – deshalb setzen wir auf Gruppenformate. Und: Ohne Abwechslung käme man nur einmal. Zahlen würden die meisten 20 bis 50 Euro pro Kurs.\n\n" +
      "[Hinweis, nicht vorlesen: Interviews fanden in Pforzheim statt (u. a. Fußgängerzone), Standort ist München. Interesse auch bei Jüngeren und Älteren, nicht nur 30–50. Weiteres Zitat: „Sehr cool – wie ein Jugendtraum.“]"
    );
  }

  // ───────────── 4 · Lösung & Prototyp ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    title(s, "Alles unter einem Dach – online in 4 Schritten gebucht.", { h: 0.6 });
    const steps = ["Anmelden", "Kurs wählen", "Termin buchen", "Hingehen"];
    const sw = 2.7, sg = 0.42;
    steps.forEach((t, i) => {
      const x = M + i * (sw + sg);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.35, w: sw, h: 0.6, rectRadius: 0.3, fill: { color: i === 3 ? C.green : C.tint }, line: { type: "none" } });
      text(s, `${i + 1}  ${t}`, { x, y: 1.35, w: sw, h: 0.6, fontSize: 18, bold: true, align: "center", valign: "middle", color: i === 3 ? C.white : C.green });
      if (i < 3) text(s, "→", { x: x + sw, y: 1.35, w: sg, h: 0.6, fontSize: 20, bold: true, align: "center", valign: "middle", color: C.green });
    });

    // Links: Testergebnis
    stat(s, M, 2.3, 3.9, "3 von 3", "Testpersonen würden Atelierhaus nutzen", { size: 54, nh: 0.85, lh: 0.65 });
    text(s, "Personaler, 39: Kurs gesucht und fürs Team gebucht – ohne Hilfe. „Schneller Buchungsprozess, selbsterklärend.“", {
      x: M, y: 4.0, w: 3.9, h: 1.05, fontSize: 16,
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.05, w: 3.9, h: 1.05, rectRadius: 0.12, fill: { color: C.tint }, line: { type: "none" } });
    text(s, [
      { text: "Learning: ", options: { bold: true, color: C.green } },
      { text: "Credit-System verwirrte → ersetzt durch direkte Bezahlung." },
    ], { x: M + 0.2, y: 5.05, w: 3.5, h: 1.05, fontSize: 16, valign: "middle" });

    // Rechts: 2 Screenshots, gleiche Höhe
    const sh = 2.3, x1 = 4.85, w1 = sh * 1800 / 1350, w2 = sh * 1800 / 1025, x2 = W - M - w2;
    shot(s, "buchen.png", x1, 2.35, w1, 1800 / 1350, { alt: "Screenshot Buchung: Termin wählen" });
    shot(s, "business.png", x2, 2.35, w2, 1800 / 1025, { alt: "Screenshot Für Firmen" });
    text(s, "Kursbuchung (RIMOWA-Format)", { x: x1, y: 2.35 + sh + 0.12, w: w1 + 0.5, h: 0.3, fontSize: 14, color: C.muted });
    text(s, "Für Firmen: 4–30 Personen", { x: x2, y: 2.35 + sh + 0.12, w: w2, h: 0.3, fontSize: 14, color: C.muted });
    text(s, "Prototyp: 11 Kursarten · 18 Kurse · Firmenbuchung · Partner-Bereich für spätere Franchise-Betreiber", {
      x: x1, y: 5.2, w: W - M - x1, h: 0.65, fontSize: 18, bold: true, color: C.green,
    });
    text(s, "Marken auf der Website = geplante Markenformate, noch keine unterschriebenen Kooperationen.", {
      x: x1, y: 5.95, w: W - M - x1, h: 0.35, fontSize: 16, color: C.muted, italic: true,
    });
    footer(s, "[Name B]", 4, "0:35", "1:20–1:55");
    s.addNotes(
      "Unsere Lösung: alles unter einem Dach – online in vier Schritten gebucht: anmelden, Kurs wählen, Termin buchen, hingehen. Unser klickbarer Prototyp hat 18 Kurse in 11 Kursarten, Firmenbuchungen für 4 bis 30 Personen und einen Partner-Bereich für spätere Franchise-Betreiber. In drei Nutzertests würden alle drei es nutzen. Ein Personaler hat ohne Hilfe fürs Team gebucht – sein Feedback: schnell und selbsterklärend. Und wir haben gelernt: Unser Credit-System hat verwirrt, deshalb zahlt man jetzt direkt.\n\n" +
      "[Hinweis, nicht vorlesen: Die Marken auf der Website (Mercedes-Benz, RIMOWA, lululemon, Faber-Castell, Hilti, dm, rhode, Haus Labs) sind geplante Markenformate/Wunschpartner, keine unterschriebenen Kooperationen. Wunsch aus Test 1: Info, was mitgebracht werden soll.]"
    );
  }

  // ───────────── 5 · Markt ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    title(s, "Allein München trägt den Start: 1,79 Mio € Umsatz realistisch erreichbar.", { h: 1.1 });
    // Konzentrische Kreise, unten bündig
    const base = 6.45, cx = 3.55;
    const circ = [
      [4.7, C.tint, "TAM", C.green],
      [3.35, "B9D9C3", "SAM", C.dark],
      [1.85, C.green, "SOM", C.white],
    ];
    circ.forEach(([d, fill, lab, lc]) => {
      s.addShape(pres.shapes.OVAL, { x: cx - d / 2, y: base - d, w: d, h: d, fill: { color: fill }, line: { color: C.white, width: 1.5 } });
    });
    text(s, "TAM", { x: cx - 1, y: base - 4.7 + 0.35, w: 2, h: 0.5, fontSize: 24, bold: true, color: C.green, align: "center" });
    text(s, "SAM", { x: cx - 1, y: base - 3.35 + 0.3, w: 2, h: 0.5, fontSize: 24, bold: true, color: C.dark, align: "center" });
    text(s, "SOM", { x: cx - 1, y: base - 1.85 + 0.62, w: 2, h: 0.55, fontSize: 24, bold: true, color: C.white, align: "center" });

    const rx = 6.6, rw = W - M - rx;
    const rows = [
      ["25,5 Mio €", "TAM", "1.060.614 Erwachsene (20–64) in München × 30 % kreativ aktiv × 80 € pro Jahr"],
      ["15,3 Mio €", "SAM", "× 60 % offen für das Angebot = 190.911 Personen"],
      ["1,79 Mio €", "SOM", "21.000 Kund:innen (11 %) · 28.966 Teilnahmen → 1,41 Mio € Kurse + 0,38 Mio € Firmenevents (netto)"],
    ];
    rows.forEach(([n, lab, d], i) => {
      const y = 1.5 + i * 1.47;
      text(s, n, { x: rx, y, w: rw, h: 0.8, fontSize: 44, bold: true, color: i === 2 ? C.green : C.ink, valign: "bottom" });
      text(s, d, { x: rx, y: y + 0.82, w: rw, h: 0.65, fontSize: 16, color: C.ink });
    });
    text(s, "Quellen: Landeshauptstadt München, Münchner Statistik, 1. Quartalsheft 2026 (Einwohner, Altersanteil – amtlich); Eurostat, Culture statistics (34,5 % künstlerisch aktiv, EU 2015). Anteile 30 % / 60 % / 11 % und 80 € p. a. sind Annahmen.", {
      x: rx, y: 6.12, w: rw, h: 0.55, fontSize: 10, color: C.muted,
    });
    footer(s, "[Name C]", 5, "0:30", "1:55–2:25");
    s.addNotes(
      "Wie groß ist der Markt? München hat gut eine Million Erwachsene zwischen 20 und 64. Wir nehmen an, dass 30 Prozent kreativ aktiv sind und 80 Euro im Jahr dafür ausgeben – das sind 25,5 Millionen Euro. 60 Prozent davon sind offen für ein Angebot wie unseres: 15,3 Millionen. Realistisch erreichen wir 21.000 Kundinnen und Kunden – mit Firmenevents 1,79 Millionen Euro netto.\n\n" +
      "[Hinweis, nicht vorlesen: Amtlich belegt sind nur Einwohnerzahl und Altersanteil. 30 % ist konservativ gegenüber Eurostat 34,5 %. 60 % offen = Annahme aus Interviews.]"
    );
  }

  // ───────────── 6 · Geschäftsmodell & Zahlen ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    title(s, "Ab 5,3 Personen pro Kurs verdienen wir Geld – Amortisation in Jahr 3.", { h: 1.1 });

    // Chart links
    card(s, M, 1.75, 7.3, 3.9);
    s.addChart(pres.charts.BAR, [
      { name: "Umsatz", labels: ["Jahr 1", "Jahr 2", "Jahr 3", "Jahr 4", "Jahr 5"], values: [1.672378, 2.563846, 3.422319, 3.884848, 3.981969] },
      { name: "EBIT", labels: ["Jahr 1", "Jahr 2", "Jahr 3", "Jahr 4", "Jahr 5"], values: [-0.147396, 0.434708, 0.988306, 1.315897, 1.350579] },
    ], {
      x: M + 0.15, y: 1.85, w: 7.0, h: 3.7, barDir: "col", barGapWidthPct: 60,
      chartColors: [C.green, C.accent],
      showTitle: true, title: "Umsatz & EBIT in Mio €, Szenario realistisch", titleFontFace: F, titleFontSize: 16, titleColor: C.ink,
      showLegend: true, legendPos: "t", legendFontFace: F, legendFontSize: 14, legendColor: C.ink,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 12, dataLabelFontFace: F, dataLabelColor: C.ink,
      catAxisLabelColor: C.ink, catAxisLabelFontSize: 14, catAxisLabelFontFace: F, catAxisLineShow: false,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      valAxisMinVal: -0.5, valAxisMaxVal: 4.5,
    });
    text(s, "Kum. Cashflow positiv ab Jahr 3 (+326 T€) · Kapitalbedarf Start 1,17 Mio €", {
      x: M, y: 5.8, w: 7.3, h: 0.3, fontSize: 14, color: C.muted,
    });

    // KPIs rechts
    const kx = 8.3, kw = W - M - kx;
    stat(s, kx, 1.7, kw, "5,3 Pers.", "Break-even pro Kurs = 26,6 % Auslastung · Plan: 11 (55 %)", { size: 48, nh: 0.8, lh: 0.6 });
    stat(s, kx, 3.3, kw / 2 - 0.1, "39,22 €", "Deckungsbeitrag pro Person (Kreativkurs)", { size: 30, nh: 0.55, lh: 0.75, color: C.ink });
    stat(s, kx + kw / 2 + 0.1, 3.3, kw / 2 - 0.1, "80.308 €", "Fixkosten pro Monat inkl. AfA", { size: 30, nh: 0.55, lh: 0.75, color: C.ink });

    text(s, "Erlösquellen", { x: kx, y: 4.75, w: kw, h: 0.3, fontSize: 16, bold: true, color: C.green });
    text(s, [
      { text: "Kurs-Tickets 25–129 € (Ø 61,88 €)", options: { bullet: true, breakLine: true } },
      { text: "Firmen-Teamevents 8.000 € netto", options: { bullet: true, breakLine: true } },
      { text: "Marken- & Leuchtturm-Events (499 €)", options: { bullet: true, breakLine: true } },
      { text: "Bundles, Abos, Gastro 3.000 €/Mon.", options: { bullet: true } },
    ], { x: kx, y: 5.1, w: kw, h: 1.4, fontSize: 16, paraSpaceAfter: 3 });
    footer(s, "[Name C]", 6, "0:40", "2:25–3:05");
    s.addNotes(
      "Wir verdienen an Kurstickets – ein Kreativkurs kostet im Schnitt rund 62 Euro –, an Firmen-Teamevents für 8.000 Euro, an Markenformaten, Leuchtturm-Events und an der Untervermietung an die Gastro. Jede Person im Kreativkurs bringt 39 Euro Deckungsbeitrag. Bei rund 80.000 Euro Fixkosten im Monat brauchen wir 5,3 Personen pro Kurs, also 27 Prozent Auslastung – geplant sind 11. Im ersten Jahr machen wir 1,7 Millionen Umsatz und noch leicht Verlust, ab Jahr zwei sind wir profitabel, und in Jahr drei hat sich die Investition amortisiert.\n\n" +
      "[Hinweis, nicht vorlesen: Fixkosten 963.695 € p. a.; größter Block Gründergehälter 5 × 5.000 €. Ziel Auslastung ≤ 12 Personen / 60 %. Markenbeiträge im Plan bewusst mit 0 € angesetzt.]"
    );
  }

  // ───────────── 7 · Wettbewerb (Petal Diagram) ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    title(s, "Andere lösen ein Stück – wir bündeln alles an einem Ort.", { h: 0.6 });
    const cx = 4.75, cy = 4.15, pw = 3.3, ph = 1.42;
    const petals = [
      [0, -1.72, "Kreativstudios", "Paint your Style, froh+bunter, Töpfer"],
      [2.45, -0.86, "Kurs-Marktplätze", "gokonfetti"],
      [2.45, 0.86, "Teamevent-Agenturen", "z. B. hirschfeld.de"],
      [0, 1.72, "Kochschulen, VHS, Vereine", "alles einzeln buchen"],
      [-2.45, 0.86, "Zuhause", "DIY-Kits, Diamond Painting"],
      [-2.45, -0.86, "Immer das Gleiche", "Bowling, Clubs, Shoppen"],
    ];
    petals.forEach(([dx, dy]) => {
      s.addShape(pres.shapes.OVAL, { x: cx + dx - pw / 2, y: cy + dy - ph / 2, w: pw, h: ph, fill: { color: C.tint }, line: { color: "B9D9C3", width: 1 } });
    });
    s.addShape(pres.shapes.OVAL, { x: cx - 1.05, y: cy - 1.05, w: 2.1, h: 2.1, fill: { color: C.green }, line: { color: C.white, width: 3 }, shadow: shadow() });
    text(s, "Atelierhaus", { x: cx - 1.05, y: cy - 0.3, w: 2.1, h: 0.6, fontSize: 20, bold: true, color: C.white, align: "center", valign: "middle" });
    petals.forEach(([dx, dy, h, d]) => {
      text(s, [
        { text: h, options: { bold: true, color: C.green, breakLine: true } },
        { text: d, options: { color: C.ink } },
      ], { x: cx + dx - pw / 2 + 0.3, y: cy + dy - ph / 2 + 0.12, w: pw - 0.6, h: ph - 0.24, fontSize: 16, align: "center", valign: "middle" });
    });

    const rx = 9.05, rw = W - M - rx;
    card(s, rx, 1.6, rw, 4.95, C.white);
    text(s, [
      { text: "Für Erwachsene, die nach Feierabend kreativ abschalten wollen, ist Atelierhaus eine Kreativ-Location, die ", options: {} },
      { text: "11 Kursarten, Kochen und Bewegung unter einem Dach", options: { bold: true, color: C.green } },
      { text: " bündelt.", options: { breakLine: true } },
      { text: " ", options: { fontSize: 8, breakLine: true } },
      { text: "Anders als Einzelstudios, VHS oder Agenturen bieten wir ", options: {} },
      { text: "wechselndes Programm, Markenformate und Firmenevents", options: { bold: true, color: C.green } },
      { text: " – an einem Ort, direkt buchbar.", options: {} },
    ], { x: rx + 0.3, y: 1.85, w: rw - 0.6, h: 4.45, fontSize: 18, valign: "middle" });
    footer(s, "[Name B]", 7, "0:25", "3:05–3:30");
    s.addNotes(
      "Und die Konkurrenz? Es gibt Studios wie Paint your Style, Marktplätze wie gokonfetti, Teamevent-Agenturen, Kochschulen und die VHS – und natürlich: zuhause bleiben oder immer das Gleiche machen. Jeder löst ein Stück. Wir bündeln alles an einem Ort: wechselndes Programm, Markenformate und Firmenevents – direkt buchbar.\n\n" +
      "[Hinweis, nicht vorlesen: Paint your Style ist ein Franchise mit über 20 Standorten (mehrere in München) – Beleg, dass Franchise in der Kreativnische funktioniert. gokonfetti: über 10.000 Kurse und Teamevents in DE/AT. hirschfeld.de ist ein Portal für Teamevents/Agenturen.]"
    );
  }

  // ───────────── 8 · Impact ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    title(s, "Rund 552.000 € pro Jahr fließen an Künstler:innen und Kursleitungen der Region.", { h: 1.1 });
    const cw = (W - 2 * M - 2 * 0.35) / 3, cy = 1.95, ch = 4.4;
    const cards = [
      [Lu.LuSmile, "Kund:innen", "47", "Community-Events p. a.", "Kreativer Ausgleich statt Routine – neue Leute kennenlernen über Gruppenformate, Lesungen, Ausstellungen, Networking."],
      [Lu.LuMapPin, "Region", "552.000 €", "Honorare p. a.", "für Künstler:innen und Kursleitungen · 5 Gründerstellen · ca. 170 Std./Woche Aushilfen"],
      [Lu.LuRecycle, "Umwelt", "Upcycling", "statt Neukauf", "Denim, Vintage, Sneaker, Stickerei – Kurse, die Vorhandenes weiterverwenden."],
    ];
    for (let i = 0; i < 3; i++) {
      const [ic, h, n, l, d] = cards[i];
      const x = M + i * (cw + 0.35);
      card(s, x, cy, cw, ch);
      await iconCircle(s, ic, x + 0.35, cy + 0.35, 0.75);
      text(s, h, { x: x + 1.25, y: cy + 0.35, w: cw - 1.5, h: 0.75, fontSize: 22, bold: true, color: C.green, valign: "middle" });
      text(s, n, { x: x + 0.35, y: cy + 1.3, w: cw - 0.7, h: 0.85, fontSize: i === 2 ? 40 : 48, bold: true, color: C.ink, valign: "bottom" });
      text(s, l, { x: x + 0.35, y: cy + 2.2, w: cw - 0.7, h: 0.35, fontSize: 18, bold: true, color: C.green });
      text(s, d, { x: x + 0.35, y: cy + 2.7, w: cw - 0.7, h: 1.5, fontSize: 16 });
    }
    footer(s, "[Name D]", 8, "0:15", "3:30–3:45");
    s.addNotes(
      "Atelierhaus wirkt über den Kurs hinaus: Rund 552.000 Euro Honorare im Jahr gehen an Künstlerinnen und Kursleitungen aus der Region, dazu 47 Community-Events – und Upcycling statt Neukauf."
    );
  }

  // ───────────── 9 · Team ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    title(s, "In 4 Tagen vom Problem zum klickbaren Prototyp.", { h: 0.6 });
    const team = [
      ["A", "[Name A]", "Finanzen & Businessplan"],
      ["B", "[Name B]", "Marke & Plattform"],
      ["C", "[Name C]", "Programm & Partner"],
      ["D", "[Name D]", "Standort & Operations"],
    ];
    const cw = (W - 2 * M - 3 * 0.3) / 4, cy = 1.45, ch = 2.85;
    team.forEach(([ini, n, r], i) => {
      const x = M + i * (cw + 0.3);
      card(s, x, cy, cw, ch);
      s.addShape(pres.shapes.OVAL, { x: x + cw / 2 - 0.62, y: cy + 0.3, w: 1.24, h: 1.24, fill: { color: C.tint }, line: { color: C.green, width: 1.5, dashType: "dash" } });
      text(s, ini, { x: x + cw / 2 - 0.62, y: cy + 0.3, w: 1.24, h: 1.24, fontSize: 36, bold: true, color: C.green, align: "center", valign: "middle" });
      text(s, n, { x: x + 0.2, y: cy + 1.7, w: cw - 0.4, h: 0.45, fontSize: 22, bold: true, align: "center" });
      text(s, r, { x: x + 0.2, y: cy + 2.15, w: cw - 0.4, h: 0.45, fontSize: 16, color: C.green, align: "center" });
    });
    const st = [["18", "Interviews"], ["3", "Nutzertests"], ["1", "klickbarer Prototyp"], ["5 Jahre", "Finanzplan"]];
    st.forEach(([n, l], i) => stat(s, M + i * (cw + 0.3), 4.6, cw, n, l, { size: 48, nh: 0.8, lh: 0.4 }));
    text(s, "Geplant: 5 Gründer:innen im Management", { x: M, y: 6.25, w: 8, h: 0.35, fontSize: 16, color: C.muted });
    footer(s, "[Name D]", 9, "0:15", "3:45–4:00");
    s.addNotes(
      "Das sind wir: [Name A], Finanzen, [Name B], Marke, [Name C], Programm, und [Name D], Operations. In vier Tagen: 18 Interviews, 3 Nutzertests, ein Prototyp und ein Fünf-Jahres-Finanzplan."
    );
  }

  // ───────────── 10 · Nächste Schritte & Ask ─────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };
    title(s, "Unser Ask: 1,17 Mio € und Türöffner in München.", { color: C.white, h: 0.6 });
    const tests = [
      ["Zahlen Münchner:innen 50–80 €?", "Landingpage mit Preisen + Vorbestellung", "50 Vorbestellungen in 4 Wochen"],
      ["Buchen Firmen Teamevents zu 8.000 €?", "10 HR-Gespräche", "3 Absichtserklärungen"],
      ["Beteiligen sich Marken?", "5 Markengespräche (Material, Hosts, Beitrag)", "1 LOI"],
    ];
    text(s, "Nächste Schritte: unsere 3 riskantesten Annahmen testen", { x: M, y: 1.6, w: 7.2, h: 0.35, fontSize: 16, bold: true, color: C.light });
    tests.forEach(([a, t, ja], i) => {
      const y = 2.1 + i * 1.25;
      s.addShape(pres.shapes.OVAL, { x: M, y: y + 0.05, w: 0.6, h: 0.6, fill: { color: C.light }, line: { type: "none" } });
      text(s, String(i + 1), { x: M, y: y + 0.05, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.dark, align: "center", valign: "middle" });
      text(s, a, { x: M + 0.85, y, w: 6.4, h: 0.4, fontSize: 20, bold: true, color: C.white });
      text(s, [
        { text: "Test: ", options: { color: C.light } }, { text: t, options: { color: "E6EFE9", breakLine: true } },
        { text: "Ja = ", options: { color: C.light, bold: true } }, { text: ja, options: { color: C.white, bold: true } },
      ], { x: M + 0.85, y: y + 0.45, w: 6.4, h: 0.7, fontSize: 16 });
    });

    const ax = 8.35, aw = W - M - ax;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax, y: 1.6, w: aw, h: 4.0, rectRadius: 0.15, fill: { color: C.green }, line: { type: "none" }, shadow: shadow() });
    text(s, "1,17 Mio €", { x: ax + 0.3, y: 1.8, w: aw - 0.6, h: 0.95, fontSize: 54, bold: true, color: C.white, valign: "bottom" });
    text(s, "Startkapital", { x: ax + 0.3, y: 2.8, w: aw - 0.6, h: 0.35, fontSize: 18, bold: true, color: C.light });
    text(s, [
      { text: "Umbau & Einrichtung 732.500 €", options: { bullet: true, breakLine: true } },
      { text: "Liquiditätsreserve 364.855 €", options: { bullet: true, breakLine: true } },
      { text: "Anlaufkosten & Kaution 72.500 €", options: { bullet: true } },
    ], { x: ax + 0.3, y: 3.25, w: aw - 0.6, h: 1.1, fontSize: 16, color: C.white, paraSpaceAfter: 3 });
    text(s, "+ Kontakte zu Marken und Gewerbeimmobilien in München", { x: ax + 0.3, y: 4.5, w: aw - 0.6, h: 0.85, fontSize: 18, bold: true, color: C.white });

    text(s, "Dein nächster freier Abend gehört dem Atelierhaus.", { x: M, y: 5.9, w: W - 2 * M, h: 0.7, fontSize: 30, bold: true, italic: true, color: C.light, valign: "middle" });
    footer(s, "[Name D]", 10, "0:30", "4:00–4:30", true);
    s.addNotes(
      "Als Nächstes testen wir unsere drei riskantesten Annahmen in München. Zahlen Leute 50 bis 80 Euro? Ja heißt: 50 Vorbestellungen in vier Wochen. Buchen Firmen Teamevents für 8.000 Euro? Ja heißt: drei Absichtserklärungen. Und machen Marken mit? Ja heißt: ein Letter of Intent. Dafür suchen wir 1,17 Millionen Euro Startkapital – und Kontakte zu Marken und Gewerbeimmobilien in München. Denn: Dein nächster freier Abend gehört dem Atelierhaus.\n\n" +
      "[Hinweis, nicht vorlesen: Optional als Auslastungstest – Pop-up-Wochenende in München mit 3 Formaten.]"
    );
  }

  await pres.writeFile({ fileName: OUT });
  console.log("geschrieben:", OUT);
})();
