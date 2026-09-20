/** Optional cinematic world. The V1 scene stays intact until all required assets are ready. */
import * as THREE from './three.module.js';
import {createCinematicBloom} from './cinematic-bloom.js';
const TAU = Math.PI * 2;
const ASSETS = {
  valley: new URL('../assets/cinematic/valley.jpg', import.meta.url).href,
  garden: new URL('../assets/cinematic/cliff-garden.png', import.meta.url).href,
};
function rng(seed) { return () => { seed = Math.imul(1664525, seed) + 1013904223 | 0; return (seed >>> 0) / 4294967296; }; }
function addMesh(parent, geo, mat, x=0, y=0, z=0) {
  const object = new THREE.Mesh(geo, mat); object.position.set(x,y,z); parent.add(object); return object;
}
function glowTexture() {
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,245,213,1)');g.addColorStop(.1,'rgba(255,211,147,.7)');g.addColorStop(.4,'rgba(255,177,109,.15)');g.addColorStop(1,'rgba(255,155,110,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(canvas);
}
function mistTexture() {
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const ctx=canvas.getContext('2d'),rand=rng(152);
  for(let i=0;i<42;i++){const x=24+rand()*208,y=30+rand()*65,r=12+rand()*34;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(221,211,229,.09)');g.addColorStop(.4,'rgba(221,211,229,.05)');g.addColorStop(1,'rgba(221,211,229,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  return new THREE.CanvasTexture(canvas);
}
function loadTexture(url, signal) {
  return new Promise((resolve,reject)=>{
    const image=new Image();let done=false;
    const finish=(error)=>{if(done)return;done=true;signal.removeEventListener('abort',abort);image.onload=image.onerror=null;if(error){image.src='';reject(error);}else{const t=new THREE.Texture(image);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;resolve(t);}};
    const abort=()=>finish(new Error('Cinematic assets timed out'));
    signal.addEventListener('abort',abort,{once:true});image.onload=()=>finish();image.onerror=()=>finish(new Error('Cinematic asset unavailable'));image.src=url;
  });
}
export function createCinematicLayer(ctx) {
  const {scene,renderer,camera,stages,legacy,pearl,edgeMat,hemi,sun,fill,pathX,length,reduced}=ctx;
  const host=renderer.domElement.parentElement;
  const query=new URLSearchParams(location.search);
  const weak=renderer.capabilities.maxTextureSize<2048 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=2) || navigator.connection?.saveData;
  const off=query.get('quality')==='basic'||query.get('cinematic')==='off';
  let disposed=false,enabled=false,root=null,panorama=null,pmremTarget=null,ownedTextures=[],water=null;
  let bloom=null,irisArtwork=null;
  const viewDirection=new THREE.Vector3();
  const waterfalls=[],mists=[],scenicGroups=[],stationGroups=[];
  const aborter=new AbortController();
  const previous={fog:scene.fog,background:scene.background,environment:scene.environment,envIntensity:scene.environmentIntensity,exposure:renderer.toneMappingExposure,pearl:pearl.clone(),edge:edgeMat.clone(),hemi:hemi.clone(),sun:sun.clone(),fill:fill.clone()};
  host.dataset.environment=off||weak?'basic':'loading';
  host.dataset.environmentReason=off?'requested':weak?'capability':'';
  const budgetTimer=setTimeout(()=>aborter.abort(),10000);
  const controller={
    get enabled(){return enabled;},
    update(now,progress){
      if(!enabled)return;
      const time=reduced.matches?0:now*.001;
      // Finite-distance matte painting: only the far plane follows the long valley.
      // Nearby cliff gardens, falling water and buildings retain real world positions.
      camera.getWorldDirection(viewDirection);
      panorama.position.copy(camera.position).addScaledVector(viewDirection,320);
      panorama.quaternion.copy(camera.quaternion);
      const viewHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*320;
      const height=Math.max(viewHeight,viewHeight*camera.aspect/1.5)*1.055;
      panorama.scale.set(height*1.5,height,1);
      panorama.material.map.offset.x=Math.sin(progress*.38)*.006;
      for(const flow of waterfalls)flow.material.uniforms.time.value=time;
      if(water)water.material.uniforms.time.value=time;
      for(const {object,x,phase} of mists){object.position.x=x+(reduced.matches?0:Math.sin(time*.035+phase)*2.3);}
      for(const group of scenicGroups){const d=group.position.z-camera.position.z;group.visible=d<28&&d>-220;}
      for(let i=0;i<stages.length;i++){
        const stage=stages[i];const device=stage.device?.group;if(!device)continue;
        if(irisArtwork&&stage.app.id==='iris')stage.device.setArtwork(irisArtwork);
        device.rotation.y=stage.isWide?-.15:.12;
        const height=stage.app.device==='mac'?2.75:stage.app.device==='tv'||stage.app.device==='appletv'?4.1:stage.app.device==='ipad'?3.26:3.25;
        device.position.y=.88+height*device.scale.x+(reduced.matches?0:Math.sin(time*.65+i)*.025);
      }
    },
    render(){if(enabled&&bloom&&innerWidth>900){bloom.render(scene,camera);return true;}return false;},
    disable(reason='recovery'){
      if(!enabled)return;enabled=false;root.visible=false;
      for(const [object,visible]of legacy) object.visible=visible;
      scene.fog=previous.fog;scene.background=previous.background;scene.environment=previous.environment;scene.environmentIntensity=previous.envIntensity;renderer.toneMappingExposure=previous.exposure;
      pearl.copy(previous.pearl);edgeMat.copy(previous.edge);
      for(const [light,copy]of [[hemi,previous.hemi],[sun,previous.sun],[fill,previous.fill]]){light.color.copy(copy.color);light.intensity=copy.intensity;light.position.copy(copy.position);if(light.groundColor)light.groundColor.copy(copy.groundColor);}
      stationGroups.forEach(g=>g.visible=false);stages.forEach(s=>{s.device?.setArtwork(null);if(s.device)s.device.group.rotation.y=-.15;});document.body.classList.remove('cinematic');host.dataset.environment='basic';host.dataset.environmentReason=reason;
    },
    dispose(){disposed=true;clearTimeout(budgetTimer);aborter.abort();controller.disable('disposed');if(root){root.removeFromParent();root.traverse(o=>{o.geometry?.dispose();if(o.material)for(const mat of Array.isArray(o.material)?o.material:[o.material])mat.dispose();});}for(const g of stationGroups){g.removeFromParent();g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}ownedTextures.forEach(t=>t.dispose());pmremTarget?.dispose();bloom?.dispose();previous.pearl.dispose();previous.edge.dispose();}
  };
  if(off||weak){clearTimeout(budgetTimer);return controller;}
  (async()=>{
    try{
      const results=await Promise.allSettled(Object.values(ASSETS).map(url=>loadTexture(url,aborter.signal)));
      ownedTextures=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
      if(disposed || results.some(r=>r.status==='rejected')){ownedTextures.forEach(t=>t.dispose());ownedTextures=[];throw new Error('Assets not ready');}
      const [valley,garden]=ownedTextures;clearTimeout(budgetTimer);
      root=new THREE.Group();root.name='Cinematic environment';root.visible=false;scene.add(root);
      // Authored mountain / cloud / architecture panorama, deep behind all moving 3D layers.
      panorama=addMesh(root,new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:valley,fog:false,toneMapped:false}),5,22,-320);
      panorama.name='Distant cinematic valley';
      const environment=valley.clone();environment.mapping=THREE.EquirectangularReflectionMapping;environment.needsUpdate=true;ownedTextures.push(environment);
      const pmrem=new THREE.PMREMGenerator(renderer);pmremTarget=pmrem.fromEquirectangular(environment);pmrem.dispose();
      const glow=glowTexture(),mist=mistTexture();ownedTextures.push(glow,mist);
      const metal=new THREE.MeshStandardMaterial({color:'#3c4051',metalness:.87,roughness:.24,envMap:pmremTarget.texture,envMapIntensity:1.1});
      const gold=new THREE.MeshStandardMaterial({color:'#cba880',metalness:.88,roughness:.23,envMap:pmremTarget.texture,envMapIntensity:1.2});
      const light=new THREE.MeshBasicMaterial({color:new THREE.Color(3.5,1.8,.65),toneMapped:true});
      const glowMat=new THREE.SpriteMaterial({map:glow,color:'#ffcd94',transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false});
      const rand=rng(528);
      function ring(parent,r,y,tube=.035,material=light){const rmesh=addMesh(parent,new THREE.TorusGeometry(r,tube,6,96),material,0,y,0);rmesh.rotation.x=-Math.PI/2;return rmesh;}
      // Architectural plinths: bronze fascia, recessed luminous rings, radial inlays,
      // cantilevered tapered supports descending into the clouds.
      for(const stage of stages){
        const group=new THREE.Group();stage.stage.add(group);stationGroups.push(group);
        addMesh(group,new THREE.CylinderGeometry(4.72,4.55,.58,80),metal,0,.33,0);
        addMesh(group,new THREE.CylinderGeometry(4.5,3.85,.35,80),gold,0,-.1,0);
        const profile=[new THREE.Vector2(.25,-12),new THREE.Vector2(.42,-8),new THREE.Vector2(.8,-5),new THREE.Vector2(1.75,-2.6),new THREE.Vector2(3.2,-.9),new THREE.Vector2(3.9,-.26)];
        addMesh(group,new THREE.LatheGeometry(profile,48),metal);
        ring(group,4.73,.64,.028);ring(group,4.6,.03,.035);ring(group,4.45,-.28,.024);ring(group,4.25,.817,.012,gold);ring(group,3.95,.82,.008,gold);
        const radial=new THREE.InstancedMesh(new THREE.BoxGeometry(.012,.008,.49),gold,48),o=new THREE.Object3D();
        for(let j=0;j<48;j++){const a=j/48*TAU;o.position.set(Math.sin(a)*4.25,.825,Math.cos(a)*4.25);o.rotation.y=a;o.updateMatrix();radial.setMatrixAt(j,o.matrix);}group.add(radial);
        for(let j=0;j<8;j++){const a=j/8*TAU;const lamp=addMesh(group,new THREE.BoxGeometry(.12,.08,.08),light,Math.sin(a)*4.68,.43,Math.cos(a)*4.68);lamp.rotation.y=a;const halo=new THREE.Sprite(glowMat);halo.position.copy(lamp.position);halo.scale.set(1.3,1.3,1);group.add(halo);}
        stage.stage.userData.cinematicStation=true;
      }
      // Deck has a visible bronze underside instead of a road resting on the water.
      const sideVertices=[],sideIndices=[];
      for(let i=0;i<=Math.ceil(length);i++){const z=28-i/Math.ceil(length)*(length+28),x=pathX(z),y=.1+Math.sin(z*.06)*.24;sideVertices.push(x-3.05,y,z,x-3.05,y-.37,z,x+3.05,y,z,x+3.05,y-.37,z);if(i<Math.ceil(length)){const q=i*4;sideIndices.push(q,q+4,q+1,q+1,q+4,q+5,q+2,q+3,q+6,q+3,q+7,q+6);}}
      const sideGeo=new THREE.BufferGeometry();sideGeo.setAttribute('position',new THREE.Float32BufferAttribute(sideVertices,3));sideGeo.setIndex(sideIndices);sideGeo.computeVertexNormals();const sideMat=gold.clone();sideMat.side=THREE.DoubleSide;addMesh(root,sideGeo,sideMat);
      function cliff(x,z,size,flip=false){
        const group=new THREE.Group();group.position.set(x,0,z);root.add(group);scenicGroups.push(group);
        const material=new THREE.MeshBasicMaterial({map:garden,transparent:true,alphaTest:.075,depthWrite:true,side:THREE.DoubleSide,color:'#d4c5d1',fog:true,toneMapped:false});
        const art=addMesh(group,new THREE.PlaneGeometry(size*.8,size),material,0,-size*.30,0);art.rotation.y=flip?-.12:.13;if(flip)art.scale.x=-1;
        // Real flowing sheets sit slightly in front of the painted waterfall detail.
        for(let k=0;k<2;k++){
          const flowMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0},opacity:{value:.3},tint:{value:new THREE.Color('#e6dbf2')}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;uniform float opacity;uniform vec3 tint;void main(){float x=vUv.x;float strand=pow(.5+.5*sin(x*170.+sin(x*42.)*4.+vUv.y*7.-time*4.),3.);float rain=.5+.5*sin(vUv.y*105.+time*15.+sin(x*38.));float edge=smoothstep(0.,.18,x)*smoothstep(0.,.18,1.-x);float fade=smoothstep(0.,.20,vUv.y)*smoothstep(0.,.10,1.-vUv.y);gl_FragColor=vec4(tint,edge*fade*(.17+strand*.7+rain*.13)*opacity);}`});
          const stream=addMesh(group,new THREE.PlaneGeometry(size*(k?.044:.065),size*.49,3,16),flowMaterial,size*(k?.037:-.09),-size*.27,.13);waterfalls.push(stream);
        }
        const cloud=new THREE.Sprite(new THREE.SpriteMaterial({map:mist,color:'#b8b6d0',transparent:true,opacity:.75,depthWrite:false}));cloud.position.set(0,-size*.53,1);cloud.scale.set(size*.95,size*.32,1);group.add(cloud);
        return group;
      }
      // Several spatially separate depth bands surround the entire route.
      for(let i=0;i<Math.ceil(length/62);i++){
        const z=-35-i*62;
        cliff(pathX(z)-22-(i%2)*9,z,38+(i%3)*7,i%2===0);
        cliff(pathX(z)-49,z-60,73+(i%3)*11,i%2!==0);
        cliff(pathX(z)+30+(i%2)*9,z-29,44+(i%2)*17,i%2===0);
        cliff(pathX(z)+66,z-99,84,i%2!==0);
      }
      // Tiny inhabited pavilions lend an architectural sense of scale.
      function pavilion(x,y,z,scale){
        const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(scale);root.add(group);scenicGroups.push(group);
        addMesh(group,new THREE.CylinderGeometry(5.6,5.25,.35,48),metal,0,0,0);ring(group,5.65,.18,.04);
        const glass=new THREE.MeshPhysicalMaterial({color:'#8393b9',metalness:.65,roughness:.08,transparent:true,opacity:.65,envMap:pmremTarget.texture,side:THREE.DoubleSide});
        const dome=addMesh(group,new THREE.SphereGeometry(5.5,32,16,0,TAU,0,Math.PI/2),glass,0,3.4,0);dome.scale.y=.31;
        ring(group,5.45,3.42,.045);ring(group,5.5,3.36,.09,gold);
        for(let j=0;j<10;j++){const a=j/10*TAU;addMesh(group,new THREE.CylinderGeometry(.10,.19,3.4,6),gold,Math.sin(a)*4.8,1.7,Math.cos(a)*4.8);}
        addMesh(group,new THREE.CylinderGeometry(4.8,.4,9,24),metal,0,-4.5,0);
      }
      for(let i=0;i<Math.ceil(length/100);i++){pavilion(pathX(-70-i*100)-31,10,-70-i*100,.9);pavilion(pathX(-110-i*100)+37,6,-110-i*100,.7);}
      // Low-lying clouds are sparse translucent billboards; no fullscreen blur pass.
      for(let i=0;i<Math.ceil(length/17);i++){
        const z=12-i*17,x=pathX(z)+(rand()-.5)*70;
        const cloud=new THREE.Sprite(new THREE.SpriteMaterial({map:mist,transparent:true,depthWrite:false,color:i%3?'#afb5d0':'#f0c5bd',opacity:.25+rand()*.18}));
        cloud.position.set(x,-8-rand()*18,z);cloud.scale.set(25+rand()*30,8+rand()*12,1);root.add(cloud);mists.push({object:cloud,x,phase:rand()*TAU});
      }
      // Reflected environment, small surface ripples and the low sun's long glint.
      const waterMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},picture:{value:valley}},vertexShader:'varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}',fragmentShader:`uniform float time;uniform sampler2D picture;varying vec3 vWorld;void main(){vec3 view=normalize(vWorld-cameraPosition);float a=atan(view.x,-view.z);float ripple=sin(vWorld.z*1.3+time*.45+sin(vWorld.x*.7))*.003;vec2 uv=vec2(.5+a*.45,.72+view.y*.35+ripple);vec3 reflected=texture2D(picture,uv).rgb;vec3 c=mix(vec3(.045,.10,.19),reflected,.48);float glint=exp(-pow((view.x-.55)/.12,2.))*pow(.5+.5*sin(vWorld.z*9.+vWorld.x*2.+time),10.);c+=vec3(.6,.29,.09)*glint;float alpha=1.-smoothstep(110.,220.,distance(cameraPosition,vWorld));gl_FragColor=vec4(c,alpha*.9);}`});
      water=addMesh(root,new THREE.PlaneGeometry(550,length+550),waterMaterial,0,-38,-length/2);water.rotation.x=-Math.PI/2;
      // Low-cost floating gold pollen; instanced points share a single draw call.
      const pollen=[];for(let i=0;i<160;i++)pollen.push((rand()-.5)*54,rand()*17-4,20-rand()*length);
      const dust=new THREE.BufferGeometry();dust.setAttribute('position',new THREE.Float32BufferAttribute(pollen,3));root.add(new THREE.Points(dust,new THREE.PointsMaterial({map:glow,color:'#ffd598',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,size:.12,opacity:.5})));
      if(disposed)return;
      // Commit only after construction succeeded; the fallback can be restored atomically.
      for(const [object]of legacy)object.visible=false;
      scene.fog=new THREE.FogExp2('#9294af',.0033);scene.environment=pmremTarget.texture;scene.environmentIntensity=.58;renderer.toneMappingExposure=1.13;
      pearl.color.set('#778096');pearl.metalness=.84;pearl.roughness=.23;pearl.envMap=pmremTarget.texture;pearl.envMapIntensity=1.1;pearl.needsUpdate=true;
      edgeMat.color.set('#ffcf97');edgeMat.emissive.set('#ffa344');edgeMat.emissiveIntensity=3.1;edgeMat.metalness=.55;edgeMat.roughness=.2;
      hemi.color.set('#afbce5');hemi.groundColor.set('#26324c');hemi.intensity=1.35;
      sun.color.set('#ffc08b');sun.intensity=3.7;sun.position.set(40,20,-50);
      fill.color.set('#9cbfff');fill.intensity=1.3;fill.position.set(-25,20,20);
      if(innerWidth>900 && query.get('bloom')!=='off')bloom=createCinematicBloom(renderer);
      root.visible=true;enabled=true;document.body.classList.add('cinematic');host.dataset.environment='cinematic';host.dataset.environmentReason='';
      loadTexture(new URL('../assets/cinematic/iris-screen-original.png',import.meta.url).href,aborter.signal).then(t=>{if(disposed){t.dispose();return;}ownedTextures.push(t);irisArtwork=t;}).catch(()=>{});
    }catch(error){
      clearTimeout(budgetTimer);controller.disable('asset-failure');if(root)root.visible=false;stationGroups.forEach(g=>g.visible=false);
      if(!disposed){host.dataset.environment='basic';host.dataset.environmentReason='asset-failure';}
    }
  })();
  return controller;
}
