var scene, camera, renderer;
var geometry, material, mesh;
var composer;
var clock;

var width = 180;
var height = 180;

var dt = 0
var loop_sec = 20
var fps = 30
var amplitude = 0.3;
var velocities = [];

init();
animate();

function init() {
    clock = new THREE.Clock()

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 50 );
    camera.position.z = 30;

    var ambientLight = new THREE.AmbientLight( 0x000000 );
    scene.add( ambientLight );
    var lights = [];
    brightness = 0.2
    lights[0] = new THREE.PointLight( 0xffffff, brightness, 0 );
    lights[1] = new THREE.PointLight( 0xffffff, brightness, 0 );
    lights[0].position.set( 0, 200, 0 );
    lights[1].position.set( 100, 100, 100 );
    scene.add( lights[0] );
    scene.add( lights[1] );

    geometry = new THREE.DodecahedronGeometry(15, 1);
    var path = "/images/skybox/";
    var format = '.png';
    var urls = [
        path + 'right' + format, path + 'left' + format,
        path + 'top' + format, path + 'bottom' + format,
        path + 'front' + format, path + 'back' + format
    ];
    var textureCube = THREE.ImageUtils.loadTextureCube( urls );
    material = new THREE.MeshPhongMaterial({
        color: 0x156289,
        emissive: 0x072534,
        // envMap: textureCube, refractionRatio: 0.99, reflectivity:0.97,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading
    });

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.autoClear = false;
    renderer.setClearColor( 0x000000, 0 ); // the default
    renderer.setSize( width, height );

    var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
    var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
    composer = new THREE.EffectComposer(renderer, renderTarget);
    var renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    var bloomPass = new THREE.BloomPass(3, 25, 5);
    bloomPass.renderTargetX.format = THREE.RGBAFormat;
    bloomPass.renderTargetY.format = THREE.RGBAFormat;
    composer.addPass(bloomPass)

    var effectFilm = new THREE.FilmPass( 0.15, 0.025, 648, false );
    composer.addPass( effectFilm );

    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;
    composer.addPass(effectCopy); 

    node = document.getElementById('logo');
    if (node) {
        node.removeChild(node.firstChild)
        node.appendChild( renderer.domElement );
    }
    for (var i = 0; i < geometry.vertices.length; i++) {
        rnd = 1-2*Math.random()
        velocities.push(rnd)
    }
}

function animate() {
    requestAnimationFrame( animate );
    dt += 1
    delta = amplitude*Math.sin(dt*2*Math.PI/(loop_sec*fps))/fps
    for (var i=0;i < mesh.geometry.vertices.length; i++) {
        coeff = velocities[i]
        len = mesh.geometry.vertices[i].length()
        new_len = len + delta * coeff
        scale = new_len / len
        mesh.geometry.vertices[i].multiplyScalar(scale)
    }
    mesh.geometry.verticesNeedUpdate = true
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.005;

    // renderer.render( scene, camera );
    var delta = clock.getDelta();
    renderer.clear();
    composer.render(delta);
}
