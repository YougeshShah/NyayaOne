
## Update — Nepali OCR (Important, Free)

Nepal government PDFs often use custom Devanagari fonts that break normal
text extraction (garbled/spaced-out output like "स ं व ै ध ानिक"). The
script now uses OCR (reading the page as an image, like a human would)
instead — this needs two extra free system packages:

```bash
sudo apt-get update
sudo apt-get install -y poppler-utils tesseract-ocr tesseract-ocr-nep
```

- `poppler-utils` — converts each PDF page to a high-resolution image
- `tesseract-ocr` + `tesseract-ocr-nep` — reads Nepali text from that image

Both are free, open-source, and install directly via apt — no account,
no API key, no cost. OCR is slower than text extraction (a few seconds
per page instead of instant), so a large batch import will take longer
than before — this is expected and worth the wait for correct text.

## Cleanup for content already imported with the old (garbled) extraction

If you already ran the import before this OCR update, your existing
LibraryResource rows have the garbled text. Two options:

1. **Re-run the import script** — it updates existing rows by matching
   title, so this replaces the garbled content with clean OCR text.
2. **Just remove the watermark noise** without re-running OCR (faster, but
   leaves the Devanagari spacing garbled):
   ```bash
   npx ts-node prisma/clean-library-watermark.ts
   ```

Option 1 (re-running the full import) is recommended — it fixes both
problems at once.
