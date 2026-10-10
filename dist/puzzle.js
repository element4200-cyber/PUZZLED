export const colors=['#fac85b','#a9d49a','#b7a3e2','#f3b5bd','#a9cde8'];
export function layout(count){
  if(count===3)return [{x:0,y:0,w:150,h:150},{x:150,y:0,w:150,h:150},{x:0,y:150,w:300,h:150}];
  if(count===4)return [{x:0,y:0,w:150,h:150},{x:150,y:0,w:150,h:150},{x:0,y:150,w:150,h:150},{x:150,y:150,w:150,h:150}];
  if(count===5)return [{x:0,y:0,w:150,h:100},{x:150,y:0,w:150,h:100},{x:0,y:100,w:150,h:100},{x:150,y:100,w:150,h:100},{x:0,y:200,w:300,h:100}];
  throw new Error('Puzzle must have 3, 4, or 5 pieces.');
}
function edge(rect,side,rects){
  const horizontal=side==='top'||side==='bottom';
  const fixed=horizontal?(side==='top'?rect.y:rect.y+rect.h):(side==='left'?rect.x:rect.x+rect.w);
  const start=horizontal?rect.x:rect.y,end=start+(horizontal?rect.w:rect.h);
  const reverse=side==='bottom'||side==='left';
  const matches=rects.filter(r=>r!==rect && (side==='top'?r.y+r.h===fixed:side==='bottom'?r.y===fixed:side==='left'?r.x+r.w===fixed:r.x===fixed));
  const divisions=[start,end];
  for(const r of matches){const a=horizontal?r.x:r.y,b=a+(horizontal?r.w:r.h);if(Math.min(end,b)>Math.max(start,a))divisions.push(Math.max(start,a),Math.min(end,b));}
  const cuts=[...new Set(divisions)].sort((a,b)=>a-b);
  const segments=[];
  const pt=(u,v=0)=>horizontal?[u,fixed+v]:[fixed+v,u];
  for(let j=0;j<cuts.length-1;j++){
    const a=cuts[j],b=cuts[j+1],mid=(a+b)/2,len=b-a;
    const shared=matches.some(r=>{const from=horizontal?r.x:r.y;return mid>from && mid<from+(horizontal?r.w:r.h);});
    const bump=shared?((Math.round(fixed+mid)%2===0)?1:-1)*14:0;
    if(!bump){segments.push({start:pt(a),ops:[['L',pt(b)]]});continue;}
    const neck=Math.min(9,len*.08),wide=neck*1.6;
    segments.push({start:pt(a),ops:[['L',pt(mid-neck)],['C',pt(mid-neck,0),pt(mid-wide,bump),pt(mid,bump)],['C',pt(mid+wide,bump),pt(mid+neck,0),pt(mid+neck)],['L',pt(b)]]});
  }
  if(reverse){segments.reverse();for(const seg of segments){const positions=[seg.start,...seg.ops.map(o=>o[o.length-1])];const reversed=[];for(let k=seg.ops.length-1;k>=0;k--){const op=seg.ops[k];reversed.push(op[0]==='C'?['C',op[2],op[1],positions[k]]:['L',positions[k]]);}seg.start=positions.at(-1);seg.ops=reversed;}}
  return segments.flatMap(s=>s.ops).map(op=>op[0]+' '+op.slice(1).map(p=>p.join(',')).join(' ')).join(' ');
}
export function piecePaths(count){const rects=layout(count);return rects.map(r=>`M ${r.x},${r.y} ${['top','right','bottom','left'].map(side=>edge(r,side,rects)).join(' ')} Z`);}
let serial=0;
export function puzzleSVG({count=4,image='',selected=0,scatter=false,labels=false,all=false}={}){
  const id='puzzle'+(++serial),paths=piecePaths(count),rects=layout(count),complete=all||selected>=count;
  let defs='',slots='',pieces='';
  paths.forEach((path,i)=>{
    defs+=`<clipPath id="${id}-${i}"><path d="${path}"/></clipPath>`;
    const r=rects[i],assembled=all||i<selected,dx=scatter&&!assembled?(r.x+r.w/2<150?-28:28):0,dy=scatter&&!assembled?(r.y+r.h/2<150?-27:27):0;
    slots+=`<path d="${path}" fill="#e9e6da" stroke="#bdbbae" stroke-width="1.5" stroke-dasharray="4 4"/>`;
    pieces+=`<g class="${assembled&&!all?'snap-piece':''}" style="--x:${dx||20}px;--y:${dy||-25}px" transform="translate(${dx} ${dy})" opacity="${assembled?1:.48}"><g clip-path="url(#${id}-${i})"><rect width="300" height="300" fill="${colors[i]}"/>${image?`<image href="${image.replaceAll('"','&quot;')}" width="300" height="300" preserveAspectRatio="xMidYMid slice" ${assembled?'':'style="filter:grayscale(.8)"'}/>`:''}</g><path d="${path}" fill="none" stroke="#1b1c18" stroke-width="${complete?1.5:2.2}"/>${labels&&!assembled?`<circle cx="${r.x+r.w/2}" cy="${r.y+r.h/2}" r="12" fill="#fffefa" stroke="#1b1c18"/><text x="${r.x+r.w/2}" y="${r.y+r.h/2+4}" text-anchor="middle" style="font:700 12px Arial">${i+1}</text>`:''}</g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${scatter?'-45 -40 390 380':'-3 -3 306 306'}" role="img" aria-label="${count}-piece PFP puzzle, ${all?count:selected} pieces connected"><defs>${defs}</defs>${slots}${pieces}</svg>`;
}
