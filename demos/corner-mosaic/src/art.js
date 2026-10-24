const palette=['#b76648','#287a99','#d3a348'];
export function tileSVG(tile,conflicts=[],reachable=false){
 const points=[[50,0],[100,50],[50,100],[0,50]];
 let paths='';
 for(let color=0;color<3;color++){
  const sides=tile.edges.map((c,i)=>c===color?i:-1).filter(i=>i>=0);
  if(!sides.length)continue;
  const center=color===0?[43,43]:color===1?[50,50]:[57,57];
  for(const d of sides){const [x,y]=points[d];paths+=`<path d="M${x} ${y} Q${center[0]} ${center[1]} ${center[0]} ${center[1]}" stroke="#fff6df" stroke-width="21" fill="none"/><path d="M${x} ${y} Q${center[0]} ${center[1]} ${center[0]} ${center[1]}" stroke="${palette[color]}" stroke-width="14" fill="none"/>`;}
  paths+=`<circle cx="${center[0]}" cy="${center[1]}" r="7" fill="${palette[color]}"/>`;
 }
 const errs=conflicts.map(d=>{const edges=['M35 3H65','M97 35V65','M35 97H65','M3 35V65'];return `<path d="${edges[d]}" stroke="#b32935" stroke-width="4" stroke-linecap="round"/>`;}).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#fbf2db"/><rect x="3" y="3" width="94" height="94" rx="3" fill="none" stroke="#ddcba5" stroke-width="1"/><path d="M10 19Q10 10 19 10 M81 10Q90 10 90 19 M90 81Q90 90 81 90 M19 90Q10 90 10 81" stroke="#ba7758" fill="none" stroke-width="2"/>${paths}<circle cx="50" cy="50" r="3" fill="#fff6df"/>${errs}${reachable?'<circle cx="89" cy="89" r="4" fill="#153d59" stroke="#fff6df" stroke-width="2"/>':''}</svg>`;
}
export function exportSVG(board,level){const n=level.n;return `<svg xmlns="http://www.w3.org/2000/svg" width="${n*105+40}" height="${n*105+85}" viewBox="0 0 ${n*105+40} ${n*105+85}"><rect width="100%" height="100%" fill="#f5efdf"/><text x="20" y="28" font-family="sans-serif" font-size="14" fill="#233c48">街角拼花 · ${level.title}</text>${board.map((tile,i)=>`<g transform="translate(${20+(i%n)*105} ${45+Math.floor(i/n)*105})">${tileSVG(tile).replace('viewBox="0 0 100 100"','width="100" height="100" viewBox="0 0 100 100"')}</g>`).join('')}<text x="20" y="${n*105+72}" font-family="sans-serif" font-size="10" fill="#737a77">原创几何瓷砖 · corner-mosaic · MIT</text></svg>`;}
