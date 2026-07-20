import * as THREE from "three";

import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const canvas = document.getElementById("bg");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x050510);

scene.fog = new THREE.FogExp2(
0x050510,
0.012
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

0.9,
0.4,
0.15

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
controls.getObject()
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
0x8b5cf6,
120,
60
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
0x4f46e5,
80,
60
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

});
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

}

animate();
// ===== PART 3C : WORLD =====

const worldFloor = new THREE.Mesh(

new THREE.CylinderGeometry(
120,
170,
30,
128
),

new THREE.MeshStandardMaterial({

color:0x202030,

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

color:0x34345c,

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
0x8b5cf6,
0x2b2b45
);

grid.position.y=.02;

world.add(grid);



// Rocks

for(let i=0;i<90;i++){

const rock=new THREE.Mesh(

new THREE.DodecahedronGeometry(
Math.random()*2+.8
),

new THREE.MeshStandardMaterial({

color:0x45455d,

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



// Floating crystals

for(let i=0;i<60;i++){

const crystal=new THREE.Mesh(

new THREE.OctahedronGeometry(
Math.random()*.7+.4
),

new THREE.MeshPhysicalMaterial({

color:0x8b5cf6,

emissive:0x8b5cf6,

emissiveIntensity:1,

metalness:1,

roughness:.1,

transparent:true,

opacity:.9

})

);

crystal.position.set(

(Math.random()-.5)*120,

Math.random()*18+3,

(Math.random()-.5)*120

);

crystal.userData.speed=

Math.random()*.8+.2;

world.add(crystal);

interactables.push(crystal);

}



// Stars

const starGeometry=
new THREE.BufferGeometry();

const starCount=7000;

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

opacity:.9,

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



// Fog rings

for(let i=0;i<12;i++){

const ring=new THREE.Mesh(

new THREE.TorusGeometry(
35+i*8,
.18,
16,
220
),

new THREE.MeshBasicMaterial({

color:0x8b5cf6,

transparent:true,

opacity:.08

})

);

ring.rotation.x=
Math.PI/2;

ring.position.y=
i*.25+.05;

world.add(ring);

}
// ===== PART 3D : PORTFOLIO DISTRICT =====

const projects = [

{
title:"Combat Framework",
color:0x8b5cf6,
x:-30,
z:-20
},

{
title:"Inventory System",
color:0x4f46e5,
x:0,
z:-20
},

{
title:"RTS Unit AI",
color:0xa855f7,
x:30,
z:-20
},

{
title:"Traffic AI",
color:0x6366f1,
x:60,
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

color:0x2b2b40,

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

color:0x19192d,

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



// Neon edges

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



// Hologram

const hologram=new THREE.Mesh(

new THREE.PlaneGeometry(
6,
3.5
),

new THREE.MeshBasicMaterial({

color:project.color,

transparent:true,

opacity:.8,

side:THREE.DoubleSide

})

);

hologram.position.set(

project.x,

9,

project.z+4.05

);

world.add(hologram);

interactables.push(hologram);



// Glow

const glow=new THREE.PointLight(

project.color,

35,

20

);

glow.position.set(

project.x,

8,

project.z+3

);

world.add(glow);

});



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

color:0x8b5cf6

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

for(let i=-60;i<=60;i+=8){

const light=new THREE.PointLight(

0x8b5cf6,

5,

8

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

color:0x8b5cf6,

metalness:1,

roughness:.05,

emissive:0x8b5cf6,

emissiveIntensity:1

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

let selectedObject=null;

let fpsFrames=0;

let fpsTime=0;



closePopup.addEventListener(
"click",
()=>{

popup.style.display="none";

controls.lock();

});



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

for(let i=0;i<40;i++){

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
