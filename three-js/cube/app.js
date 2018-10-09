var camera, scene, renderer, raycaster;
  const TEXT_DISTANCE = 2000;
  const TEXT_BG_DISTANCE = 2010;
  const FAR_DISTANCE = 10000;
  const PANORAMA_DISTANCE = 4000;
  const DIRECTION_SIGNS = [
    'NORTH', 'EAST', 'SOUTH', 'WEST'
  ];



  var mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();


  

  init();
  animate();


  document.addEventListener('click', onClick, false);

  function onClick (event) {
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersections = raycaster.intersectObjects( scene.children );

    for (let i = 0; i < intersections.length; i++) {
      let name = intersections[i].object.name.split("_")[0];
      let index = DIRECTION_SIGNS.indexOf(name);
      if (index > -1) {
        alert('open another image: ' + name);
        break;
      }
    }
  }

  function init( ) {

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, FAR_DISTANCE );
    camera.position.set( 0, 0, 10 );

    var controls = new THREE.OrbitControls( camera );
    controls.target.set( 0, 0, 0 );
    controls.update();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    var loader = new THREE.FontLoader();
    loader.load( '../public/fonts/droid/droid_serif_bold.typeface.json', function ( font ) {

      addTextFace(font, 'NORTH', 'front');
      addTextFace(font, 'SOUTH', 'back');
      addTextFace(font, 'WEST', 'left');
      addTextFace(font, 'EAST', 'right');		

    } ); //end load function

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );


    var textures = getTexturesFromAtlasFile( "../public/textures/cube/sun_temple_stripe.jpg", 6 );

    var materials = [];

    for ( var i = 0; i < 6; i ++ ) {

      materials.push( new THREE.MeshBasicMaterial( { map: textures[ i ] } ) );

    }

    var skyBox = new THREE.Mesh( 
      new THREE.BoxBufferGeometry( PANORAMA_DISTANCE, PANORAMA_DISTANCE, PANORAMA_DISTANCE ), 
      materials 
    );
    skyBox.geometry.scale( 1, 1, - 1 );
    scene.add( skyBox );

  } // end init

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  function animate() {

    requestAnimationFrame( animate );

    render();

  }

  function render() {

    renderer.render( scene, camera );

  }


  function addTextFace (font, message = 'North', face = 'front') {
    var xMid, text;

    var color = 0xff0000;

    var matLite = new THREE.MeshLambertMaterial( {
      color: color,
      transparent: false,
      opacity: 1,
      side: THREE.DoubleSide
    } );

    var shapes = font.generateShapes( message, 100 );

    var geometry = new THREE.ShapeBufferGeometry( shapes );

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    var textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    var textHeight = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

    var xMid = - 0.5 * ( textWidth );
    var yMid = - 0.5 * textHeight;

    var plane_geometry = new THREE.PlaneBufferGeometry( textWidth, textHeight, 32 );
    var plane_material = new THREE.MeshBasicMaterial( {
      color: 0xaaaaaa, 
      side: THREE.DoubleSide,
      opacity: 0.5,
    } );
    var plane = new THREE.Mesh(
      plane_geometry,
      plane_material
    );
    

    var text = new THREE.Mesh( geometry, matLite );

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
    
    scene.add( text );
    scene.add(plane);

  }

  function getTexturesFromAtlasFile( atlasImgUrl, tilesNum ) {

  var textures = [];

  for ( var i = 0; i < tilesNum; i ++ ) {

    textures[ i ] = new THREE.Texture();

  }

  var imageObj = new Image();

  imageObj.onload = function() {

    var canvas, context;
    var tileWidth = imageObj.height;

    for ( var i = 0; i < textures.length; i ++ ) {

      canvas = document.createElement( 'canvas' );
      context = canvas.getContext( '2d' );
      canvas.height = tileWidth;
      canvas.width = tileWidth;
      context.drawImage( imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
      textures[ i ].image = canvas
      textures[ i ].needsUpdate = true;

    }

  };

  imageObj.src = atlasImgUrl;

  return textures;

}