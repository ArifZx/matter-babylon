const MEngine = Matter.Engine,
  MWorld = Matter.World,
  MBodies = Matter.Bodies,
  MBody = Matter.Body;

const canvas = document.createElement("canvas");
canvas.style.width = "100%";
canvas.style.height = "100%";
document.body.appendChild(canvas);

const context = canvas.getContext("webgl");

const engine = new BABYLON.Engine(canvas);

const physics = MEngine.create();
physics.world.gravity.y = 0.5;

const balls = [];

const grounds = [];

const scale = 10;

const scene = createScene();

let spawnInterval = 300;

let rotationSpeed = 10;

let maxLifetime = 15000;

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
let step = 0;
engine.runRenderLoop(() => {
  const lt = Date.now();
  const dt = lt - time;
  time = lt;
  step += dt;

  deltas.push(dt);
  if (deltas.length > 20) {
    deltas.splice(-10);
  }
  delta = getDelta();

  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ball) {
      ball.position.y = -ball.body.position.y / scale;
      ball.position.x = ball.body.position.x / scale;
      ball.rotation.z = -ball.body.angle;
      ball.lifetime += delta;

      if (ball.lifetime > maxLifetime) {
        balls.splice(i, 1);
        i--;
        MWorld.remove(physics.world, ball.body);
        ball.dispose();
      }
    }
  }

  for (let i = 0; i < grounds.length; i++) {
    const ground = grounds[i];
    if (ground) {
      ground.position.y = -ground.body.position.y / scale;
      ground.position.x = ground.body.position.x / scale;
      ground.rotation.z = -ground.body.angle;
      ground.lifetime += delta;
    }
  }

  if (scene && scene.cameras.length) {
    scene.render();
  }

  const g = grounds[4];
  if (g && g.body) {
    MBody.rotate(g.body, -delta*rotationSpeed*1e-3);
  }

  if(step >= spawnInterval) {
    makeBall(scene, Math.random() * 2, new BABYLON.Vector3(-20, 20, 0));
    step = 0;
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

  makeGround(scene, { width: 100 }, new BABYLON.Vector3(0, -20, 0));

  makeGround(
    scene,
    { width: 40 },
    new BABYLON.Vector3(-10, 10, 0),
    10 * (Math.PI / 180)
  );

  makeGround(
    scene,
    { width: 30 },
    new BABYLON.Vector3(15, 0, 0),
    -33 * (Math.PI / 180)
  );

  makeGround(
    scene,
    { width: 30 },
    new BABYLON.Vector3(-10, -10, 0),
    10 * (Math.PI / 180)
  );

  makeGround(
    scene,
    { width: 6 },
    new BABYLON.Vector3(0, -9, 0),
    90 * (Math.PI / 180)
  );

  return scene;
}

function makeBall(scene, r = 3, position = BABYLON.Vector3.Zero()) {
  const ball = BABYLON.MeshBuilder.CreateSphere("ball", {
    diameter: r * 2,
  });

  ball.position.set(position.x, position.y, position.z);
  const body = MBodies.circle(position.x * 10, -position.y * 10, r * scale, {
    restitution: 1,
    friction: 0,
  });
  MWorld.add(physics.world, body);
  ball.body = body;
  ball.lifetime = 0;
  balls.push(ball);
}

function makeGround(
  scene,
  dimension,
  position = BABYLON.Vector3.Zero(),
  angle = 0
) {
  const mat = new BABYLON.StandardMaterial("groundMat", scene);
  const width = dimension?.width || 30,
    height = dimension?.height || 1,
    size = dimension?.size || 5;
  const ground = BABYLON.MeshBuilder.CreateBox("ground", {
    width,
    height,
    size,
  });

  // ground.rotate(BABYLON.Vector3.Backward(), angle);
  ground.rotation.z = -angle;

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
      angle,
    }
  );

  ground.body = body;

  MWorld.add(physics.world, body);

  grounds.push(ground);
}
