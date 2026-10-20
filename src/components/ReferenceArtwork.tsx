import type { CSSProperties } from 'react';

// Viewports into the user's original artwork, keeping its pixels unchanged.
const regions = {
  preserve: [36, 204, 314, 118], organize: [375, 204, 306, 118],
  analyze: [708, 204, 306, 118], reintegrate: [1040, 204, 306, 118],
  artifacts: [1374, 204, 306, 118], export: [1707, 204, 306, 118],
  library: [359, 478, 310, 177], support: [1060, 478, 270, 177],
  guide: [1735, 465, 265, 187], logo: [76, 19, 59, 43],
} as const;

export function ReferenceArtwork({ name, className = '' }: {
  name: keyof typeof regions; className?: string;
}) {
  const [x, y, width, height] = regions[name];
  const style: CSSProperties = {
    width: `${2048 / width * 100}%`, height: `${683 / height * 100}%`,
    left: `${-x / width * 100}%`, top: `${-y / height * 100}%`,
  };
  return <span className={`cg-reference-art ${className}`} style={{ aspectRatio: `${width}/${height}` }} aria-hidden="true">
    <img src="/images/workspace-reference.png" alt="" style={style} draggable={false} />
  </span>;
}

