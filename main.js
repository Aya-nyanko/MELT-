const $=s=>document.querySelector(s);const menu=$('.menu-toggle'),nav=$('#mobile-nav');
const menuBackground=[$('#main'),$('.skip'),...document.querySelectorAll('.header > :not(.menu-toggle)')];
function closeMenu(){if(nav.hidden)return;nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','メニューを開く');document.body.classList.remove('menu-open');menuBackground.forEach(el=>el.inert=false);menu.focus({preventScroll:true});}
menu.addEventListener('click',()=>{if(!nav.hidden){closeMenu();return}nav.hidden=false;menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','メニューを閉じる');document.body.classList.add('menu-open');menuBackground.forEach(el=>el.inert=true);nav.querySelector('a').focus({preventScroll:true});});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(nav.hidden)return;if(e.key==='Escape'){e.preventDefault();closeMenu();}else if(e.key==='Tab'){const links=[...nav.querySelectorAll('a')];if(e.shiftKey&&document.activeElement===menu){e.preventDefault();links.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===links.at(-1)){e.preventDefault();menu.focus();}}});
const dialog=$('#store-dialog');document.querySelectorAll('[data-store]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));$('.dialog-close').addEventListener('click',()=>dialog.close());
let stopped=false;let cleanup=[];const reduced=matchMedia('(prefers-reduced-motion: reduce)');
// Story content remains visible without JavaScript; reveal only on first entry.
let storyObserver;
const revealedStory=new WeakSet(),storyAnimations=new Set();
function setupStoryReveal(){
  storyObserver?.disconnect();storyAnimations.forEach(a=>a.cancel());storyAnimations.clear();
  if(stopped||reduced.matches||!('IntersectionObserver' in window))return;
  storyObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target;storyObserver.unobserve(el);revealedStory.add(el);
    const distance=innerWidth<=700?12:24;
    const animation=el.animate([{opacity:0,transform:`translateX(${el.classList.contains('story-image')?-distance:distance}px)`},{opacity:1,transform:'translateX(0)'}],{duration:600,easing:'ease-out'});
    storyAnimations.add(animation);animation.onfinish=()=>storyAnimations.delete(animation);
  }),{threshold:.15});
  document.querySelectorAll('.story-image,.story-copy').forEach(el=>{if(!revealedStory.has(el))storyObserver.observe(el)});
}
function setupMotion(){cleanup.forEach(f=>f());cleanup=[];setupStoryReveal();if(stopped||reduced.matches||!window.Motion)return;const {animate,scroll,inView}=Motion;const loop=animate('.package-float',{y:[0,-14,0],rotate:[0,-1.5,0]},{duration:5,ease:'easeInOut',repeat:Infinity});cleanup.push(()=>loop.cancel());if($('.hero-whole')){const whole=animate('.hero-whole',{y:[0,-9,0],rotate:[-15,-8,-15]},{duration:7,repeat:Infinity,ease:'easeInOut'});cleanup.push(()=>whole.cancel());}cleanup.push(scroll(animate('.hero-wordmark',{x:[0,-45]},{ease:'linear'}),{target:$('.hero'),offset:['start start','end start']}));cleanup.push(scroll(animate('.hero-cut',{y:[0,35],rotate:[0,4],scale:[1,1.02]},{ease:'linear'}),{target:$('.hero'),offset:['start start','end start']}));cleanup.push(scroll(animate('.hero-package',{y:[0,-22],scale:[1,.98]},{ease:'linear'}),{target:$('.hero'),offset:['start start','end start']}));if($('.parade-track'))cleanup.push(scroll(animate('.parade-track',{x:['5%','-24%']},{ease:'linear'}),{target:$('.parade'),offset:['start end','end start']}));}
$('.motion-toggle').addEventListener('click',()=>{stopped=!stopped;$('.motion-toggle').setAttribute('aria-pressed',String(stopped));$('.motion-toggle').textContent=stopped?'動きを再開 ▷':'動きを止める Ⅱ';setupMotion()});reduced.addEventListener('change',setupMotion);setupMotion();
const breakButton=$('#break-cookie'),momentImage=$('#moment-image'),word=$('.moment-word');let state=0;
const states=['moment-whole-final','moment-cracked-final','moment-broken-final'];
const words=['さあ、どうぞ。','パリン','中から、とろーり。'];
const momentFrames=states.map(n=>{const image=new Image();image.src=`assets/web/${n}-1280.webp`;return image;});
let momentTransition;
function setCookie(next){
  if(state===next)return;
  state=next;
  momentTransition?.cancel();
  const frame=momentFrames[next];
  const show=()=>{
    if(state!==next)return;
    momentImage.src=frame.src;
    momentImage.width=next===2?1280:1254;momentImage.height=next===2?640:1254;
    breakButton.dataset.stage=String(next);
    momentImage.alt=['割る前の正式ストロベリークッキー','中央にひびが入りクリームがのぞく正式クッキー','左右に大きく割れ、白いクリームチーズの断面が見える正式クッキー'][next];
    word.textContent=words[next];
    breakButton.setAttribute('aria-label',['クッキーにひびを入れる','クッキーを大きく開く','開いた断面。もう一度たのしむボタンで戻ります'][next]);
    if(!reduced.matches&&!stopped)momentTransition=momentImage.animate([{opacity:.35,transform:'scale(.98)'},{opacity:1,transform:'scale(1)'}],{duration:320,easing:'ease-out'});
  };
  if(frame.complete&&frame.naturalWidth)show();else frame.decode().then(show).catch(()=>{state=0;word.textContent='画像を読み込めませんでした。もう一度お試しください。';});
}
breakButton.addEventListener('click',()=>{if(state<2)setCookie(state+1)});
$('.reset-cookie').addEventListener('click',()=>setCookie(0));
reduced.addEventListener('change',()=>momentTransition?.cancel());
document.addEventListener('visibilitychange',()=>{if(document.hidden){cleanup.forEach(f=>f());cleanup=[]}else setupMotion()});
