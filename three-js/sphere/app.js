const FONT_TYPE_FACE = '../public/fonts/droid/droid_serif_bold.typeface.json';

const PANORAMAMIC_IMAGE_SOURCE_1 = '../public/textures/panoramic_sphere/sample_1.jpg';
const PANORAMAMIC_IMAGE_SOURCE_2 = '../public/textures/panoramic_sphere/sample_2.png';


const TEXT_DISTANCE = 2000;
const TEXT_BG_DISTANCE = 2010;
const FAR_DISTANCE = 10000;
const PANORAMA_DISTANCE = 4000;
const DIRECTION_SIGNS = [
  'NORTH', 'EAST', 'SOUTH', 'WEST'
];


var isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;


const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, FAR_DISTANCE );
camera.target = new THREE.Vector3( 0, 0, 0 );

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
const container = document.getElementById( 'container' );
container.appendChild( renderer.domElement );

buildScene(scene, PANORAMAMIC_IMAGE_SOURCE_1)

animate();


document.addEventListener( 'mousedown', onPointerStart, false );
document.addEventListener( 'mousemove', onPointerMove, false );
document.addEventListener( 'mouseup', onPointerUp, false );
window.addEventListener( 'resize', onWindowResize, false );




function buildScene(scene, src) {

  const loader = new THREE.FontLoader();
  loader.load( FONT_TYPE_FACE, function ( font ) {

    addTextSignToScene(scene, font, 'NORTH', 'front');
    addTextSignToScene(scene, font, 'SOUTH', 'back');
    addTextSignToScene(scene, font, 'WEST', 'left');
    addTextSignToScene(scene, font, 'EAST', 'right');		

  } );

  const geometry = new THREE.SphereBufferGeometry( PANORAMA_DISTANCE, 60, 40 );
  // invert the geometry on the x-axis so that all of the faces point inward
  geometry.scale( - 1, 1, 1 );

  const material = new THREE.MeshBasicMaterial( {
    map: new THREE.TextureLoader().load( src)
  } );

  const mesh = new THREE.Mesh( geometry, material );

  scene.add( mesh );

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





function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onPointerStart( event ) {

  isUserInteracting = true;

  var clientX = event.clientX || event.touches[ 0 ].clientX;
  var clientY = event.clientY || event.touches[ 0 ].clientY;

  onMouseDownMouseX = clientX;
  onMouseDownMouseY = clientY;

  onMouseDownLon = lon;
  onMouseDownLat = lat;

}

function onPointerMove( event ) {

  if ( isUserInteracting === true ) {

    var clientX = event.clientX || event.touches[ 0 ].clientX;
    var clientY = event.clientY || event.touches[ 0 ].clientY;

    lon = ( onMouseDownMouseX - clientX ) * 0.1 + onMouseDownLon;
    lat = ( clientY - onMouseDownMouseY ) * 0.1 + onMouseDownLat;

  }

}

function onPointerUp( event ) {

  isUserInteracting = false;

}

function onDocumentMouseWheel( event ) {

  var fov = camera.fov + event.deltaY * 0.05;

  camera.fov = THREE.Math.clamp( fov, 10, 75 );

  camera.updateProjectionMatrix();

}

function animate() {

  requestAnimationFrame( animate );
  update();

}

function update() {

  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  theta = THREE.Math.degToRad( lon );

  camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
  camera.target.y = 500 * Math.cos( phi );
  camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

  camera.lookAt( camera.target );

  /*
  // distortion
  camera.position.copy( camera.target ).negate();
  */


  renderer.render( scene, camera );

}



/*

  document.addEventListener( 'wheel', onDocumentMouseWheel, false );

  document.addEventListener( 'touchstart', onPointerStart, false );
  document.addEventListener( 'touchmove', onPointerMove, false );
  document.addEventListener( 'touchend', onPointerUp, false );



  document.addEventListener( 'dragover', function ( event ) {

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

  }, false );

  document.addEventListener( 'dragenter', function ( event ) {

    document.body.style.opacity = 0.5;

  }, false );

  document.addEventListener( 'dragleave', function ( event ) {

    document.body.style.opacity = 1;

  }, false );

  document.addEventListener( 'drop', function ( event ) {

    event.preventDefault();

    var reader = new FileReader();
    reader.addEventListener( 'load', function ( event ) {

      material.map.image.src = event.target.result;
      material.map.needsUpdate = true;

    }, false );
    reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

    document.body.style.opacity = 1;

  }, false );




*/