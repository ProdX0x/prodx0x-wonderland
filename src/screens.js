import * as THREE from './three.module.js';
const rounded = (c,x,y,w,h,r) => {c.beginPath();c.roundRect(x,y,w,h,r);};
const text = (c,s,x,y,size=28,color='#344e45',font='sans-serif') => {c.fillStyle=color;c.font=`${size}px ${font}`;c.fillText(s,x,y);};
function landscape(c,x,y,w,h,seed=0){
  c.save();rounded(c,x,y,w,h,Math.min(26,w*.05));c.clip();
  const sky=c.createLinearGradient(0,y,0,y+h);sky.addColorStop(0,'#e9bd9b');sky.addColorStop(.55,'#e9dac1');sky.addColorStop(1,'#b3c7b7');c.fillStyle=sky;c.fillRect(x,y,w,h);
  c.fillStyle='#f7eccd';c.beginPath();c.arc(x+w*.68,y+h*.26,w*.10,0,Math.PI*2);c.fill();
  for(let l=0;l<5;l++){c.beginPath();c.moveTo(x,y+h);for(let j=0;j<=80;j++){let t=j/80;let height=.49+l*.1+Math.sin(t*5.6+l*1.7+seed)*(.12-l*.012)+Math.sin(t*12+l)*.035;c.lineTo(x+t*w,y+h*height);}c.lineTo(x+w,y+h);c.closePath();c.fillStyle=['#bfc1a5','#9eaf93','#7e9e88','#618574','#466d62'][l];c.fill();}
  c.restore();
}
function pill(c,label,x,y,w,color='#e8ecdc'){rounded(c,x,y,w,65,32);c.fillStyle=color;c.fill();text(c,label,x+24,y+42,23);}
export function demoScreen(app){
 const wide=app.device==='tv'||app.device==='appletv'||app.device==='mac';const ipad=app.device==='ipad';
 const canvas=document.createElement('canvas');canvas.width=wide?1440:ipad?1100:750;canvas.height=wide?900:ipad?1450:1600;
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 c.fillStyle='#f6f5e9';c.fillRect(0,0,w,h);
 if(!wide&&!ipad){text(c,'9:41',48,57,25);text(c,'▮▮  ▰',w-140,57,23);}
 if(app.id==='iris'){
   text(c,'iris',w/2-49,215,83,'#405d4a','Georgia');text(c,'LE MONDE SUIT VOTRE REGARD',132,281,20,'#7a896e');
   const g=c.createRadialGradient(375,681,50,375,681,360);g.addColorStop(0,'#e9efbc');g.addColorStop(1,'#f6f5e9');c.fillStyle=g;c.fillRect(0,340,w,710);
   c.save();c.beginPath();c.ellipse(375,650,276,228,0,0,Math.PI*2);c.clip();landscape(c,85,398,580,520);c.restore();
   for(let i=0;i<9;i++){c.beginPath();c.ellipse(375,650,281+i*9,234+i*12,.09,0,Math.PI*2);c.strokeStyle=`rgba(109,135,87,${.21-i*.02})`;c.lineWidth=1.5;c.stroke();}
   c.beginPath();c.arc(375,649,76,0,Math.PI*2);c.fillStyle='#dce8c5cc';c.fill();c.beginPath();c.arc(375,649,32,0,Math.PI*2);c.fillStyle='#466b51';c.fill();c.beginPath();c.arc(365,638,9,0,Math.PI*2);c.fillStyle='#f9fae9';c.fill();
   text(c,'Et si vous jouiez',129,1100,49,'#435d47','Georgia');text(c,'autrement ?',224,1164,49,'#435d47','Georgia');text(c,'Un regard. Une nouvelle aventure.',137,1230,25,'#85907a');
   rounded(c,104,1331,542,92,46);c.fillStyle='#48624c';c.fill();text(c,'Ouvrir les yeux     ↗',227,1389,29,'#f8f7e9');text(c,'PRENEZ LE TEMPS DE VOIR',213,1492,18,'#97a087');
 }else if(app.id==='tidy-buddy'){
   text(c,'Bonjour, vous.',53,195,53,'#4c5b48','Georgia');text(c,'Un petit geste, un grand souffle.',53,250,26,'#8c917b');
   rounded(c,42,310,w-84,445,35);c.fillStyle='#e9d5bc';c.fill();text(c,'VOTRE PETIT RITUEL',82,370,19,'#8f8066');text(c,'Faire de la place.',82,438,44,'#5f654e','Georgia');
   c.fillStyle='#a1b68c';c.beginPath();c.ellipse(385,643,175,50,0,0,Math.PI*2);c.fill();c.fillStyle='#fbf4dd';rounded(c,272,498,220,149,29);c.fill();text(c,'✳',337,611,94,'#a3ad76');
   text(c,'Aujourd’hui, tout simplement',50,847,31);['Aérer la maison','Un coin à ranger','Arroser vos plantes'].forEach((s,i)=>{rounded(c,44,890+i*135,w-88,110,24);c.fillStyle='#eeeee1';c.fill();text(c,'○',75,960+i*135,40,'#9da782');text(c,s,141,952+i*135,28);text(c,'5 min',574,955+i*135,21,'#909a7f');});pill(c,'⌂   Mon espace',54,1430,300,'#dce4c8');text(c,'Rituels     Profil',409,1471,24,'#8b957f');
 }else if(app.device==='tv'||app.device==='appletv'){
   landscape(c,0,0,w,h);const shade=c.createLinearGradient(0,0,w,0);shade.addColorStop(0,'#193f37cc');shade.addColorStop(1,'#193f3700');c.fillStyle=shade;c.fillRect(0,0,w,h);
   text(c,'gramgram',80,104,44,'#ffffec','Georgia');text(c,'NOS SOUVENIRS, EN GRAND',85,165,17,'#dee8cf');text(c,'Les beaux jours.',80,570,88,'#fff9e6','Georgia');text(c,'Ce qui compte, c’est d’être ensemble.',85,633,29,'#e5edda');pill(c,'▶  Revoir l’été',85,706,251,'#f7f6e4');text(c,'ÉTÉ 2026   /   32 SOUVENIRS',1030,821,18,'#f1f3e0');
 }else if(app.device==='mac'){
   c.fillStyle='#e9eee4';c.fillRect(0,0,270,h);['#dca091','#e4c17d','#a7bc8c'].forEach((col,i)=>{c.beginPath();c.arc(32+i*28,30,8,0,7);c.fillStyle=col;c.fill();});text(c,'MyApp Hub',30,112,30);['⌘  Mon atelier','▧  Applications','◷  Activité','✧  Inspirations'].forEach((s,i)=>text(c,s,30,207+i*68,20,i?'#89968a':'#486c56'));
   text(c,'Un espace pour vos idées.',324,125,47,'#425d4c','Georgia');text(c,'Chaque grande application commence par une petite idée.',326,170,20,'#849383');
   ['Iris','Tidy Buddy','GramGramTV'].forEach((s,i)=>{const x=324+i*347;rounded(c,x,239,318,312,20);c.fillStyle=['#dce5c8','#efdfc8','#cedfd6'][i];c.fill();text(c,['◉','✳','▧'][i],x+130,365,66);text(c,s,x+25,465,29);text(c,'Votre prochaine étape   ↗',x+25,507,17,'#849383');});text(c,'La suite s’écrit ici',326,642,31,'#49614f','Georgia');['Affiner les détails','Donner vie à une nouvelle idée','Prendre du recul, puis recommencer'].forEach((s,i)=>{text(c,'○  '+s,330,709+i*55,21,'#859080');});
 }else if(ipad){
   text(c,'pausa',61,120,70,'#626b51','Georgia');text(c,'Un espace pour ne rien presser.',62,174,25,'#9a9a80');landscape(c,55,245,w-110,760,1.5);text(c,'Laisser les idées',92,1163,53,'#687355','Georgia');text(c,'prendre le large.',92,1230,53,'#687355','Georgia');['#869d77','#d2a47f','#dfca8f','#b9bda2','#657d70'].forEach((col,i)=>{c.beginPath();c.arc(100+i*66,1340,20,0,7);c.fillStyle=col;c.fill();});text(c,'✎',952,1357,47);
 }else{
   text(c,app.name,50,205,55,'#565b68','Georgia');text(c,'De belles apps, de belles idées.',50,263,27,'#9692a1');rounded(c,40,326,w-80,440,28);c.fillStyle='#e0ddeb';c.fill();text(c,'LA SÉLECTION DU JOUR',78,382,18,'#888196');text(c,'✧',270,590,163,'#8b8d9f');text(c,'L’inspiration est partout.',83,704,35,'#555d60','Georgia');text(c,'À découvrir',49,860,37,'#575b66','Georgia');['Une idée qui fait du bien','Du beau, du simple','Votre prochain coup de cœur'].forEach((s,i)=>{rounded(c,42,909+i*154,666,129,21);c.fillStyle=['#ece6da','#e1e7dc','#e5e1ea'][i];c.fill();text(c,['◉','✳','♡'][i],75,991+i*154,53,'#85917f');text(c,s,163,964+i*154,25);text(c,'Découvrir cette création    ↗',163,1007+i*154,20,'#94998b');});
 }
 if(!wide&&!ipad){rounded(c,w/2-120,h-30,240,7,4);c.fillStyle='#3b5045';c.fill();}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
export function fitTexture(texture,screenAspect,imageAspect){
 texture.repeat.set(1,1);texture.offset.set(0,0);
 if(imageAspect>screenAspect){texture.repeat.x=screenAspect/imageAspect;texture.offset.x=(1-texture.repeat.x)/2;}
 else {texture.repeat.y=imageAspect/screenAspect;texture.offset.y=(1-texture.repeat.y)/2;}
}
