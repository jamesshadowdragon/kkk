import * as THREE from "three";

import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const canvas = document.getElementById("bg");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x101820);

scene.fog = new THREE.FogExp2(
0x101820,
0.009
);

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
2500
);

camera.position.set(
0,
2,
12
);

const renderer = new THREE.WebGLRenderer({

canvas,

antialias:true,

powerPreference:"high-performance"

});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

renderer.setPixelRatio(
Math.min(window.devicePixelRatio,2)
);

renderer.outputColorSpace=
THREE.SRGBColorSpace;

renderer.shadowMap.enabled=true;

renderer.shadowMap.type=
THREE.PCFSoftShadowMap;
const composer = new EffectComposer(renderer);

composer.addPass(
new RenderPass(
scene,
camera
)
);

const bloom =
new UnrealBloomPass(

new THREE.Vector2(
window.innerWidth,
window.innerHeight
),

0.28,
0.22,
0.55

);

composer.addPass(bloom);
const controls =
new PointerLockControls(
camera,
document.body
);

document.body.addEventListener(
"click",
()=>{

controls.lock();

}
);

scene.add(
controls.object
);

const ambient =
new THREE.AmbientLight(
0xffffff,
0.45
);

scene.add(
ambient
);

const sun =
new THREE.DirectionalLight(
0xffffff,
2
);

sun.position.set(
50,
100,
30
);

sun.castShadow=true;

sun.shadow.mapSize.width=4096;

sun.shadow.mapSize.height=4096;

sun.shadow.camera.left=-100;

sun.shadow.camera.right=100;

sun.shadow.camera.top=100;

sun.shadow.camera.bottom=-100;

scene.add(
sun
);

const purpleLight =
new THREE.PointLight(
0xd6b56d,
34,
48
);

purpleLight.position.set(
0,
8,
0
);

scene.add(
purpleLight
);

const blueLight =
new THREE.PointLight(
0x86a3a3,
28,
52
);

blueLight.position.set(
15,
5,
15
);

scene.add(
blueLight
);

const clock =
new THREE.Clock();

const world =
new THREE.Group();

scene.add(
world
);

const interactables=[];

const player={

speed:10,

velocity:new THREE.Vector3(),

direction:new THREE.Vector3()

};

const loadingScreen =
document.getElementById("loading");

let hasHiddenLoadingScreen=false;


function createTextSprite(text, color="#f1d28a"){

const labelCanvas =
document.createElement("canvas");

labelCanvas.width=512;
labelCanvas.height=128;

const context=
labelCanvas.getContext("2d");

context.fillStyle="rgba(16,24,32,.82)";
context.fillRect(0,0,labelCanvas.width,labelCanvas.height);
context.strokeStyle=color;
context.lineWidth=6;
context.strokeRect(8,8,labelCanvas.width-16,labelCanvas.height-16);
context.fillStyle=color;
context.font="700 42px Space Grotesk, sans-serif";
context.textAlign="center";
context.textBaseline="middle";
context.fillText(text,labelCanvas.width/2,labelCanvas.height/2);

const texture=
new THREE.CanvasTexture(labelCanvas);
texture.colorSpace=THREE.SRGBColorSpace;

const sprite=
new THREE.Sprite(
new THREE.SpriteMaterial({
map:texture,
transparent:true
})
);

sprite.scale.set(12,3,1);

return sprite;

}

function hideLoadingScreen(){

if(hasHiddenLoadingScreen || !loadingScreen)
return;

hasHiddenLoadingScreen=true;

loadingScreen.classList.add("hidden");

loadingScreen.addEventListener(
"transitionend",
()=>{

loadingScreen.remove();

},
{ once:true }
);

}

window.addEventListener(
"resize",
()=>{

camera.aspect=
window.innerWidth/
window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(
window.innerWidth,
window.innerHeight
);

renderer.setPixelRatio(
Math.min(window.devicePixelRatio,2)
);

composer.setSize(
window.innerWidth,
window.innerHeight
);

bloom.setSize(
window.innerWidth,
window.innerHeight
);

});

;
const keys={};

let canJump=false;

let yaw=0;

let pitch=0;

const gravity=28;

const jumpForce=10;

const walkSpeed=8;

const sprintSpeed=14;

window.addEventListener(
"keydown",
e=>{

keys[e.code]=true;

if(
e.code==="Space" &&
canJump
){

player.velocity.y=jumpForce;

canJump=false;

}

});

window.addEventListener(
"keyup",
e=>{

keys[e.code]=false;

});

controls.addEventListener(
"lock",
()=>{

document.getElementById("interaction").style.opacity="0";

});

controls.addEventListener(
"unlock",
()=>{

document.getElementById("interaction").style.opacity="1";

});

function updatePlayer(delta){

player.direction.set(
0,
0,
0
);

if(keys["KeyW"])
player.direction.z-=1;

if(keys["KeyS"])
player.direction.z+=1;

if(keys["KeyA"])
player.direction.x-=1;

if(keys["KeyD"])
player.direction.x+=1;

if(player.direction.lengthSq()>0){

player.direction.normalize();

}

const speed=
keys["ShiftLeft"]
?
sprintSpeed
:
walkSpeed;

player.velocity.x=
player.direction.x*
speed;

player.velocity.z=
player.direction.z*
speed;

player.velocity.y-=
gravity*
delta;

controls.moveRight(
player.velocity.x*
delta
);

controls.moveForward(
-player.velocity.z*
delta
);

camera.position.y+=
player.velocity.y*
delta;

if(camera.position.y<2){

camera.position.y=2;

player.velocity.y=0;

canJump=true;

}

}

function animate(){

requestAnimationFrame(
animate
);

const delta=
clock.getDelta();

updatePlayer(delta);

updateWorldHud(delta);

purpleLight.position.x=
camera.position.x;

purpleLight.position.z=
camera.position.z;

// Clouds

cloudGroup.children.forEach(cloud=>{

cloud.position.x +=
cloud.userData.speed;

if(cloud.position.x>180){

cloud.position.x=-180;

}

});



// Day / Night

const cycle=
clock.elapsedTime*.05;

sun.intensity=
1.5+
Math.sin(cycle)*.8;

ambient.intensity=
.35+
Math.sin(cycle)*.2;



scene.fog.density=
.01+
Math.cos(cycle)*.002;



// Portal glow

portalLights.forEach(light=>{

light.intensity=
light.intensity+
Math.sin(
clock.elapsedTime*4
)*.15;

});



// Floating logo

logo.rotation.y +=
0.01;

logo.rotation.x +=
0.003;

logo.position.y=
15+
Math.sin(
clock.elapsedTime
)*.8;



composer.render();

hideLoadingScreen();

}

// ===== PART 3C : WORLD =====

const worldFloor = new THREE.Mesh(

new THREE.CylinderGeometry(
120,
170,
30,
128
),

new THREE.MeshStandardMaterial({

color:0x334139,

roughness:.95,

metalness:.05

})

);

worldFloor.position.y=-18;

worldFloor.receiveShadow=true;

world.add(worldFloor);



const spawnPlatform = new THREE.Mesh(

new THREE.CylinderGeometry(
18,
20,
2,
64
),

new THREE.MeshStandardMaterial({

color:0x5a655d,

metalness:.35,

roughness:.45

})

);

spawnPlatform.position.y=0;

spawnPlatform.receiveShadow=true;

spawnPlatform.castShadow=true;

world.add(spawnPlatform);



const grid = new THREE.GridHelper(
40,
40,
0xc8b27a,
0x44504a
);

grid.position.y=.02;

world.add(grid);

const pathMaterial=
new THREE.MeshStandardMaterial({

color:0x4b5563,

emissive:0x000000,

emissiveIntensity:0,

metalness:.08,

roughness:.82

});

[
{ x:0,z:-10,w:140,d:4 },
{ x:0,z:12,w:118,d:3 },
{ x:-45,z:18,w:3,d:38 },
{ x:45,z:18,w:3,d:38 },
{ x:0,z:38,w:96,d:4 },
{ x:0,z:58,w:4,d:40 }
].forEach(path=>{

const walkway=new THREE.Mesh(

new THREE.BoxGeometry(path.w,.18,path.d),

pathMaterial

);

walkway.position.set(path.x,.14,path.z);
walkway.receiveShadow=true;
world.add(walkway);

});

[
{ x:0,z:-20,r:42,color:0x2f3d34 },
{ x:0,z:64,r:38,color:0x2b3a40 }
].forEach(plaza=>{
const plazaMesh=new THREE.Mesh(
new THREE.CylinderGeometry(plaza.r,plaza.r,.16,80),
new THREE.MeshStandardMaterial({
color:plaza.color,
metalness:.2,
roughness:.62
})
);
plazaMesh.position.set(plaza.x,.08,plaza.z);
plazaMesh.receiveShadow=true;
world.add(plazaMesh);
});

const districtSign=createTextSprite("PORTFOLIO STUDIOS","#f1d28a");
districtSign.position.set(0,14,-32);
world.add(districtSign);

const sourceSign=createTextSprite("SOURCE LIBRARY","#9fc5c0");
sourceSign.position.set(0,13,70);
world.add(sourceSign);

const planterMaterial=new THREE.MeshStandardMaterial({
color:0x3f4a42,
roughness:.9,
metalness:.04
});

const trunkMaterial=new THREE.MeshStandardMaterial({
color:0x5a3f2b,
roughness:.86
});

const canopyMaterial=new THREE.MeshStandardMaterial({
color:0x49624b,
roughness:.8
});

[
[-50,-36],[-25,-38],[25,-38],[50,-36],
[-50,-4],[50,-4],[-36,46],[36,46],[-36,82],[36,82]
].forEach(([x,z])=>{
const planter=new THREE.Mesh(
new THREE.CylinderGeometry(3.2,3.5,.7,28),
planterMaterial
);
planter.position.set(x,.4,z);
planter.receiveShadow=true;
world.add(planter);

const trunk=new THREE.Mesh(
new THREE.CylinderGeometry(.35,.5,3.2,12),
trunkMaterial
);
trunk.position.set(x,2.1,z);
trunk.castShadow=true;
world.add(trunk);

const canopy=new THREE.Mesh(
new THREE.SphereGeometry(2.2,18,14),
canopyMaterial
);
canopy.position.set(x,4.2,z);
canopy.castShadow=true;
world.add(canopy);
});

[
{ x:0,z:-43,w:96,d:1.2 },
{ x:0,z:7,w:96,d:1.2 },
{ x:-49,z:-18,w:1.2,d:50 },
{ x:49,z:-18,w:1.2,d:50 },
{ x:0,z:43,w:80,d:1.2 },
{ x:0,z:86,w:80,d:1.2 },
{ x:-41,z:64,w:1.2,d:43 },
{ x:41,z:64,w:1.2,d:43 }
].forEach(wall=>{
const lowWall=new THREE.Mesh(
new THREE.BoxGeometry(wall.w,1.1,wall.d),
new THREE.MeshStandardMaterial({
color:0x56615a,
roughness:.7,
metalness:.08
})
);
lowWall.position.set(wall.x,.62,wall.z);
lowWall.castShadow=true;
lowWall.receiveShadow=true;
world.add(lowWall);
});


// Rocks

for(let i=0;i<18;i++){

const rock=new THREE.Mesh(

new THREE.DodecahedronGeometry(
Math.random()*2+.8
),

new THREE.MeshStandardMaterial({

color:0x59645d,

roughness:1

})

);

rock.position.set(

(Math.random()-.5)*170,

Math.random()*8-15,

(Math.random()-.5)*170

);

rock.rotation.set(

Math.random()*Math.PI,

Math.random()*Math.PI,

Math.random()*Math.PI

);

rock.castShadow=true;

rock.receiveShadow=true;

world.add(rock);

}



// Stars

const starGeometry=
new THREE.BufferGeometry();

const starCount=220;

const starArray=
new Float32Array(
starCount*3
);

for(let i=0;i<starCount;i++){

const j=i*3;

starArray[j]=(Math.random()-.5)*1800;

starArray[j+1]=(Math.random()-.5)*900;

starArray[j+2]=(Math.random()-.5)*1800;

}

starGeometry.setAttribute(

"position",

new THREE.BufferAttribute(
starArray,
3
)

);

const stars=new THREE.Points(

starGeometry,

new THREE.PointsMaterial({

color:0xffffff,

size:.8,

transparent:true,

opacity:.16,

depthWrite:false

})

);

scene.add(stars);



// Sky dome

const sky=new THREE.Mesh(

new THREE.SphereGeometry(
900,
64,
64
),

new THREE.MeshBasicMaterial({

color:0x090918,

side:THREE.BackSide

})

);

scene.add(sky);


// ===== PART 3D : PORTFOLIO DISTRICT =====

const projects = [

{
title:"Combat Framework",
description:"A production-style Roblox combat framework focused on server-authoritative hit validation, modular ability definitions, cooldown tracking, animation/sound hooks, and responsive client feedback. Built to be extended for melee, ranged, and special-skill game modes without rewriting the core loop.",
color:0xb08d57,
x:-36,
z:-20
},

{
title:"Inventory System",
description:"A scalable inventory and equipment architecture with clean item metadata, stack handling, hotbar-ready updates, save/load integration, and UI-friendly events. Designed for reliability, easy item balancing, and minimal data loss during player joins and leaves.",
color:0x8fa08f,
x:-12,
z:-20
},

{
title:"RTS Unit AI",
description:"A commandable unit-control system featuring selection groups, move/attack orders, target prioritization, state-based behaviors, and formation-friendly pathing. Useful for strategy, tower-defense, and squad-control Roblox experiences.",
color:0x9a7b4f,
x:12,
z:-20
},

{
title:"Traffic AI",
description:"A city traffic simulation using waypoint lanes, stop points, spacing checks, and route decisions to create believable movement. Built for open-world maps that need traffic flow without overwhelming the server or client.",
color:0x78909c,
x:36,
z:-20
}

];



projects.forEach(project=>{

// Platform

const base=new THREE.Mesh(

new THREE.CylinderGeometry(
4,
4,
1,
32
),

new THREE.MeshStandardMaterial({

color:0x525b55,

metalness:.4,

roughness:.5

})

);

base.position.set(
project.x,
.5,
project.z
);

base.receiveShadow=true;

world.add(base);



// Building

const building=new THREE.Mesh(

new THREE.BoxGeometry(
8,
8,
8
),

new THREE.MeshStandardMaterial({

color:0x2b3333,

metalness:.25,

roughness:.55

})

);

building.position.set(
project.x,
5,
project.z
);

building.castShadow=true;

building.receiveShadow=true;

world.add(building);



// Architectural trim

const edges=new THREE.LineSegments(

new THREE.EdgesGeometry(

new THREE.BoxGeometry(
8.05,
8.05,
8.05
)

),

new THREE.LineBasicMaterial({

color:project.color

})

);

edges.position.copy(
building.position
);

world.add(edges);

const roof=new THREE.Mesh(
new THREE.ConeGeometry(6.2,2.4,4),
new THREE.MeshStandardMaterial({
color:project.color,
emissive:project.color,
emissiveIntensity:.03,
metalness:.25,
roughness:.4
})
);
roof.position.set(project.x,10.2,project.z);
roof.rotation.y=Math.PI/4;
roof.castShadow=true;
world.add(roof);

const roomGlow=new THREE.Mesh(
new THREE.BoxGeometry(9.5,.18,9.5),
new THREE.MeshBasicMaterial({
color:project.color,
transparent:true,
opacity:.12
})
);
roomGlow.position.set(project.x,1.08,project.z);
world.add(roomGlow);

for(let stripe=-2;stripe<=2;stripe+=2){
const windowStrip=new THREE.Mesh(
new THREE.BoxGeometry(1.1,5.2,.12),
new THREE.MeshBasicMaterial({
color:project.color,
transparent:true,
opacity:.42
})
);
windowStrip.position.set(project.x+stripe,5.4,project.z+4.08);
world.add(windowStrip);
}



// Hologram

const hologram=new THREE.Mesh(

new THREE.PlaneGeometry(
6,
3.5
),

new THREE.MeshBasicMaterial({

color:project.color,

transparent:true,

opacity:.45,

side:THREE.DoubleSide

})

);

hologram.position.set(

project.x,

9,

project.z+4.05

);

hologram.userData.title=project.title;
hologram.userData.description=project.description;
building.userData.title=project.title;
building.userData.description=project.description;

world.add(hologram);

interactables.push(hologram);
interactables.push(building);

const projectLabel=createTextSprite(project.title);
projectLabel.position.set(project.x,12.5,project.z+4.4);
world.add(projectLabel);



// Glow

const glow=new THREE.PointLight(

project.color,

9,

16

);

glow.position.set(

project.x,

8,

project.z+3

);

world.add(glow);

});


// ===== SOURCE CODES AREA =====

const sourceScripts = [

{
title:"Datastore Save Script",
description:"Roblox Lua datastore pattern for loading player data safely, saving on leave, and keeping default values ready.",
code:"local DataStoreService = game:GetService('DataStoreService')\nlocal store = DataStoreService:GetDataStore('PlayerData')\n-- load, validate, save on PlayerRemoving",
color:0x9fc5c0,
x:-28,
z:62
},

{
title:"Round System Script",
description:"Server round loop with intermission, match timer, alive-player checks, and clean reset logic for Roblox games.",
code:"while true do\n  runIntermission()\n  startRound()\n  finishRound()\nend",
color:0xb0a06e,
x:0,
z:68
},

{
title:"NPC Pathfinding Script",
description:"PathfindingService NPC controller with waypoint movement, blocked-path retries, and simple chase behavior.",
code:"local PathfindingService = game:GetService('PathfindingService')\nlocal path = PathfindingService:CreatePath()\npath:ComputeAsync(npc.Position, target.Position)",
color:0x88a096,
x:28,
z:62
}

];

sourceScripts.forEach(script=>{

const terminal=new THREE.Mesh(
new THREE.BoxGeometry(10,6,2),
new THREE.MeshStandardMaterial({
color:0x263238,
emissive:script.color,
emissiveIntensity:.04,
metalness:.45,
roughness:.32
})
);

terminal.position.set(script.x,4,script.z);
terminal.castShadow=true;
terminal.receiveShadow=true;
terminal.userData.title=script.title;
terminal.userData.description=script.description+"\n\nPreview:\n"+script.code;
world.add(terminal);
interactables.push(terminal);

const screen=new THREE.Mesh(
new THREE.PlaneGeometry(8.2,3.6),
new THREE.MeshBasicMaterial({
color:script.color,
transparent:true,
opacity:.38,
side:THREE.DoubleSide
})
);
screen.position.set(script.x,4.6,script.z-1.05);
screen.userData.title=terminal.userData.title;
screen.userData.description=terminal.userData.description;
world.add(screen);
interactables.push(screen);

const label=createTextSprite(script.title, "#d8c690");
label.position.set(script.x,8.8,script.z-2.2);
world.add(label);

const pad=new THREE.Mesh(
new THREE.CylinderGeometry(6.5,7.5,.65,40),
new THREE.MeshStandardMaterial({
color:0x34423f,
emissive:script.color,
emissiveIntensity:.05,
metalness:.35,
roughness:.45
})
);
pad.position.set(script.x,.35,script.z);
pad.receiveShadow=true;
world.add(pad);

const codeLight=new THREE.PointLight(script.color,7,18);
codeLight.position.set(script.x,7,script.z-3);
world.add(codeLight);

});

const sourceGate=new THREE.Mesh(
new THREE.TorusGeometry(9,.35,24,140),
new THREE.MeshStandardMaterial({ color:0x3d5454, metalness:.2, roughness:.7 })
);
sourceGate.position.set(0,7,52);
world.add(sourceGate);





// ===== SKILLS BUILDING =====

const skillsBuilding=new THREE.Mesh(

new THREE.CylinderGeometry(
8,
8,
10,
48
),

new THREE.MeshStandardMaterial({

color:0x1c1c35,

metalness:.3,

roughness:.45

})

);

skillsBuilding.position.set(
-45,
5,
35
);

skillsBuilding.castShadow=true;

skillsBuilding.receiveShadow=true;

world.add(skillsBuilding);



// ===== CONTACT TOWER =====

const contactTower=new THREE.Mesh(

new THREE.CylinderGeometry(
5,
7,
14,
48
),

new THREE.MeshStandardMaterial({

color:0x24243d,

metalness:.35,

roughness:.4

})

);

contactTower.position.set(
45,
7,
35
);

contactTower.castShadow=true;

contactTower.receiveShadow=true;

world.add(contactTower);



// ===== TELEPORT PORTALS =====

const portals=[];

[
[-60,0,0],
[60,0,0]
].forEach(pos=>{

const portal=new THREE.Mesh(

new THREE.TorusGeometry(
3,
.25,
32,
120
),

new THREE.MeshBasicMaterial({

color:0x8a744a

})

);

portal.rotation.y=
Math.PI/2;

portal.position.set(
pos[0],
4,
pos[2]
);

world.add(portal);

portals.push(portal);

});



// ===== PATH LIGHTS =====

for(let i=-56;i<=56;i+=16){

const light=new THREE.PointLight(

0xd6b56d,

2.5,

7

);

light.position.set(
i,
1,
10
);

world.add(light);

}



// ===== MAIN LOGO =====

const logo=new THREE.Mesh(

new THREE.TorusKnotGeometry(
3,
.7,
180,
24
),

new THREE.MeshPhysicalMaterial({

color:0xb08d57,

metalness:.65,

roughness:.22,

emissive:0x3a2d16,

emissiveIntensity:.12

})

);

logo.position.set(
0,
15,
0
);

logo.castShadow=true;

world.add(logo);

interactables.push(logo);
// ===== PART 3E : INTERACTION =====

const raycaster = new THREE.Raycaster();

const interaction =
document.getElementById("interaction");

const popup =
document.getElementById("projectPopup");

const popupTitle =
document.getElementById("projectTitle");

const popupDescription =
document.getElementById("projectDescription");

const closePopup =
document.getElementById("closePopup");

const fpsCounter =
document.getElementById("fpsCounter");

const currentArea =
document.getElementById("currentArea");

const workSection =
document.getElementById("workSection");

const closeWorkSection =
document.getElementById("closeWorkSection");

if(workSection){

workSection.addEventListener(
"click",
e=>{

e.stopPropagation();

}
);

}

if(closeWorkSection && workSection){

closeWorkSection.addEventListener(
"click",
e=>{

e.stopPropagation();

workSection.classList.add("closed");

}
);

}

document.querySelectorAll(".copyCode").forEach(button=>{

button.addEventListener(
"click",
e=>{

e.stopPropagation();

const codeBlock=
document.getElementById(button.dataset.copy);

if(!codeBlock)
return;

const codeText=
codeBlock.textContent;

const markCopied=()=>{

button.textContent="Copied";

setTimeout(
()=>{
button.textContent="Copy";
},
1200
);

};

const fallbackCopy=()=>{

const textarea=document.createElement("textarea");
textarea.value=codeText;
document.body.appendChild(textarea);
textarea.select();
document.execCommand("copy");
textarea.remove();
markCopied();

};

if(navigator.clipboard){

navigator.clipboard.writeText(codeText).then(markCopied).catch(fallbackCopy);

}else{

fallbackCopy();

}

}
);

});

let selectedObject=null;

let fpsFrames=0;

let fpsTime=0;



closePopup.addEventListener(
"click",
()=>{

popup.style.display="none";

controls.lock();

});


function updateWorldHud(delta){

fpsFrames++;
fpsTime+=delta;

if(fpsTime>=.5){

fpsCounter.textContent=
Math.round(fpsFrames/fpsTime);

fpsFrames=0;
fpsTime=0;

}

const inSourceCodes=
camera.position.z>45 &&
Math.abs(camera.position.x)<45;

const inWorkDistrict=
camera.position.z<2 &&
Math.abs(camera.position.x)<78;

currentArea.textContent=
inSourceCodes
?
"Source Codes"
:
inWorkDistrict
?
"Portfolio Studios"
:
"Spawn";

raycaster.setFromCamera(
new THREE.Vector2(0,0),
camera
);

const hits=
raycaster.intersectObjects(interactables,false);

selectedObject=
hits.length && hits[0].distance<18
?
hits[0].object
:
null;

interaction.style.opacity=
selectedObject
?
"1"
:
"0";

}

window.addEventListener(
"keydown",
e=>{

if(
e.code!=="KeyE"
) return;

if(!selectedObject)
return;



popup.style.display="block";

controls.unlock();



popupTitle.textContent=
selectedObject.userData.title ||
"LogicNest Project";



popupDescription.textContent=

selectedObject.userData.description ||

"Advanced Roblox development project built by LogicNest. Explore more projects by walking around the world.";

});
// ===== PART 3F : FINAL EFFECTS =====

const cloudGroup=new THREE.Group();

scene.add(cloudGroup);

for(let i=0;i<4;i++){

const cloud=new THREE.Mesh(

new THREE.SphereGeometry(
Math.random()*2+2,
16,
16
),

new THREE.MeshBasicMaterial({

color:0xffffff,

transparent:true,

opacity:.05

})

);

cloud.position.set(

(Math.random()-.5)*350,

Math.random()*50+30,

(Math.random()-.5)*350

);

cloud.userData.speed=
Math.random()*.05+.02;

cloudGroup.add(cloud);

}



const portalLights=[];

scene.traverse(obj=>{

if(obj.type==="PointLight"){

portalLights.push(obj);

}

});

animate();
