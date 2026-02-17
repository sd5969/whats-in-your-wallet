import fs from "fs";
import path from "path";
import PptxGenJS from "pptxgenjs";

const root = path.resolve(process.cwd());
const deckPath = path.join(root, "deck.md");
const outPath = path.join(root, "deck.pptx");

if (!fs.existsSync(deckPath)) {
  throw new Error(`Missing ${deckPath}`);
}

const md = fs.readFileSync(deckPath, "utf8");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex";
pptx.theme = {
  headFontFace: "Georgia",
  bodyFontFace: "Arial",
  lang: "en-US",
};

const COLORS = {
  ink: "0C0C0C",
  muted: "6A717C",
  softText: "434A54",
  bg: "F5F7F8",
  white: "FFFFFF",
  accent: "FD5108",
  accent2: "FE7C39",
  accent3: "FFAA72",
  accentLight: "FFE8D4",
  stroke: "DFE3E6",
  cardFill: "FFFFFF",
  darkPanel: "1F232A",
};

function stripMarkdown(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").trim();
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---([\s\S]*?)---/);
  if (!match) return { title: "", subtitle: "" };
  const fm = match[1];
  const titleMatch = fm.match(/^title:\s*(.+)$/m);
  const subtitleMatch = fm.match(/^subtitle:\s*(.+)$/m);
  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    subtitle: subtitleMatch ? subtitleMatch[1].trim() : "",
  };
}

function parseSlides(markdown) {
  const parts = markdown.split(/^---\s*$/m).map((p) => p.trim()).filter(Boolean);
  const contentParts = parts.slice(1);

  return contentParts.map((part) => {
    const lines = part.split(/\r?\n/);
    const slide = { title: "", bullets: [], images: [], footer: "", notes: [] };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("# ")) {
        slide.title = stripMarkdown(line.replace(/^#\s+/, ""));
        continue;
      }

      if (line.startsWith("- ")) {
        slide.bullets.push(stripMarkdown(line.replace(/^\-\s+/, "")));
        continue;
      }

      if (/^(Footer|Takeaway)\s*:/i.test(line)) {
        slide.footer = stripMarkdown(line.replace(/^(Footer|Takeaway)\s*:/i, ""));
        continue;
      }

      const imgMatch = line.match(/!\[[^\]]*\]\(([^)]+)\)/);
      if (imgMatch) {
        slide.images.push(imgMatch[1]);
        continue;
      }

      slide.notes.push(stripMarkdown(line));
    }

    return slide;
  });
}

function addBaseBackground(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: COLORS.bg },
    line: { color: COLORS.bg },
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.16,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 12.65,
    y: 0.16,
    w: 0.68,
    h: 6.64,
    fill: { color: "EEEFF1" },
    line: { color: "EEEFF1" },
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.9,
    y: 1.38,
    w: 0.08,
    h: 0.5,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });
}

function addTitleBar(slide, title, eyebrow = "") {
  if (eyebrow) {
    slide.addText(eyebrow.toUpperCase(), {
      x: 0.9,
      y: 0.48,
      w: 6,
      h: 0.25,
      fontFace: "Arial",
      fontSize: 10,
      color: COLORS.muted,
      bold: true,
      charSpace: 1.6,
    });
  }

  slide.addText(title, {
    x: 0.9,
    y: 0.72,
    w: 11.8,
    h: 0.65,
    fontFace: "Georgia",
    fontSize: 30,
    bold: true,
    color: COLORS.ink,
  });
}

function addKicker(slide, footer) {
  if (!footer) return;
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.9,
    y: 6.8,
    w: 11.5,
    h: 0.62,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
    radius: 4,
  });
  slide.addText(footer, {
    x: 1.15,
    y: 6.97,
    w: 11.0,
    h: 0.35,
    fontFace: "Arial",
    fontSize: 13,
    bold: true,
    color: COLORS.white,
  });
}

function addTitleSlide(title, subtitle, presenterLines) {
  const slide = pptx.addSlide();
  addBaseBackground(slide);

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.9,
    y: 1.0,
    w: 8.6,
    h: 4.9,
    fill: { color: COLORS.white },
    line: { color: COLORS.stroke },
    radius: 8,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 9.7,
    y: 1.0,
    w: 2.8,
    h: 4.9,
    fill: { color: COLORS.accent2 },
    line: { color: COLORS.accent2 },
    radius: 8,
  });

  slide.addText(title, {
    x: 1.3,
    y: 1.65,
    w: 7.9,
    h: 1.5,
    fontFace: "Georgia",
    fontSize: 42,
    bold: true,
    color: COLORS.ink,
  });

  slide.addText(subtitle, {
    x: 1.3,
    y: 3.3,
    w: 7.7,
    h: 0.8,
    fontFace: "Arial",
    fontSize: 18,
    color: COLORS.softText,
  });

  const byline = presenterLines.length ? presenterLines.join("   ") : "";
  if (byline) {
    slide.addText(byline, {
      x: 1.3,
      y: 4.7,
      w: 7.8,
      h: 0.4,
      fontFace: "Arial",
      fontSize: 13,
      color: COLORS.muted,
    });
  }
}

function addSplitSlide(slide, s) {
  addBaseBackground(slide);
  addTitleBar(slide, s.title, "Context");

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.9,
    y: 1.35,
    w: 6.75,
    h: 5.25,
    fill: { color: COLORS.white },
    line: { color: COLORS.stroke },
    radius: 6,
  });

  slide.addText(
    s.bullets.map((b) => ({ text: b, options: { bullet: { indent: 18 }, hanging: 5 } })),
    {
      x: 1.15,
      y: 1.75,
      w: 6.2,
      h: 4.6,
      fontFace: "Arial",
      fontSize: 16,
      color: COLORS.ink,
      valign: "top",
      paraSpaceAfter: 8,
    }
  );

  slide.addShape(pptx.ShapeType.rect, {
    x: 7.95,
    y: 1.35,
    w: 4.45,
    h: 5.25,
    fill: { color: COLORS.white },
    line: { color: COLORS.stroke },
    radius: 6,
  });

  if (s.images.length) {
    const imgPath = path.join(root, s.images[0]);
    if (fs.existsSync(imgPath)) {
      slide.addImage({
        path: imgPath,
        x: 8.15,
        y: 1.62,
        w: 4.05,
        h: 4.75,
      });
    }
  }

  addKicker(slide, s.footer);
}

function parseMetricBullet(line) {
  const parts = line.split(":");
  if (parts.length < 2) return { label: line, value: "" };
  return {
    label: parts[0].trim(),
    value: parts.slice(1).join(":").trim(),
  };
}

function addMetricsSlide(slide, s) {
  addBaseBackground(slide);
  addTitleBar(slide, s.title, "Proof Points");

  const cards = s.bullets.slice(0, 4).map(parseMetricBullet);
  const cardW = 5.7;
  const cardH = 2.15;
  const startX = 0.95;
  const gapX = 0.65;
  const startY = 1.55;
  const gapY = 0.45;

  cards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      rectRadius: 0.06,
      fill: { color: COLORS.white },
      line: { color: COLORS.stroke },
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: x + 0.18,
      y: y + 0.16,
      w: 0.06,
      h: cardH - 0.32,
      fill: { color: COLORS.accent },
      line: { color: COLORS.accent },
    });

    slide.addText(card.value || card.label, {
      x: x + 0.35,
      y: y + 0.48,
      w: cardW - 0.55,
      h: 0.72,
      fontFace: "Georgia",
      fontSize: 28,
      bold: true,
      color: COLORS.ink,
    });

    slide.addText(card.value ? card.label : "", {
      x: x + 0.35,
      y: y + 1.34,
      w: cardW - 0.55,
      h: 0.5,
      fontFace: "Arial",
      fontSize: 13,
      color: COLORS.muted,
    });
  });

  addKicker(slide, s.footer);
}

function addRiskSlide(slide, s) {
  addBaseBackground(slide);
  addTitleBar(slide, s.title, "Failure Modes");

  const items = s.bullets.slice(0, 4);
  const cols = 2;
  const cardW = 5.72;
  const cardH = 2.2;
  const gapX = 0.55;
  const gapY = 0.35;

  items.forEach((item, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = 0.95 + col * (cardW + gapX);
    const y = 1.55 + row * (cardH + gapY);

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      rectRadius: 0.04,
      fill: { color: COLORS.white },
      line: { color: COLORS.stroke },
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.25,
      y: y + 0.35,
      w: 0.55,
      h: 0.55,
      rectRadius: 0.08,
      fill: { color: COLORS.accentLight },
      line: { color: COLORS.accentLight },
    });

    slide.addText("!", {
      x: x + 0.45,
      y: y + 0.38,
      w: 0.2,
      h: 0.25,
      fontFace: "Arial",
      fontSize: 16,
      bold: true,
      color: COLORS.accent2,
      align: "center",
    });

    slide.addText(item, {
      x: x + 0.95,
      y: y + 0.35,
      w: cardW - 1.2,
      h: 1.55,
      fontFace: "Arial",
      fontSize: 14,
      color: COLORS.ink,
      valign: "top",
    });
  });

  addKicker(slide, s.footer);
}

function addPillarsSlide(slide, s) {
  addBaseBackground(slide);
  addTitleBar(slide, s.title, "Operating Model");

  const pillars = s.bullets.slice(0, 3);
  const cardW = 3.9;
  const gap = 0.35;

  pillars.forEach((p, idx) => {
    const x = 0.95 + idx * (cardW + gap);

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 1.7,
      w: cardW,
      h: 4.4,
      rectRadius: 0.05,
      fill: { color: COLORS.white },
      line: { color: COLORS.stroke },
    });

    slide.addShape(pptx.ShapeType.rect, {
      x,
      y: 1.7,
      w: cardW,
      h: 0.6,
      fill: { color: idx === 0 ? COLORS.accent : idx === 1 ? COLORS.accent2 : COLORS.accent3 },
      line: { color: idx === 0 ? COLORS.accent : idx === 1 ? COLORS.accent2 : COLORS.accent3 },
    });

    slide.addText(`0${idx + 1}`, {
      x: x + 0.2,
      y: 1.83,
      w: 0.55,
      h: 0.25,
      fontFace: "Arial",
      fontSize: 12,
      bold: true,
      color: COLORS.white,
    });

    slide.addText(p, {
      x: x + 0.25,
      y: 2.55,
      w: cardW - 0.5,
      h: 2.8,
      fontFace: "Arial",
      fontSize: 15,
      color: COLORS.ink,
      valign: "mid",
      align: "center",
    });
  });

  const secondary = s.bullets.slice(3);
  if (secondary.length) {
    slide.addText(secondary.join("  |  "), {
      x: 1,
      y: 6.25,
      w: 11.5,
      h: 0.25,
      fontFace: "Arial",
      fontSize: 12,
      color: COLORS.muted,
      align: "center",
    });
  }

  addKicker(slide, s.footer);
}

function addMatrixSlide(slide, s) {
  addBaseBackground(slide);
  addTitleBar(slide, s.title, "Client Implications");

  slide.addShape(pptx.ShapeType.rect, {
    x: 1,
    y: 1.55,
    w: 11.2,
    h: 4.9,
    fill: { color: COLORS.white },
    line: { color: COLORS.stroke },
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 6.6,
    y: 1.55,
    w: 0,
    h: 4.9,
    line: { color: COLORS.stroke, width: 1.2 },
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 1,
    y: 4.0,
    w: 11.2,
    h: 0,
    line: { color: COLORS.stroke, width: 1.2 },
  });

  const cells = [
    { x: 1.25, y: 1.85 },
    { x: 6.85, y: 1.85 },
    { x: 1.25, y: 4.3 },
    { x: 6.85, y: 4.3 },
  ];

  s.bullets.slice(0, 4).forEach((b, idx) => {
    const cell = cells[idx];
    if (!cell) return;
    slide.addText(b, {
      x: cell.x,
      y: cell.y,
      w: 4.95,
      h: 1.9,
      fontFace: "Arial",
      fontSize: 14,
      color: COLORS.ink,
      valign: "top",
    });
  });

  addKicker(slide, s.footer);
}

function addCtaSlide(slide, s) {
  addBaseBackground(slide);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.9,
    y: 1.05,
    w: 11.55,
    h: 5.45,
    rectRadius: 0.07,
    fill: { color: COLORS.darkPanel },
    line: { color: COLORS.darkPanel },
  });

  slide.addText(s.title, {
    x: 1.35,
    y: 1.45,
    w: 10.5,
    h: 0.8,
    fontFace: "Georgia",
    fontSize: 34,
    bold: true,
    color: COLORS.white,
    align: "center",
  });

  const left = s.bullets.slice(0, 2);
  const right = s.bullets.slice(2, 4);

  slide.addText(left.map((b) => ({ text: `• ${b}\n` })), {
    x: 1.55,
    y: 2.45,
    w: 4.85,
    h: 2.6,
    fontFace: "Arial",
    fontSize: 16,
    color: "E8EBEF",
    valign: "top",
  });

  slide.addText(right.map((b) => ({ text: `• ${b}\n` })), {
    x: 6.95,
    y: 2.45,
    w: 4.85,
    h: 2.6,
    fontFace: "Arial",
    fontSize: 16,
    color: "E8EBEF",
    valign: "top",
  });

  if (s.notes.length) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 2.3,
      y: 5.35,
      w: 8.7,
      h: 0.8,
      rectRadius: 0.05,
      fill: { color: COLORS.accent },
      line: { color: COLORS.accent },
    });

    slide.addText(s.notes[0], {
      x: 2.55,
      y: 5.6,
      w: 8.2,
      h: 0.4,
      fontFace: "Arial",
      fontSize: 13,
      bold: true,
      color: COLORS.white,
      align: "center",
    });
  }

  addKicker(slide, s.footer);
}

function addDefaultSlide(slide, s) {
  addBaseBackground(slide);
  addTitleBar(slide, s.title, "Summary");

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.95,
    y: 1.5,
    w: 11.45,
    h: 4.95,
    rectRadius: 0.06,
    fill: { color: COLORS.white },
    line: { color: COLORS.stroke },
  });

  slide.addText(
    s.bullets.map((b) => ({ text: b, options: { bullet: { indent: 20 }, hanging: 6 } })),
    {
      x: 1.35,
      y: 2.0,
      w: 10.6,
      h: 3.9,
      fontFace: "Arial",
      fontSize: 20,
      color: COLORS.ink,
      valign: "top",
      paraSpaceAfter: 10,
    }
  );

  addKicker(slide, s.footer);
}

function inferLayout(s) {
  const t = (s.title || "").toLowerCase();
  if (t.includes("proof")) return "metrics";
  if (t.includes("breaks down") || t.includes("risk")) return "risk";
  if (t.includes("guardrail")) return "pillars";
  if (t.includes("implications")) return "matrix";
  if (t.includes("disclaimer") || t.includes("call to action")) return "cta";
  if (s.images.length) return "split";
  return "default";
}

const { title, subtitle } = parseFrontmatter(md);
const slides = parseSlides(md);

const titleSlideMeta = slides[0] || { notes: [], footer: "" };
const presenterLines = titleSlideMeta.notes.filter((line) => /^(Presenter|Date)\s*:/i.test(line));
addTitleSlide(title || "Vibecoding in Practice", subtitle || "", presenterLines);

for (let i = 1; i < slides.length; i += 1) {
  const s = slides[i];
  const slide = pptx.addSlide();
  const layout = inferLayout(s);

  if (layout === "split") addSplitSlide(slide, s);
  else if (layout === "metrics") addMetricsSlide(slide, s);
  else if (layout === "risk") addRiskSlide(slide, s);
  else if (layout === "pillars") addPillarsSlide(slide, s);
  else if (layout === "matrix") addMatrixSlide(slide, s);
  else if (layout === "cta") addCtaSlide(slide, s);
  else addDefaultSlide(slide, s);
}

pptx.writeFile({ fileName: outPath });
console.log(`Wrote ${outPath}`);
