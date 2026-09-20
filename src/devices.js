import * as THREE from './three.module.js';
import {demoScreen,fitTexture} from './screens.js';
export function roundedShape(w,h,r){
 const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}
function solid(w,h,d,r,material){const geo=new THREE.ExtrudeGeometry(roundedShape(w,h,r),{depth:d,bevelEnabled:true,bevelThickness:.035,bevelSize:.025,bevelSegments:3,curveSegments:12,steps:1});geo.translate(0,0,-d/2);return new THREE.Mesh(geo,material);}
function screen(w,h,r,material){const geo=new THREE.ShapeGeometry(roundedShape(w,h,r),24);const pos=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);return new THREE.Mesh(geo,material);}
export function makeDevice(app){
 const group=new THREE.Group();const tv=app.device==='tv'||app.device==='appletv',mac=app.device==='mac',ipad=app.device==='ipad';
 const w=tv?9.5:mac?8.5:ipad?4.95:3.05,h=tv?5.94:mac?5.31:ipad?6.52:6.5,d=tv?.20:mac?.15:ipad?.14:.22,r=tv?.10:mac?.14:ipad?.30:.43;
 const metal=new THREE.MeshStandardMaterial({color:tv?'#36433e':'#cbd0c5',metalness:.95,roughness:.23});const edge=new THREE.MeshStandardMaterial({color:'#eef0dc',metalness:.85,roughness:.16});const black=new THREE.MeshStandardMaterial({color:'#121c18',roughness:.22,metalness:.35});
 const body=solid(w,h,d,r,metal);group.add(body);
 const rim=solid(w-.035,h-.035,.025,r-.02,edge);rim.position.z=d/2+.01;group.add(rim);
 const glass=solid(w-.095,h-.095,.027,r-.03,black);glass.position.z=d/2+.031;group.add(glass);
 const border=tv?.075:mac?.10:ipad?.17:.09;const sw=w-border*2,sh=h-border*2;
 const placeholder=demoScreen(app);const mat=new THREE.MeshBasicMaterial({map:placeholder,toneMapped:false});const display=screen(sw,sh,Math.max(.04,r-border),mat);display.position.z=d/2+.105;group.add(display);
 if(!tv&&!mac&&!ipad){const island=solid(.81,.205,.028,.102,black);island.position.set(0,h/2-.28,d/2+.115);group.add(island);const lens=new THREE.Mesh(new THREE.CircleGeometry(.044,20),new THREE.MeshStandardMaterial({color:'#142e36',metalness:.8,roughness:.15}));lens.position.set(.26,h/2-.28,d/2+.168);group.add(lens);
   for(const [x,y,bh] of [[-w/2-.035,1.16,.44],[-w/2-.035,.51,.44],[-w/2-.035,1.91,.20],[w/2+.035,.9,.69]]){const b=solid(.045,bh,.12,.02,metal);b.position.set(x,y,-.018);group.add(b);}
   for(const y of [-2.68,2.68])for(const x of [-w/2-.025,w/2+.025]){const band=new THREE.Mesh(new THREE.BoxGeometry(.012,.043,d*.8),new THREE.MeshBasicMaterial({color:'#849083'}));band.position.set(x,y,0);group.add(band);}
 }else if(ipad){const lens=new THREE.Mesh(new THREE.CircleGeometry(.035,16),black);lens.position.set(0,h/2-.075,d/2+.115);group.add(lens);}
 if(mac){const base=solid(w+.35,5.3,.17,.20,metal);base.rotation.x=-Math.PI/2;base.position.set(0,-h/2-.05,2.36);group.add(base);const keyboard=solid(w-1.1,2.5,.015,.12,black);keyboard.rotation.x=-Math.PI/2;keyboard.position.set(0,-h/2+.055,1.67);group.add(keyboard);
   const keymat=new THREE.MeshStandardMaterial({color:'#57615a',roughness:.7});const keys=new THREE.InstancedMesh(new THREE.BoxGeometry(.40,.018,.35),keymat,65);let k=0;const dummy=new THREE.Object3D();for(let row=0;row<5;row++)for(let col=0;col<13;col++){dummy.position.set(-3.28+col*.547,-h/2+.13,.72+row*.45);dummy.updateMatrix();keys.setMatrixAt(k++,dummy.matrix);}group.add(keys);const pad=solid(2.7,1.46,.012,.10,edge);pad.rotation.x=-Math.PI/2;pad.position.set(0,-h/2+.049,3.75);group.add(pad);
 }else if(tv){const stem=new THREE.Mesh(new THREE.CylinderGeometry(.12,.20,1.1,24),metal);stem.position.y=-h/2-.55;group.add(stem);const foot=solid(3.3,.8,.12,.28,metal);foot.rotation.x=-Math.PI/2;foot.position.y=-h/2-1.1;group.add(foot);}
 // A subtle, translucent sheen belongs to the glass, not a HTML overlay.
 const sheenCanvas=document.createElement('canvas');sheenCanvas.width=128;sheenCanvas.height=256;const c=sheenCanvas.getContext('2d');const g=c.createLinearGradient(0,0,128,256);g.addColorStop(0,'rgba(255,255,240,.19)');g.addColorStop(.36,'rgba(255,255,240,0)');g.addColorStop(1,'rgba(255,255,240,.035)');c.fillStyle=g;c.fillRect(0,0,128,256);const sheenTexture=new THREE.CanvasTexture(sheenCanvas);const sheen=screen(sw,sh,Math.max(.04,r-border),new THREE.MeshBasicMaterial({map:sheenTexture,transparent:true,depthWrite:false,toneMapped:false}));sheen.position.z=d/2+.110;group.add(sheen);
 let artworkTexture=null,artworkSource=null;
 let video=null,videoTexture=null,imageTexture=null,loaded=false,active=false,disposed=false;
 function load(){if(loaded)return;loaded=true;if(app.image)new THREE.TextureLoader().load(app.image,t=>{if(disposed){t.dispose();return;}t.colorSpace=THREE.SRGBColorSpace;fitTexture(t,sw/sh,t.image.width/t.image.height);imageTexture=t;if(!videoTexture||!active){mat.map=t;mat.needsUpdate=true;}},undefined,()=>{/* Keep the generated screen if an optional asset is missing. */});}
 function activate(on){active=on;if(on){load();if(app.video&&!video){video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='none';video.crossOrigin='anonymous';video.src=app.video;video.addEventListener('loadeddata',()=>{if(disposed)return;videoTexture=new THREE.VideoTexture(video);videoTexture.colorSpace=THREE.SRGBColorSpace;fitTexture(videoTexture,sw/sh,video.videoWidth/video.videoHeight);if(active){mat.map=videoTexture;mat.needsUpdate=true;}});video.addEventListener('error',()=>{mat.map=imageTexture||placeholder;mat.needsUpdate=true;});}if(video){if(videoTexture){mat.map=videoTexture;mat.needsUpdate=true;}video.play().catch(()=>{mat.map=imageTexture||placeholder;mat.needsUpdate=true;});}}
 else if(video)video.pause();}
 return {group,preload:load,activate,setArtwork(source){
   if(app.image||app.video||artworkSource===source)return;
   artworkSource=source;artworkTexture?.dispose();artworkTexture=source?source.clone():null;
   if(artworkTexture){fitTexture(artworkTexture,sw/sh,source.image.width/source.image.height);artworkTexture.needsUpdate=true;}
   mat.map=artworkTexture||placeholder;mat.needsUpdate=true;
 },dispose(){disposed=true;video?.pause();if(video){video.removeAttribute('src');video.load();}placeholder.dispose();artworkTexture?.dispose();imageTexture?.dispose();videoTexture?.dispose();sheenTexture.dispose();group.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});}};
}
