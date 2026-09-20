import * as THREE from './three.module.js';
/** A single optional composite pass. No blur pyramid or large postprocessing dependency. */
export function createCinematicBloom(renderer) {
  if(!renderer.extensions.has('EXT_color_buffer_float'))return null;
  const size=new THREE.Vector2(),drawing=new THREE.Vector2();
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true,samples:Math.min(4,renderer.capabilities.maxSamples)});
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:true,uniforms:{picture:{value:target.texture},pixel:{value:new THREE.Vector2(1,1)},strength:{value:.28}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
    uniform sampler2D picture;uniform vec2 pixel;uniform float strength;varying vec2 vUv;
    vec3 bright(vec2 p){vec3 c=texture2D(picture,p).rgb;return max(c-vec3(1.15),vec3(0.));}
    void main(){vec3 c=texture2D(picture,vUv).rgb;vec3 glow=vec3(0.);
      for(int i=0;i<8;i++){float a=float(i)*.785398;vec2 direction=vec2(cos(a),sin(a))*pixel;
        glow+=bright(vUv+direction*3.)*.06+bright(vUv+direction*9.)*.045+bright(vUv+direction*19.)*.02;}
      gl_FragColor=vec4(c+glow*strength,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `});
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);scene.add(quad);
  return {render(world,view){
    renderer.getDrawingBufferSize(drawing);const scale=Math.min(1,1800/drawing.x,1200/drawing.y);const w=Math.round(drawing.x*scale),h=Math.round(drawing.y*scale);
    if(size.x!==w||size.y!==h){size.set(w,h);target.setSize(w,h);material.uniforms.pixel.value.set(1/w,1/h);}
    renderer.setRenderTarget(target);renderer.render(world,view);renderer.setRenderTarget(null);renderer.render(scene,camera);
  },dispose(){target.dispose();quad.geometry.dispose();material.dispose();}};
}
