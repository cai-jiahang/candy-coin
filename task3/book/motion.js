/* Three.js — MIT. Original page artwork belongs to its author. */
'use strict';

window.createBookMotion = function ({urls, cover, onSpreadChange, onUnavailable}) {
  const T=window.THREE;
  const W=3,H=4.1,NX=48,NY=8;
  const TURN_DURATION=660, DRAG_SLOP=7;
  const LEAVES=urls.length/2, LAST=urls.length-1, LASTOPEN=LEAVES-1;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'default'});
  renderer.setClearColor(0xdedbd3);
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
  const scene=new T.Scene(),root=new T.Group();scene.add(root);
  // Local studio reflection: a long softbox reflected in the coated paper.
  const glossStudio=new T.Scene();glossStudio.background=new T.Color(0x101010);
  function softbox(w,h,x,y,z,strength){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color().setRGB(strength,strength,strength),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);glossStudio.add(m);}
  softbox(.55,6,-1.4,3.2,8,3.0);softbox(.4,6,5,-1,7,2.0);
  const pmrem=new T.PMREMGenerator(renderer);const studioMap=pmrem.fromScene(glossStudio,.035,.1,60);pmrem.dispose();

  const camera=new T.OrthographicCamera(-4,4,3,-3,.1,80);
  camera.position.set(.18,-5.7,19);camera.lookAt(0,0,.08);
  const ambient=new T.HemisphereLight(0xffffff,0xc5bfae,1.75);scene.add(ambient);
  const light=new T.DirectionalLight(0xfffcf7,1.65);light.position.set(-3,3.5,12);light.castShadow=true;
  light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-7,right:7,top:8,bottom:-8,near:1,far:30});light.shadow.bias=-.00025;light.shadow.normalBias=.015;light.shadow.radius=4;scene.add(light);
  const fill=new T.DirectionalLight(0xffffff,.35);fill.position.set(5,-2,7);scene.add(fill);
  const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshBasicMaterial({color:0xdedbd3}));ground.position.z=-.015;scene.add(ground);
  const groundShadow=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({color:0x3a3025,opacity:.12}));groundShadow.position.z=-.014;groundShadow.receiveShadow=true;scene.add(groundShadow);
  // Smooth contact shadow; no grain or paper-noise overlay over the artwork.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;
  const sc=shadowCanvas.getContext('2d'),grad=sc.createRadialGradient(128,128,25,128,128,126);grad.addColorStop(0,'rgba(38,28,17,.35)');grad.addColorStop(.6,'rgba(38,28,17,.15)');grad.addColorStop(1,'rgba(38,28,17,0)');sc.fillStyle=grad;sc.fillRect(0,0,256,256);
  const contact=new T.Mesh(new T.PlaneGeometry(8.1,6),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));contact.position.set(0,-.12,-.013);root.add(contact);
  const plainPaper=new T.MeshPhysicalMaterial({color:0xf5efdf,roughness:.26,clearcoat:.75,clearcoatRoughness:.16});
  // Only the artwork-bearing sheets are rendered; no solid block underneath.
  const textures=new Map(),imageLoader=new T.TextureLoader();
  let enabled=true;
  function texture(i){
    if(textures.has(i))return textures.get(i);
    const tx=i===0?new T.Texture(cover):imageLoader.load(urls[i],invalidate);
    if(i===0)tx.needsUpdate=true;
    tx.colorSpace=T.SRGBColorSpace;
    tx.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    textures.set(i,tx);
    return tx;
  }
  const paperMaterials=new Map();
  function paper(i){if(!paperMaterials.has(i)){const mat=new T.MeshPhysicalMaterial({map:texture(i),roughness:.22,metalness:0,ior:1.48,specularIntensity:.25,clearcoat:.9,clearcoatRoughness:.065,envMap:studioMap.texture,envMapIntensity:.45,side:T.FrontSide});mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\nfloat bindingDistance = ${i%2?'1.0 - vMapUv.x':'vMapUv.x'};\ndiffuseColor.rgb *= 1.0 - 0.14 * exp(-bindingDistance * 22.0) - 0.13 * exp(-bindingDistance * 85.0);`);};mat.customProgramCacheKey=()=>String(i%2);paperMaterials.set(i,mat);}return paperMaterials.get(i);}
  // A closed, double-sided sheet: front, back and a real paper-coloured edge.
  function sheet(){const count=(NX+1)*(NY+1),positions=new Float32Array(count*2*3),uv=new Float32Array(count*2*2),ix=[];
    for(let side=0;side<2;side++)for(let row=0;row<=NY;row++)for(let col=0;col<=NX;col++){const k=side*count+row*(NX+1)+col;uv[k*2]=side?1-col/NX:col/NX;uv[k*2+1]=row/NY;}
    for(let row=0;row<NY;row++)for(let col=0;col<NX;col++){const a=row*(NX+1)+col,b=a+1,d=a+NX+1,c=d+1;ix.push(a,b,d,b,c,d);}
    const frontCount=ix.length;
    for(let k=0;k<frontCount;k+=3)ix.push(ix[k]+count,ix[k+2]+count,ix[k+1]+count);
    const edgeStart=ix.length;
    const edge=(a,b)=>ix.push(a,a+count,b,b,a+count,b+count);
    for(let c=0;c<NX;c++){edge(c+1,c);edge(NY*(NX+1)+c,NY*(NX+1)+c+1);}
    for(let r=0;r<NY;r++){edge(r*(NX+1),(r+1)*(NX+1));edge((r+1)*(NX+1)+NX,r*(NX+1)+NX);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.setIndex(ix);geo.addGroup(0,frontCount,0);geo.addGroup(frontCount,frontCount,1);geo.addGroup(edgeStart,ix.length-edgeStart,2);
    const mesh=new T.Mesh(geo,[plainPaper,plainPaper,plainPaper]);mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;root.add(mesh);return mesh;}
  const left=sheet(),right=sheet(),turn=sheet();turn.visible=false;
  let spread=0,progress=0,turning=null,animation=null,drag=null,raf=0,dirty=true,lastFrame=0;
  function heights(s){return{left:.06+.012*(s/LEAVES),right:.06+.012*(1-s/LEAVES)};}
  function deform(mesh,p,outerZ,flex=.64){const a=mesh.geometry.attributes.position,arr=a.array,count=(NX+1)*(NY+1),wave=Math.sin(p*Math.PI),bend=flex*wave,t=.008;
    for(let row=0;row<=NY;row++){const v=row/NY;let x=0,z=0;
      const twist=.055*wave*(v-.5);
      for(let col=0;col<=NX;col++){const u=col/NX,angle=p*Math.PI+bend*(.52-u)+twist;
        if(col>0){const mid=angle+bend*.5/NX;x+=W/NX*Math.cos(mid);z+=W/NX*Math.sin(mid);}
        const base=.08+(outerZ-.08)*u+.012*Math.sin(Math.PI*u),y=(v-.5)*H;
        for(let side=0;side<2;side++){const k=(side*count+row*(NX+1)+col)*3,offset=(side===0?1:-1)*t/2;arr[k]=x-Math.sin(angle)*offset;arr[k+1]=y+.018*wave*Math.sin(u*Math.PI)*(v-.5);arr[k+2]=base+z+Math.cos(angle)*offset;}
      }
    }a.needsUpdate=true;mesh.geometry.computeVertexNormals();}
  function setMaps(mesh,front,back){mesh.material=[paper(front),paper(back),plainPaper];}
  function positionBook(s){
    const closed=s<1?1-s:Math.max(0,s-LASTOPEN);
    const center=closed*closed*(3-2*closed);
    root.position.x=(s<1?-1:1)*W/2*center;
    contact.scale.x=1-.41*center;
    contact.position.x=-root.position.x;
  }
  function layOut(){left.visible=spread>0;right.visible=spread<LEAVES;const h=heights(spread);if(left.visible){setMaps(left,Math.max(0,spread*2-2),spread*2-1);deform(left,1,h.left);}if(right.visible){setMaps(right,spread*2,Math.min(LAST,spread*2+1));deform(right,0,h.right);}positionBook(spread);onSpreadChange(spread);invalidate();}
  function hasArtwork(s){
    const indexes=s===0?[0]:s===LEAVES?[LAST]:[s*2-1,s*2];
    return indexes.map(texture).every(t=>t.image?.naturalWidth);
  }
  function start(dir){if(turning)return false;if((dir===1&&spread>=LEAVES)||(dir===-1&&spread<=0))return false;turning={dir,from:spread,to:spread+dir};progress=0;
    const leaf=dir===1?spread:spread-1;
    turning.flex=leaf===0||leaf===LEAVES-1?.24:.64;
    setMaps(turn,leaf*2,leaf*2+1);turn.visible=true;
    const target=heights(spread+dir);
    if(dir===1){right.visible=spread+1<LEAVES;if(right.visible){setMaps(right,(spread+1)*2,Math.min(LAST,(spread+1)*2+1));deform(right,0,target.right);}}
    else{left.visible=spread-1>0;if(left.visible){setMaps(left,Math.max(0,(spread-1)*2-2),(spread-1)*2-1);deform(left,1,target.left);}}
    paintTurn();return true;}
  function paintTurn(){if(!turning)return;const {dir,from,to}=turning;const p=dir===1?progress:1-progress,s=from+(to-from)*progress,h=heights(s);
    const outerZ=h.right*(1-p)+h.left*p;deform(turn,p,outerZ+.008,turning.flex);positionBook(s);dirty=true;}
  function complete(commit){const next=commit?turning.to:turning.from;spread=next;turn.visible=false;turning=null;animation=null;progress=0;layOut();warm();}
  function settle(commit,duration){animation={from:progress,to:commit?1:0,start:performance.now(),duration:reduced?1:duration};invalidate();}
  function flip(dir){
    if(animation||drag)return;
    const next=spread+dir;
    if(next<0||next>LEAVES)return;
    if(!hasArtwork(next)){onUnavailable(next);return;}
    if(start(dir))settle(true,TURN_DURATION);
  }
  function go(s){
    if(turning)return;
    if(!hasArtwork(s)){onUnavailable(s);return;}
    spread=s;
    layOut();
    warm();
  }
  function warm(){for(let i=Math.max(0,spread*2-2);i<Math.min(urls.length,spread*2+4);i++)texture(i);}
  function resize(){
    // Keep the same scale for covers and open spreads.
    const aspect=innerWidth/innerHeight;
    const vh=Math.max(5.85,6.8/aspect);
    camera.left=-vh*aspect/2;camera.right=vh*aspect/2;camera.top=vh/2;camera.bottom=-vh/2;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
    renderer.setSize(innerWidth,innerHeight);
    invalidate();
  }
  function invalidate(){if(!enabled)return;dirty=true;if(!raf)raf=requestAnimationFrame(frame);}
  function frame(now){raf=0;const dt=Math.min(40,now-lastFrame||16);lastFrame=now;
     if(animation){const t=Math.max(0,Math.min(1,(now-animation.start)/animation.duration)),ease=animation.from>0?1-(1-t)**3:t*t*(3-2*t);progress=animation.from+(animation.to-animation.from)*ease;paintTurn();if(t>=1){const commit=animation.to===1;complete(commit);}}
     else if(drag&&turning){progress+=(drag.target-progress)*(1-Math.exp(-dt/20));paintTurn();}
    if(dirty){
      try{renderer.render(scene,camera);}catch(error){onUnavailable(spread);return;}
      dirty=false;
    }
    if(animation||(drag&&turning&&Math.abs(progress-drag.target)>.001))raf=requestAnimationFrame(frame);
  }
  // Drag anywhere on a leaf: broad curvature instead of a sharp folded corner.
  const canvas=renderer.domElement,ray=new T.Raycaster(),pointer=new T.Vector2();
  function hit(e){pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects([left,right].filter(m=>m.visible),false)[0];}
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0||animation||drag||document.querySelector('dialog[open]'))return;
    const found=hit(e);
    if(!found)return;
    const dir=found.object===right?1:-1;
    const pageWidth=W/(camera.right-camera.left)*innerWidth;
    canvas.setPointerCapture(e.pointerId);
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastTime:e.timeStamp,velocity:0,target:0,travel:Math.max(82,pageWidth*1.16),moved:false,dir};
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const dx=(drag.x-e.clientX)*drag.dir,dy=Math.abs(drag.y-e.clientY);
    if(!drag.moved&&Math.max(Math.abs(dx),dy)<DRAG_SLOP)return;
    drag.moved=true;
    if(!turning&&(dx<DRAG_SLOP||dy>dx||spread+drag.dir<0||spread+drag.dir>LEAVES||!hasArtwork(spread+drag.dir)||!start(drag.dir)))return;
    drag.target=Math.max(0,Math.min(1,(dx-DRAG_SLOP)/drag.travel));
    drag.velocity=(drag.lastX-e.clientX)*drag.dir/Math.max(1,e.timeStamp-drag.lastTime);
    drag.lastX=e.clientX;
    drag.lastTime=e.timeStamp;
    invalidate();
  });
  function release(e,cancel=false){
    if(!drag||e.pointerId!==drag.id)return;
    const finishedDrag=drag;
    drag=null;
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(!turning){
      if(!cancel&&!finishedDrag.moved)flip(finishedDrag.dir);
      return;
    }
    const freshFlick=e.timeStamp-finishedDrag.lastTime<85&&finishedDrag.velocity>.65;
    const commit=!cancel&&(finishedDrag.target>.33||(freshFlick&&finishedDrag.target>.13));
    const remaining=Math.abs((commit?1:0)-progress);
    settle(commit,Math.max(150,Math.min(420,remaining*TURN_DURATION)));
  }
  canvas.addEventListener('pointerup',e=>release(e));canvas.addEventListener('pointercancel',e=>release(e,true));
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();
    onUnavailable(spread);
  });
  function disable(){
    enabled=false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize',resize);
    renderer.dispose();
    canvas.remove();
  }
  try{
    resize();
    layOut();
    renderer.render(scene,camera);
    warm();
    window.addEventListener('resize',resize);
  }catch(error){
    disable();
    throw error;
  }
  return {canvas,flip,go,disable};
};
