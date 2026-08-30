---
name: pdfkit row-column layout pitfalls
description: How to lay out multi-column rows (tables) correctly with pdfkit's doc.text/doc.y cursor model.
---

pdfkit's `doc.y` is a mutable cursor that advances after every `.text()` call, even when you pass an explicit `y` argument. It is not a fixed row coordinate.

**Symptom:** rendering several columns on what should be one row (e.g. a table header: Item / Qty / Price / Disc% / GST% / Total) by calling `doc.text(label, x, doc.y, opts)` repeatedly staircases each column progressively lower, because each call reads `doc.y` *after* the previous call already moved it down.

**Why:** `doc.text()` always updates `doc.y` to just below the text it rendered, regardless of whether you passed an explicit `y`. Reading `doc.y` again for the "next column" picks up that advanced value instead of the row's starting position.

**How to apply:**
- Capture the row's y once — `const rowY = doc.y;` — before drawing any column, and pass that same `rowY` to every column's `.text()` call in that row.
- After the row, let the *last* `.text()` call's natural cursor advance stand; don't reset `doc.y` back to `rowY` to "fix spacing" — that pulls the next drawn element (e.g. a divider line via `moveTo/lineTo`) back up so close to the row that it visually strikes through the text.
- If a row also contains an image (`doc.image(buf, x, rowY, { fit: [w, h] })`), explicitly bump `doc.y = Math.max(doc.y, rowY + h)` after the text calls so the next row/divider clears the image height — text-only advances don't account for taller images.
