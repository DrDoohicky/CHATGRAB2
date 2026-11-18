# Metallic / digital blend

Current treatment: rounded white cards, brushed silver and deep-blue 3D objects, restrained emerald accents, a transparent glowing digital globe, and a blue/chrome orbital ribbon that curves left and fades into the white page. The brand is deep-blue Chat plus green Grab, with a small speech-bubble/dots icon and a muted partial cog. This version explicitly targets ChatGPT conversation capture.

## Saved assets

- `public/images/workspace-metal-atlas.png`: selected nine-illustration atlas, actual RGBA transparency; used directly by card viewports.
- `public/images/capture-globe-metal.png`: transparent globe and sweeping ribbon.
- `public/images/chatgrab-app-icon.svg`: scalable navigation/favicon artwork.
- `public/images/chatgrab-icon-192.png`, `chatgrab-icon-512.png`, `chatgrab-icon-maskable-512.png`: Android-size icon variants.
- `public/images/chatgrab-intro.gif`: regenerated navy/green text sequence.
- `public/site.webmanifest`: references the app-icon variants; no native Android app or offline operation is claimed.

The two raster illustration assets were edited using the built-in image generation tool. The icon is vector artwork, with matching PNG variants rendered from code. Prior versions are preserved in Git and source artwork files.

## Atlas edit prompt

Create a production TRANSPARENT-background 3x3 illustration atlas derived from these nine ChatGrab illustrations. Only nine independent objects, arranged in exactly 3 columns and 3 rows, evenly sized cells, no text/UI/labels/cell borders. Keep at least 18% transparent margin inside every cell and do not cross cell boundaries. Row1: a document archive box with small lock; three project folders; magnifying glass with a chart. Row2: two rounded conversation panels with curved linking arrows; image/document/video media tiles; report with an upward arrow. Row3: conversation library cabinet with cards; supporting photo/document/audio files; four small browser windows connected by a curved path. STYLE: sophisticated premium 3D product render with rounded machined metal edges, satin silver/aluminum, deep navy and royal-blue enamel, small restrained emerald green accents. Crisp and dimensional, tactile metallic highlights, a little frosted glass, grounded and friendly without childishness. No drawn black outlines, no ink hatching, no neon, no cyberpunk, no clouds, no baby pastel, no tan, mint or candy color backgrounds, no sparkles. Objects ONLY on actual alpha transparency, no colored rectangles, no background plates, no gradients filling the cells. Gentle tight contact shadows only, no broad gray shadow boxes. Intended to float seamlessly inside white UI cards.

## Hero edit prompt

Edit this ChatGrab hero illustration. Preserve its sophisticated glowing blue digital globe, translucent floating conversation panels and small media tiles. Restore the futuristic digital-space feeling rather than line drawing. Remove the opaque dark rectangular backdrop; use TRUE alpha transparency around the whole artwork so it blends smoothly onto a white webpage. Add one elegant rounded silver/chrome and cobalt-blue curved ribbon/orbital swoosh which travels around the globe, arcs gently toward the lower LEFT into the adjacent white text area, and dissolves into delicate translucent blue mist/light as it curves near the bottom. The left extension is mostly open transparent space. Curves should be sleek metal/glass forms, not fluffy clouds. Rounded polished metal edges on some chat panels, with tiny restrained emerald-green status dots. Blue glow concentrated inside and close to the globe, soft translucent edge falloff, no hard rectangular image boundary anywhere. Keep the composition legible and uncluttered, premium dimensional product illustration, deep navy, electric blue, silver, tiny emerald accents. NO words, no logo, no cog, no ink outlines, no baby pastel palette, no tan/pink/mint background, no rainbow neon, no star confetti. Landscape composition with artwork concentrated toward the right and a tapering graceful ribbon extending lower-left. Transparent background.

## Validation

TypeScript and production build passed. Desktop and mobile Capture/Workspace layouts were inspected. RGBA transparency is present in the image assets; actual white-background browser rendering was checked for image rectangles. Existing capture, library, analysis and export handlers are retained.
