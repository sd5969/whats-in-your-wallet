import fs from "fs";
import path from "path";
import PptxGenJS from "pptxgenjs";

const root = path.resolve(process.cwd());
const deckPath = path.join(root, "deck.md");
const assetsDir = path.join(root, "assets");
const outPath = path.join(root, "deck.pptx");

if (!fs.existsSync(deckPath)) {
  throw new Error(`Missing ${deckPath}`);
}

const md = fs.readFileSync(deckPath, "utf8");

function parseSlides(markdown) {
  const parts = markdown.split(/^---\s*$/m).map((p) => p.trim()).filter(Boolean);
  // First part is front matter (title/subtitle). Skip it for content slides.
  const contentParts = parts.slice(1);
  return contentParts.map((part) => {
    const lines = part.split(/\r?\n/);
    const slide = { title: "", bullets: [], images: [], footer: "", raw: part };
    for (const line of lines) {
      if (line.startsWith("# ")) {
        slide.title = line.replace(/^#\s+/, "").trim();
        continue;
      }
      if (line.startsWith("- ")) {
        slide.bullets.push(line.replace(/^\-\s+/, "").trim());
        continue;
      }
      if (/^(Footer|Takeaway)\s*:/i.test(line.trim())) {
        slide.footer = line.trim();
        continue;
      }
      const imgMatch = line.match(/!\[[^\]]*\]\(([^)]+)\)/);
      if (imgMatch) {
        slide.images.push(imgMatch[1]);
        continue;
      }
    }
    return slide;
  });
}

const pptx = new PptxGenJS();

pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pptx.author = "Codex";

const theme = {
  headFontFace: "Georgia",
  bodyFontFace: "Arial",
  lang: "en-US",
};

pptx.theme = theme;

const slides = parseSlides(md);

const COLORS = {
  ink: "0C0C0C",
  muted: "595959",
  accent: "70201D",
  accent2: "962D27",
  accent3: "D06965",
  panel: "FFFFFF",
  panelSoft: "F5F5F5",
  stroke: "E5E5E5",
};

function addBackground(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: COLORS.panelSoft },
    line: { color: COLORS.panelSoft },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 9.2,
    y: -0.6,
    w: 4.2,
    h: 4.2,
    fill: { color: COLORS.accent3, transparency: 65 },
    line: { color: COLORS.accent3, transparency: 100 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -1.0,
    y: 5.1,
    w: 4.6,
    h: 4.6,
    fill: { color: COLORS.accent2, transparency: 78 },
    line: { color: COLORS.accent2, transparency: 100 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.28,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });
}

function addTitleSlide(title, subtitle) {
  const slide = pptx.addSlide();
  addBackground(slide);
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.9,
    y: 0.95,
    w: 11.5,
    h: 5.1,
    fill: { color: COLORS.panel },
    line: { color: COLORS.stroke },
    radius: 16,
  });
  slide.addText(title, {
    x: 1.35,
    y: 1.5,
    w: 10.6,
    h: 1.6,
    fontSize: 46,
    bold: true,
    color: COLORS.ink,
    fontFace: "DM Serif Display",
  });
  slide.addText(subtitle, {
    x: 1.35,
    y: 3.2,
    w: 10.2,
    h: 0.9,
    fontSize: 20,
    color: COLORS.muted,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.35,
    y: 4.2,
    w: 3.2,
    h: 0.1,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });
  return slide;
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

const { title, subtitle } = parseFrontmatter(md);
addTitleSlide(title || "Vibecoding Lessons", subtitle || "");

function stripMarkdown(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1");
}

function addContentSlide({ title, bullets, images, footer }) {
  const slide = pptx.addSlide();
  addBackground(slide);

  slide.addText(title || "", {
    x: 0.9,
    y: 0.6,
    w: 11.8,
    h: 0.6,
    fontSize: 30,
    bold: true,
    color: COLORS.ink,
    fontFace: "Georgia",
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.9,
    y: 1.2,
    w: 7.0,
    h: 5.6,
    fill: { color: COLORS.panel },
    line: { color: COLORS.stroke },
    radius: 14,
  });

  if (bullets.length) {
    slide.addText(
      bullets.map((b) => ({
        text: stripMarkdown(b),
        options: { bullet: { indent: 18 }, hanging: 6 },
      })),
      {
        x: 1.2,
        y: 1.6,
        w: 6.2,
        h: 5.0,
        fontSize: 18,
        color: COLORS.ink,
        valign: "top",
        paraSpaceAfter: 6,
        fontFace: "Arial",
      }
    );
  }

  if (images.length) {
    const imgPath = path.join(root, images[0]);
    if (fs.existsSync(imgPath)) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 8.2,
        y: 1.2,
        w: 4.4,
        h: 5.6,
        fill: { color: COLORS.panel },
        line: { color: COLORS.stroke },
        radius: 14,
      });
      slide.addImage({
        path: imgPath,
        x: 8.35,
        y: 1.45,
        w: 4.1,
        h: 5.1,
      });
    }
  }

  if (footer && footer.length > 0) {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 6.8,
      w: 13.333,
      h: 0.7,
      fill: { color: COLORS.accent },
      line: { color: COLORS.accent },
    });
    slide.addText(stripMarkdown(footer.replace(/^(Footer|Takeaway)\s*:\s*/i, "")), {
      x: 0.8,
      y: 6.92,
      w: 11.8,
      h: 0.4,
      fontSize: 14,
      color: "FFFFFF",
      fontFace: "Arial",
      bold: true,
    });
  }

  return slide;
}

for (const slide of slides) {
  addContentSlide(slide);
}

pptx.writeFile({ fileName: outPath });
console.log(`Wrote ${outPath}`);
