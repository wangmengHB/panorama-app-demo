const FONT_TYPE_FACE = '../public/fonts/droid/droid_serif_bold.typeface.json';
const CUBE_PANORAMAMIC_IMAGE_SOURCE = "../public/textures/cube/sun_temple_stripe.jpg";

const CUBE_SKY_BOX_FACE_URLS = [
  '../public/textures/cube/skybox/px.jpg', // right
  '../public/textures/cube/skybox/nx.jpg', // left
  '../public/textures/cube/skybox/py.jpg', // top
  '../public/textures/cube/skybox/ny.jpg', // bottom
  '../public/textures/cube/skybox/pz.jpg', // back
  '../public/textures/cube/skybox/nz.jpg' // front
];

const CUBE_MILKY_WAY_FACE_URLS = [
  '../public/textures/cube/MilkyWay/px.jpg', // right
  '../public/textures/cube/MilkyWay/nx.jpg', // left
  '../public/textures/cube/MilkyWay/py.jpg', // top
  '../public/textures/cube/MilkyWay/ny.jpg', // bottom
  '../public/textures/cube/MilkyWay/pz.jpg', // back
  '../public/textures/cube/MilkyWay/nz.jpg' // front
];


const CUBE_PARK_FACE_URLS = [
  '../public/textures/cube/Park2/px.jpg', // right
  '../public/textures/cube/Park2/nx.jpg', // left
  '../public/textures/cube/Park2/py.jpg', // top
  '../public/textures/cube/Park2/ny.jpg', // bottom
  '../public/textures/cube/Park2/pz.jpg', // back
  '../public/textures/cube/Park2/nz.jpg' // front
];

const CUBE_BRIDGE_2_FACE_URLS = [
  '../public/textures/cube/Bridge2/px.jpg', // right
  '../public/textures/cube/Bridge2/nx.jpg', // left
  '../public/textures/cube/Bridge2/py.jpg', // top
  '../public/textures/cube/Bridge2/ny.jpg', // bottom
  '../public/textures/cube/Bridge2/pz.jpg', // back
  '../public/textures/cube/Bridge2/nz.jpg' // front
];



let index = 0;
function getNextFaceUrls () {
  const collections = [
    CUBE_SKY_BOX_FACE_URLS, 
    CUBE_MILKY_WAY_FACE_URLS, 
    CUBE_PARK_FACE_URLS,
    CUBE_BRIDGE_2_FACE_URLS
  ];
  index++;
  index = index % collections.length;
  return collections[index];
}





const TEXT_DISTANCE = 2000;
const TEXT_BG_DISTANCE = 2010;
const FAR_DISTANCE = 10000;
const PANORAMA_DISTANCE = 4000;
const DIRECTION_SIGNS = [
  'NORTH', 'EAST', 'SOUTH', 'WEST'
];




const raycaster = new THREE.Raycaster();

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, FAR_DISTANCE );
camera.position.set( 0, 0, 10 );

const controls = new THREE.OrbitControls( camera );
controls.target.set( 0, 0, 0 );
controls.update();

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xf0f0f0 );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

const container = document.getElementById( 'container' );
container.appendChild( renderer.domElement );



buildScene(scene, getNextFaceUrls());


start(renderer, scene, camera);



document.addEventListener('click', onClick, false);
window.addEventListener( 'resize', onWindowResize, false );

function onClick (event) {
  event.preventDefault();

  const mouse = new THREE.Vector2();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );

  const intersections = raycaster.intersectObjects( scene.children );

  for (let i = 0; i < intersections.length; i++) {
    let name = intersections[i].object.name.split("_")[0];
    let index = DIRECTION_SIGNS.indexOf(name);
    if (index > -1) {
      // alert('enter another panoramice view, face: ' + name);
      clearScene(scene);
      buildScene(scene, getNextFaceUrls ());
      break;
    }
  }
}



function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function start (renderer, scene, camera) {
  animate();
  function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
  }
}





function buildScene (scene, faceUrls) {
  let loader = new THREE.FontLoader();
  loader.load( FONT_TYPE_FACE, function ( font ) {

    addTextSignToScene(scene, font, 'NORTH', 'front');
    addTextSignToScene(scene, font, 'SOUTH', 'back');
    addTextSignToScene(scene, font, 'WEST', 'left');
    addTextSignToScene(scene, font, 'EAST', 'right');		

  } ); 

  
  let skyBox = createPanoramamicMesh(faceUrls);
  
  scene.add( skyBox );
}


function clearScene (scene) {
  while(scene.children.length > 0) { 
    scene.remove(scene.children[0]); 
  }
}





function addTextSignToScene (scene, font, message = 'North', face = 'front') {

  let color = 0xffff88;

  let matLite = new THREE.MeshBasicMaterial( {
    color: color,
    transparent: false,
    opacity: 1,
    side: THREE.DoubleSide
  } );

  let shapes = font.generateShapes( message, 100 );

  let geometry = new THREE.ShapeBufferGeometry( shapes );

  geometry.computeBoundingBox();

  let textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
  let textHeight = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

  let xMid = - 0.5 * ( textWidth );
  let yMid = - 0.5 * textHeight;

  let plane_geometry = new THREE.PlaneBufferGeometry( textWidth, textHeight, 32 );
  let plane_material = new THREE.MeshBasicMaterial( {
    color: 0xaaaaaa, 
    side: THREE.DoubleSide,
    opacity: 0.5,
  } );
  let plane = new THREE.Mesh(
    plane_geometry,
    plane_material
  );
  

  let text = new THREE.Mesh( geometry, matLite );

  plane.name = message + "_plane";
  text.name = message + '_text';
          
  if (face === 'front') {
    text.position.z = -TEXT_DISTANCE;
    text.position.x = xMid;
    text.position.y = yMid;
    plane.position.z = -TEXT_BG_DISTANCE;
    plane.position.x = 0;
    plane.position.y = 0;
    
  } else if (face === 'back') {
    text.position.z = TEXT_DISTANCE;
    text.position.x = -xMid;
    text.position.y = yMid;
    text.rotation.y = Math.PI; 
    plane.position.z = TEXT_BG_DISTANCE;
    plane.position.x = 0;
    plane.position.y = 0;
    
  } else if (face === 'left') {
    text.position.z = -xMid;
    text.position.x = -TEXT_DISTANCE;
    text.position.y = yMid;
    text.rotation.y = Math.PI / 2;
    plane.position.z = 0;
    plane.position.x = -TEXT_BG_DISTANCE;
    plane.position.y = 0;
    plane.rotation.y = Math.PI / 2;
    
  } else if (face === 'right') {
    text.position.z = xMid;
    text.position.x = TEXT_DISTANCE;
    text.position.y = yMid;
    text.rotation.y = Math.PI / 2 * 3;
    plane.position.z = 0;
    plane.position.x = TEXT_BG_DISTANCE;
    plane.position.y = 0;
    plane.rotation.y = Math.PI / 2 * 3; 
    
  }
  
  scene.add(text);
  scene.add(plane);

}


function createPanoramamicMesh ( faceUrls) {
  let textures = createTexturesForCube(faceUrls);
  let materials = [];
  for (let i = 0; i < 6; i ++ ) {
    materials.push( new THREE.MeshBasicMaterial( { map: textures[ i ] } ) );
  }
  let skyBox = new THREE.Mesh( 
    new THREE.BoxBufferGeometry( PANORAMA_DISTANCE, PANORAMA_DISTANCE, PANORAMA_DISTANCE ), 
    materials 
  );
  skyBox.geometry.scale( 1, 1, -1 );

  return skyBox;

}



function createTexturesForCube( faceUrls ) {

  const textures = [];
  for (let i = 0; i < 6; i++) {
    textures.push(new THREE.Texture());
  }

  const canvas = document.createElement( 'canvas' );
  const context = canvas.getContext('2d');

  faceUrls.forEach( (url, index) => {
    const image = new Image();
    image.src = url;
    image.onload = function () {
      textures[index].image = this;
      textures[index].needsUpdate = true;
    }
  })

  return textures;

}