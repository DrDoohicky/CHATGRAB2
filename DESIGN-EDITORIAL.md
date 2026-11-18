# Ink-line visual direction

The current treatment replaces the pastel, plastic-looking illustrations with fine ink outlines, flat cobalt, vermilion and plum, cool silver paper, smaller corner radii, and one-pixel dark borders. Hover lift remains. The navigation retains a two-color wordmark; the speech/cog mark and repeated hero branding are removed. Animated headlines start near the top of the left hero panel. The downloadable GIF uses the same paper/ink palette.

## Saved artwork

- `public/images/workspace-ink-atlas.png`: nine independently framed illustrations used by the live cards.
- `public/images/capture-globe-ink.png`: new ink-drawn globe illustration.
- `public/images/chatgrab-intro.gif`: regenerated 27.6-second typography animation.

Both illustrations were created with the built-in image-generation tool using the previous artwork as edit references. Original source files remain available.

## Atlas prompt

Redraw the NINE illustrations from this ChatGrab UI reference as a production artwork atlas. Output ONLY a regular 3-column by 3-row grid of nine equally sized SQUARE cells, no gutters, no outlines around cells, with identical flat pale cool silver #f1f3f5 backgrounds. No UI, no words, no text, no labels, no numbers. Each drawing fits entirely inside its cell with generous 12% empty margins. Read left-to-right top-to-bottom: 1 archive box with document and small lock, 2 upright project folders, 3 large magnifying glass over a chart, 4 two curved arrows linking two conversation panels, 5 documents photo and play-button media tiles, 6 report document with upward arrow, 7 a library cabinet of conversation cards, 8 supporting image document and audio waveform files, 9 four small browser panels linked by a delicate path with a pointer. New visual direction: Moebius / Jean Giraud ligne claire French science-fiction graphic novel illustration, fine confident BLACK ink contours, precise little hatch marks, flat screenprinted colors, imaginative and composed, elegant adult editorial illustration. Palette restricted to rich cobalt blue, vermilion red, aubergine/plum, white, black, cool silver, with limited muted orange. Absolutely NO green, teal, mint, tan, beige, cream, pink pastel, glitter, stars, sparkles, baby-like toy 3D, soft plastic, puffy objects, glows, neon, cyberpunk, Blade Runner, or heavy gradients. Keep recognizable subjects and functional meanings from reference but make crisp ink-drawn almost architectural objects, slightly surreal without visual clutter. Keep all nine cells completely independent; no object crosses a cell boundary.

The tool returned a landscape atlas; the viewport component uses its actual 3:2 cell proportions to preserve drawing geometry.

## Hero prompt

Reinterpret this composition as a sophisticated French ligne claire graphic-novel illustration inspired by Jean Giraud / Moebius, not cyberpunk: a globe with several floating conversation panels, an image tile, a document tile and a small audio tile, connected by three delicate orbital lines. Confident fine BLACK ink outlines, a few precise hatch details, flat screenprinted cobalt blue, vermilion red and aubergine/plum accents, cool silver white paper background #f1f3f5. Make a clean airy editorial drawing, object silhouettes clearly separated with generous negative space, thin architecture-like black contours and imaginative subtle perspective. Absolutely no green, teal, mint, tan, beige, cream, pastel toy look, plastic 3D, glows, neon, sparkles, stars, gradient halos, text, logos, cog wheels, labels or typography. Remove the photographic thumbnails and replace with small ink-drawn mountain studies. Keep the globe and floating records recognizable but reduce clutter: 4 conversation panels and 3 media tiles maximum. Flat light background throughout, with broad empty margins at the edges so the artwork flows naturally onto a light webpage. Landscape 4:3 composition.

## Checks

TypeScript passed. Production build passed. Desktop and mobile Capture/Workspace layouts were inspected. Headline pause/panel controls remain in place. The image atlas uses full cells rather than cropping text from a screenshot.
