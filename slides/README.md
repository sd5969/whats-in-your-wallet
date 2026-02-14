# Slides Source

This folder keeps the deck content in Markdown so we can collaborate and edit quickly.

## Source of truth
- `slides/deck.md`

## Images
Drop screenshots and diagrams into `slides/assets/` and keep the same filenames used in the Markdown:
- `demo-screenshot.png`
- `timeline.png`
- `stack.png`
- `guardrails.png`

## Build PowerPoint
1. Install deps (one-time):
   - `cd slides`
   - `npm install`
2. Build deck:
   - `npm run build`

Output: `slides/deck.pptx`

If you rename images or add new ones, update `slides/deck.md` accordingly.
