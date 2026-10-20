import type { CSSProperties } from 'react';
// Nine independently rendered illustrations in a three-column, three-row atlas.
const cells={preserve:[0,0],organize:[1,0],analyze:[2,0],reintegrate:[0,1],artifacts:[1,1],export:[2,1],library:[0,2],support:[1,2],guide:[2,2]} as const;
export function ReferenceArtwork({name,className=''}:{name:keyof typeof cells;className?:string}){
  const [column,row]=cells[name];
  const style:CSSProperties={width:'300%',height:'300%',left:`${-column*100}%`,top:`${-row*100}%`};
  return <span className={`cg-reference-art ${className}`} style={{aspectRatio:'3/2'}} aria-hidden="true"><img src="/images/workspace-metal-atlas.png" alt="" style={style} draggable={false}/></span>;
}
