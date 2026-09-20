import * as THREE from './three.module.js';
import {makeDevice} from './devices.js';
const TAU=Math.PI*2;
export const SPACING=38;
export function pathX(z){return Math.sin(z*.031)*5+Math.sin(z*.012)*3;}
function random(seed){let a=seed;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function mesh(geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);return m;}
function studioEnvironment(renderer){const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');const g=ctx.createLinearGradient(0,0,0,512);g.addColorStop(0,'#fff2d8');g.addColorStop(.45,'#eaf1e1');g.addColorStop(.55,'#80958a');g.addColorStop(1,'#bcc8ad');ctx.fillStyle=g;ctx.fillRect(0,0,1024,512);ctx.fillStyle='#ffffff';ctx.fillRect(100,50,160,330);ctx.fillStyle='#fdf4db';ctx.fillRect(630,60,60,370);const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromEquirectangular(t).texture;t.dispose();pmrem.dispose();return env;}
function createTerrain(radius,height,seed,color){
 const rand=random(seed);const segments=40;const geo=new THREE.PlaneGeometry(radius*2,radius*2,segments,segments);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;const phase=rand()*6;
 for(let i=0;i<p.count;i++){const x=p.getX(i)/radius,z=p.getZ(i)/radius,r=Math.sqrt(x*x+z*z);const envelope=Math.max(0,1-r*r);const hills=.70+Math.sin(x*5+phase)*.15+Math.cos(z*6-phase)*.13+Math.sin(x*11+z*7)*.05;p.setY(i,Math.pow(envelope,1.75)*height*hills-1.2);}
 geo.computeVertexNormals();return mesh(geo,new THREE.MeshStandardMaterial({color,roughness:1,metalness:0}));
}
function makeTree(x,y,z,scale,seed){const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(scale);const rand=random(seed);const trunkmat=new THREE.MeshStandardMaterial({color:'#8e9680',roughness:1});const leafmat=new THREE.MeshStandardMaterial({color:seed%3?'#dfc9ad':'#b3c3a1',roughness:1});group.add(mesh(new THREE.CylinderGeometry(.07,.16,1.8,7),trunkmat,0,.9,0));
 for(let i=0;i<9;i++){const a=rand()*TAU,r=rand()*.8;const leaf=mesh(new THREE.IcosahedronGeometry(.65+rand()*.3,2),leafmat,Math.cos(a)*r,1.8+rand()*.9,Math.sin(a)*r);leaf.scale.y=.65;group.add(leaf);}return group;}
export function createWorld(container,apps){
 const mobile=()=>innerWidth<901 && innerHeight>innerWidth*.85;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.5:1.75));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;container.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#d7e2d5');scene.fog=new THREE.FogExp2('#d7e2d5',.0105);scene.environment=studioEnvironment(renderer);scene.environmentIntensity=.65;
 const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.2,550);
 const hemi=new THREE.HemisphereLight('#fff5de','#729a84',1.65);scene.add(hemi);const sun=new THREE.DirectionalLight('#fff0d2',2.3);sun.position.set(-30,65,20);scene.add(sun);const fill=new THREE.DirectionalLight('#dfede6',.9);fill.position.set(30,20,-80);scene.add(fill);
 const sky=new THREE.Mesh(new THREE.SphereGeometry(450,32,20),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{},vertexShader:'varying vec3 vPosition;void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vPosition;void main(){float h=normalize(vPosition).y;vec3 horizon=vec3(.86,.89,.81);vec3 top=vec3(.60,.75,.72);vec3 c=mix(horizon,top,smoothstep(0.,.8,h));float glow=exp(-length(normalize(vPosition)-normalize(vec3(-.35,.20,-1.)))*5.);c=mix(c,vec3(1.,.85,.65),glow*.67);gl_FragColor=vec4(c,1.);}',toneMapped:false}));scene.add(sky);
 const sunDisk=mesh(new THREE.SphereGeometry(17,48,32),new THREE.MeshBasicMaterial({color:'#fff0cf',fog:false}),-92,64,-240);scene.add(sunDisk);
 const length=Math.max(SPACING*apps.length+100,180);
 const waterMat=new THREE.ShaderMaterial({uniforms:{time:{value:0},fogColor:{value:new THREE.Color('#d7e2d5')}},vertexShader:'varying vec3 vWorld;void main(){vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',fragmentShader:`uniform float time;uniform vec3 fogColor;varying vec3 vWorld;void main(){float d=length(cameraPosition-vWorld);float wave=sin(vWorld.z*3.1+sin(vWorld.x*.7)+time*.3)*sin(vWorld.x*1.8-vWorld.z*.22+time*.2);float small=sin(vWorld.z*15.+vWorld.x*3.)*.5+.5;vec3 c=mix(vec3(.39,.60,.54),vec3(.64,.76,.65),smoothstep(-1.,1.,wave)*.12+.4);float path=exp(-pow((vWorld.x+17.+sin(vWorld.z*.07)*4.)/8.,2.));c+=vec3(.20,.16,.09)*path*small*.44;float fog=1.-exp(-d*d*.00010);c=mix(c,fogColor,fog);gl_FragColor=vec4(c,1.);}`});
 const water=mesh(new THREE.PlaneGeometry(1500,1500),waterMat,0,-1.3,-length/2);water.rotation.x=-Math.PI/2;scene.add(water);
 const pearl=new THREE.MeshStandardMaterial({color:'#f2eedb',roughness:.35,metalness:.18});const edgeMat=new THREE.MeshStandardMaterial({color:'#fff7dd',roughness:.3,metalness:.15,emissive:'#e6d9b8',emissiveIntensity:.10});
 // A continuous, solid architectural ribbon. Its silhouette follows the camera's world-space path.
 const pathSegments=Math.ceil(length*3),vertices=[],normals=[],indices=[];const width=3.05;
 for(let i=0;i<=pathSegments;i++){const z=28-i/pathSegments*(length+28),x=pathX(z),y=.10+Math.sin(z*.06)*.24;vertices.push(x-width,y,z,x+width,y,z);normals.push(0,1,0,0,1,0);if(i<pathSegments){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}}
 const ribbonGeo=new THREE.BufferGeometry();ribbonGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));ribbonGeo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));ribbonGeo.setIndex(indices);const ribbon=new THREE.Mesh(ribbonGeo,pearl);scene.add(ribbon);
 for(const side of [-1,1]){const points=[];for(let i=0;i<=Math.ceil(length);i++){const z=28-i/Math.ceil(length)*(length+28);points.push(new THREE.Vector3(pathX(z)+side*width,.10+Math.sin(z*.06)*.24,z));}const curve=new THREE.CatmullRomCurve3(points);const rail=mesh(new THREE.TubeGeometry(curve,Math.ceil(length*2),.065,6,false),edgeMat);scene.add(rail);const under=rail.clone();under.position.y=-.25;scene.add(under);}
 // Fine joints make the bridge read as a carefully made object rather than a road.
 const jointMat=new THREE.MeshBasicMaterial({color:'#bcc9b4',transparent:true,opacity:.22});const joints=new THREE.InstancedMesh(new THREE.BoxGeometry(width*2,.007,.022),jointMat,Math.ceil(length/1.7));const dummy=new THREE.Object3D();for(let i=0;i<joints.count;i++){const z=25-i*1.7;dummy.position.set(pathX(z),.115+Math.sin(z*.06)*.24,z);dummy.rotation.y=-Math.atan((pathX(z+.1)-pathX(z-.1))/.2);dummy.updateMatrix();joints.setMatrixAt(i,dummy.matrix);}scene.add(joints);
 const rand=random(58);const landGroup=new THREE.Group();scene.add(landGroup);
 for(let i=0;i<Math.ceil(length/24)+5;i++)for(const side of [-1,1]){const z=45-i*27;const x=side*(33+rand()*28)+pathX(z);const terrain=createTerrain(19+rand()*17,13+rand()*34,i*8+(side+1),side===1?'#aab8a0':'#a2b49b');terrain.position.set(x,-1.2,z);landGroup.add(terrain);if(i%3===0){const distant=createTerrain(40,48+rand()*20,i+28,'#aebda9');distant.position.set(side*105,-2,z-30);landGroup.add(distant);}}
 const stages=apps.map((app,i)=>{
   const z=-16-i*SPACING,x=pathX(z)+6.0;const stage=new THREE.Group();stage.position.set(x,0,z);scene.add(stage);
   const terrain=createTerrain(10,3.0,i+53,'#bdc8a3');terrain.position.set(5,-.6,-4);stage.add(terrain);
   const podium=mesh(new THREE.CylinderGeometry(4.7,4.4,.5,80),pearl,0,.55,0);stage.add(podium);const rim=mesh(new THREE.TorusGeometry(4.64,.045,6,100),edgeMat,0,.82,0);rim.rotation.x=-Math.PI/2;stage.add(rim);
   const isWide=['tv','appletv','mac'].includes(app.device);const baseY=isWide?4.65:4.78;
   const createDevice=()=>{const d=makeDevice(app);d.group.position.set(0,baseY,0);d.group.rotation.y=-.15;d.group.rotation.z=isWide?0:-.035;stage.add(d.group);return d;};
   const device=i<5?createDevice():null;
   // Soft contact shadow, baked procedurally into a tiny texture.
   const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,1,64,64,64);gradient.addColorStop(0,'rgba(46,71,51,.27)');gradient.addColorStop(1,'rgba(46,71,51,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const shadowTexture=new THREE.CanvasTexture(shadowCanvas);const shadow=mesh(new THREE.PlaneGeometry(7,4.6),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}),0,.814,0);shadow.rotation.x=-Math.PI/2;stage.add(shadow);
   const arch=new THREE.Mesh(new THREE.TorusGeometry(5.55,.13,10,100,Math.PI*1.63),new THREE.MeshStandardMaterial({color:'#f0dfbe',metalness:.38,roughness:.27}));arch.position.set(.2,4.4,-2.1);arch.rotation.z=-Math.PI*.315;stage.add(arch);
   const innerArch=arch.clone();innerArch.scale.setScalar(1.035);innerArch.material=new THREE.MeshStandardMaterial({color:'#f6eacb',transparent:true,opacity:.45,metalness:.3,roughness:.2});stage.add(innerArch);
   stage.add(makeTree(6.5,1.0,-4,1.5,i*3+4));stage.add(makeTree(-5.7,-.2,-5.0,.85,i+80));stage.add(makeTree(8.1,.3,.8,.8,i+15));
   for(let j=0;j<8;j++){const rock=mesh(new THREE.IcosahedronGeometry(.4+rand()*.5,2),new THREE.MeshStandardMaterial({color:j%2?'#d3d7b8':'#aeba98',roughness:1}),4+rand()*5,.3,-1-rand()*7);rock.scale.set(1.8,.8,1);stage.add(rock);}
   return{stage,device,createDevice,z,x,baseY,isWide,app,podium,rim,shadow};
 });
 // Near foreground islands give parallax and frame the first view.
 const firstIsland=createTerrain(19,6.2,128,'#98ad89');firstIsland.position.set(-23,-1,0);scene.add(firstIsland);const firstTree=makeTree(-15,1.1,-3,2.3,42),secondTree=makeTree(-21,1.8,4,1.6,16);scene.add(firstTree,secondTree);
 const dustGeometry=new THREE.BufferGeometry(),dust=[];for(let i=0;i<110;i++)dust.push((rand()-.5)*60,rand()*17,20-rand()*length);dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));const motes=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:'#ffefd2',size:.06,transparent:true,opacity:.65,depthWrite:false}));scene.add(motes);
 const legacyObjects=[sky,sunDisk,water,landGroup,firstIsland,firstTree,secondTree,motes,joints];
 for(const s of stages)for(const child of s.stage.children)if(child!==s.device?.group&&child!==s.podium&&child!==s.rim&&child!==s.shadow)legacyObjects.push(child);
 let worldDisposed=false;
 let cinematic={update(){},render(){return false;},disable(){},dispose(){}};
 container.dataset.environment='loading';
 import('./cinematic.js').then(({createCinematicLayer})=>{
   if(worldDisposed)return;
   cinematic=createCinematicLayer({scene,renderer,camera,stages,legacy:legacyObjects.map(o=>[o,o.visible]),pearl,edgeMat,hemi,sun,fill,pathX,length,reduced});
 }).catch(()=>{if(!worldDisposed){container.dataset.environment='basic';container.dataset.environmentReason='module-failure';}});
 let target=0,current=0,last=performance.now(),frame=0,active=-1,paused=false;const look=new THREE.Vector3();
 function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.5:1.75));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.fov=mobile()?52:42;camera.updateProjectionMatrix();}
 resize();window.addEventListener('resize',resize);
 function tick(now){frame=requestAnimationFrame(tick);if(paused)return;const dt=Math.min((now-last)/1000,.05);last=now;const delta=target-current;current+=delta*(1-Math.exp(-dt*(reduced.matches?14:4.2)));if(Math.abs(delta)<.0001)current=target;
   const i=Math.min(apps.length-1,Math.max(0,Math.round(current)));const z=1-current*SPACING;const x=pathX(z);const stage=stages[i];const narrow=mobile();
   camera.position.set(x+(narrow?1.2:-1.9),narrow?6.4:5.25+Math.sin(z*.06)*.24,z+(narrow?3:0));
   look.set(pathX(z-19)+(narrow?5.4:1.1),narrow?2.0:4.15,z-23);camera.lookAt(look);sky.position.copy(camera.position);sunDisk.position.z=camera.position.z-240;
   waterMat.uniforms.time.value=reduced.matches?0:now*.001;
   for(let j=0;j<stages.length;j++){const s=stages[j];const distance=s.z-z;s.stage.visible=distance<18&&distance>-165;if(s.stage.visible&&!s.device)s.device=s.createDevice();if(Math.abs(j-current)>5&&s.device){s.stage.remove(s.device.group);s.device.dispose();s.device=null;}if(!s.device)continue;if(Math.abs(j-current)<1.4)s.device.preload();s.device.group.position.y=s.baseY+(reduced.matches?0:Math.sin(now*.00065+j)*.065);s.device.group.position.x=s.isWide?(narrow?-1:-.9):0;s.device.group.scale.setScalar(narrow?(s.isWide?.53:.92):(apps[j].device==='mac'?.65:s.isWide?.76:1));}
   if(i!==active){if(active>=0)stages[active].device?.activate(false);active=i;stages[active]?.device?.activate(!document.hidden);}
   cinematic.update(now,current);
   if(!cinematic.render())renderer.render(scene,camera);
 }
 frame=requestAnimationFrame(tick);
 const visibility=()=>{paused=document.hidden;last=performance.now();stages[active]?.device?.activate(!paused);};document.addEventListener('visibilitychange',visibility);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();paused=true;document.getElementById('fallback').hidden=false;});renderer.domElement.addEventListener('webglcontextrestored',()=>{cinematic.disable('context-restored');paused=false;last=performance.now();document.getElementById('fallback').hidden=true;});
 return{setProgress(p){target=THREE.MathUtils.clamp(p,0,Math.max(0,apps.length-1));},getProgress(){return current;},retryVideo(){stages[active]?.device?.activate(true);},dispose(){worldDisposed=true;cancelAnimationFrame(frame);cinematic.dispose();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);stages.forEach(s=>s.device?.dispose());scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});scene.environment.dispose();renderer.dispose();renderer.domElement.remove();}};
}
