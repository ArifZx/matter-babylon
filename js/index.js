const MEngine = Matter.Engine,
  MWorld = Matter.World,
  MBodies = Matter.Bodies;

const canvas = document.createElement("canvas");
canvas.style.width = "800px";
canvas.style.height = "600px";
document.body.appendChild(canvas);

const context = canvas.getContext("webgl");

const engine = new BABYLON.Engine(canvas);

const physics = MEngine.create();
physics.world.gravity.y = 0.5;

const balls = [];

const scale = 10;

const scene = createScene();

let time = Date.now();
let rawDelta = 0;
let delta;
const deltas = [];

const getDelta = () => {
  const sum = deltas.slice(-10).reduce((sum, delta) => {
    sum += delta;
    return sum;
  }, 0);

  return sum * 0.1;
};

MEngine.run(physics);
engine.runRenderLoop(() => {
  const lt = Date.now();
  const dt = lt - time;
  time = lt;

  deltas.push(dt);
  if (deltas.length > 20) {
    deltas.splice(-10);
  }
  delta = getDelta();

  for(let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ball) {
      ball.position.y = -ball.body.position.y / scale;
      ball.position.x = ball.body.position.x / scale;
    }

  }

  if (scene && scene.cameras.length) {
    scene.render();
  }
});

function createScene() {
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2,
    60,
    new BABYLON.Vector3.Zero()
  );
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0)
  );

  makeBall(scene, 1, new BABYLON.Vector3(-10, 10, 0));

  makeGround(scene, new BABYLON.Vector3(0, -10, 0));

  return scene;
}

function makeBall(scene, r = 3, position = BABYLON.Vector3.Zero()) {
  const ball = BABYLON.MeshBuilder.CreateSphere("ball", {
    diameter: r * 2,
  });

  ball.position.set(position.x, position.y, position.z);
  const body = MBodies.circle(position.x * 10, -position.y * 10, r * scale, {
    restitution: 0.8,
    friction: 0,
  });
  MWorld.add(physics.world, body);
  ball.body = body;
  balls.push(ball);
}

function makeGround(scene, position = BABYLON.Vector3.Zero()) {
  const mat = new BABYLON.StandardMaterial("groundMat", scene);
  const width = 600,
    height = 1,
    size = 5;
  const ground = BABYLON.MeshBuilder.CreateBox("ground", {
    width,
    height,
    size,
  });

  ground.rotate(BABYLON.Vector3.Backward(), 10 * (Math.PI/180))

  ground.position.set(position.x, position.y, position.z);

  ground.material = mat;
  // mat.wireframe = true;

  const body = MBodies.rectangle(
    position.x * 10,
    -position.y * 10,
    width * scale,
    height * scale,
    {
      isStatic: true,
      restitution: 0.8,
      angle: 10 * (Math.PI/180)
    }
  );
  MWorld.add(physics.world, body);
}
