import {piecePaths} from './puzzle.js';

const outline='M38 46H93C87 39 83 32 83 24C83 2 127 2 127 24C127 33 123 40 117 46H180V102C188 96 194 92 202 92C224 92 224 136 202 136C194 136 187 132 180 126V190H118C124 182 128 176 128 168C128 145 84 145 84 168C84 176 88 183 94 190H38V130C46 136 52 140 60 140C83 140 83 96 60 96C52 96 45 100 38 106Z';
let sequence=0,active=null;

function introLogo(){
  const id=`intro-${++sequence}`,paths=piecePaths(4);
  const offsets=[[-82,-65,-24],[84,-65,23],[-75,72,20],[83,75,-22]];
  const parts=paths.map((path,i)=>`<g class="intro-piece" style="--dx:${offsets[i][0]}px;--dy:${offsets[i][1]}px;--turn:${offsets[i][2]}deg;--delay:${i*.18}s"><g clip-path="url(#${id}-cut-${i})"><use href="#${id}-pip"/><g clip-path="url(#${id}-outline)"><path class="intro-seam" d="${path}" transform="scale(.8)" fill="none" stroke="#191a17" stroke-width="2"/></g></g></g>`).join('');
  return `<svg class="intro-logo" viewBox="-95 -95 430 400" role="img" aria-label="Pip's puzzle pieces connect, then Pip winks and smiles"><defs><clipPath id="${id}-outline"><path d="${outline}"/></clipPath>${paths.map((p,i)=>`<clipPath id="${id}-cut-${i}"><path d="${p}" transform="scale(.8)"/></clipPath>`).join('')}<g id="${id}-pip"><path d="${outline}" fill="#fac85b" stroke="#191a17" stroke-width="9" stroke-linejoin="round"/><ellipse cx="86" cy="93" rx="8" ry="11" fill="#191a17"/><circle cx="88" cy="89" r="2.6" fill="white"/><g class="intro-open-eye"><ellipse cx="140" cy="93" rx="8" ry="11" fill="#191a17"/><circle cx="142" cy="89" r="2.6" fill="white"/></g><path class="intro-wink-eye" d="M132 96Q140 86 149 94" fill="none" stroke="#191a17" stroke-width="6" stroke-linecap="round"/><path class="intro-mouth" d="M97 119Q112 119 128 119" stroke="#191a17" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse class="intro-cheek" cx="77" cy="113" rx="10" ry="6" fill="#f596a4"/><ellipse class="intro-cheek" cx="150" cy="113" rx="10" ry="6" fill="#f596a4"/></g></defs><g class="intro-assembled">${parts}<use class="intro-whole" href="#${id}-pip"/></g></svg>`;
}

export function playIntro(){
  if(active)return;
  const previousFocus=document.activeElement;
  const overlay=document.createElement('div');
  overlay.className='puzzled-intro';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Welcome to PUZZLED');
  overlay.innerHTML=`<button class="intro-skip" type="button">Skip intro ↗</button><div class="intro-content"><span class="intro-kicker">EVERY PIECE HAS A PURPOSE.</span>${introLogo()}<div class="intro-wordmark">PUZZLED<span>®</span></div><p>It all comes together.</p></div>`;
  const siblings=[...document.body.children].filter(el=>!['SCRIPT','STYLE'].includes(el.tagName)).map(el=>[el,el.inert]);
  const previousOverflow=document.body.style.overflow;
  siblings.forEach(([el])=>el.inert=true);
  document.body.style.overflow='hidden';
  document.body.append(overlay);
  active=overlay;
  let timer;
  function finish(){
    clearTimeout(timer);
    document.removeEventListener('keydown',key);
    overlay.remove();
    siblings.forEach(([el,inert])=>el.inert=inert);
    document.body.style.overflow=previousOverflow;
    active=null;
    if(previousFocus?.isConnected&&previousFocus!==document.body)previousFocus.focus({preventScroll:true});
    else document.querySelector('.brand')?.focus({preventScroll:true});
  }
  function key(event){
    if(event.key==='Escape'){event.preventDefault();finish();}
    if(event.key==='Tab'){event.preventDefault();overlay.querySelector('button').focus();}
  }
  document.addEventListener('keydown',key);
  overlay.querySelector('button').onclick=finish;
  overlay.querySelector('button').focus({preventScroll:true});
  timer=setTimeout(finish,matchMedia('(prefers-reduced-motion: reduce)').matches?1400:5400);
}

let seen=false;
try{seen=sessionStorage.getItem('puzzled-intro-seen')==='1';}catch{}
if(!seen&&['','#/','#'].includes(location.hash)){
  try{sessionStorage.setItem('puzzled-intro-seen','1');}catch{}
  playIntro();
}
