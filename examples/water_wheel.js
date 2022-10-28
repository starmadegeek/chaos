let width = 150;
let height = 150;
const numBuckets = 16;

// the object generator: water wheel attributes
function waterwheel(n) {
  let r = Math.random() * Math.PI * 2;
  let v = Math.random() - 0.5;
  return {
    nbuckets: n,
    damping: 2.5, // coefficient of damping for wheel (ft*lbs/rad/sec)
    inertia: 0.1, // moment of inertia of empty wheel (slug*ft^2)
    drain: 0.3, // drain rate per cup (slug/sec/slug)
    fillrate: 0.33, // fill rate per cup (slugs/sec)
    gravity: 32.2, // acceleration due to gravity (ft/sec^2)
    radius: 1.0, // radius of wheel (ft)
    rotation: r, // position of cup 0 (rad)
    velocity: v, // angular velocity (rad/s)
    buckets: new Float64Array(n),
    centreOfMassHistory: [],
  };
}

// derivative func used in Range kutta 4th order
function derive(wheel) {
  // moment of inertia: sum of contributions from each cup
  let inertia = 0;
  for (let i = 0; i < wheel.nbuckets; i++) inertia += wheel.buckets[i];
  inertia = inertia * wheel.radius * wheel.radius + wheel.inertia;

  // torque contribution from each cup
  let torque = -wheel.damping * wheel.velocity;
  let rg = wheel.radius * wheel.gravity;
  for (let i = 0; i < wheel.nbuckets; i++) {
    let r = wheel.rotation + (i * 2 * Math.PI) / wheel.nbuckets;
    torque += rg * wheel.buckets[i] * Math.sin(r);
  }
  // compute drain and spigot for each cup
  let bdot = new Float64Array(wheel.nbuckets);
  let f = wheel.fillrate / 2;
  for (let i = 0; i < wheel.nbuckets; i++) {
    let r = wheel.rotation + (i * 2 * Math.PI) / wheel.nbuckets;
    bdot[i] = -wheel.drain * wheel.buckets[i];
    if (Math.cos(r) > Math.abs(Math.cos((2 * Math.PI) / wheel.nbuckets))) {
      let x = Math.atan2(Math.tan(r), 1);
      bdot[i] += f * (Math.cos((wheel.nbuckets * x) / 2) + 1);
    }
  }

  return {
    rdot: wheel.velocity,
    vdot: torque / inertia,
    bdot: bdot,
  };
}

// utility func
function clone(wheel) {
  let dup = Object.assign({}, wheel);
  dup.buckets = wheel.buckets.slice();
  return dup;
}

// vector application
function apply(wheel, wdot, dt) {
  wheel.rotation += wdot.rdot * dt;
  wheel.velocity += wdot.vdot * dt;
  for (let i = 0; i < wheel.nbuckets; i++)
    wheel.buckets[i] += wdot.bdot[i] * dt;
  return wheel;
}

// application of range kutta 4th order method on the wheel
function rk4(k1, dt) {
  let k1d = derive(k1);
  let k2 = apply(clone(k1), k1d, dt / 2);
  let k2d = derive(k2);
  let k3 = apply(clone(k1), k2d, dt / 2);
  let k3d = derive(k3);
  let k4 = apply(clone(k1), k3d, dt);
  let k4d = derive(k4);

  let dot = k1d;
  dot.rdot += 2 * k2d.rdot + 2 * k3d.rdot + k4d.rdot;
  dot.vdot += 2 * k2d.vdot + 2 * k3d.vdot + k4d.vdot;
  for (let i = 0; i < k1.nbuckets; i++)
    dot.bdot[i] += 2 * k2d.bdot[i] + 2 * k3d.bdot[i] + k4d.bdot[i];
  return apply(k1, dot, dt / 6);
}

// frame drawing
function draw(ctx, wheel) {
  let w = width;
  let h = height;
  let z = Math.min(w, h) / 2;
  ctx.clearRect(0, 0, width, height);

  // ctx.fillStyle = '#ffd';
  // ctx.fillRect(0, 0, w, h);

  let wscale = 0.7;
  ctx.beginPath();
  ctx.fillRect(w / 2 - 4, 0, 8, h / 2 - wscale * z - 8);
  ctx.fillStyle = "#479aed";
  ctx.arc(
    w / 2 - 4,
    (Math.random() * h) / 2 - wscale * z - 8,
    2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.arc(
    w / 2 - 4,
    (Math.random() * h) / 2 - wscale * z - 8,
    2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.arc(
    w / 2 + 4,
    (Math.random() * h) / 2 - wscale * z - 8,
    2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.arc(
    w / 2 + 4,
    (Math.random() * h) / 2 - wscale * z - 8,
    2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.arc(
    w / 2 - 4,
    (Math.random() * h) / 2 - wscale * z - 8,
    2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.arc(
    w / 2 + 4,
    (Math.random() * h) / 2 - wscale * z - 8,
    2,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#28e";

  ctx.strokeStyle = "#bac5d6";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, wscale * z, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#24D2F0";
  let bscale = (z * 3) / wheel.nbuckets;
  let bmax = 0.4;
  let wheelMass = 0.0;
  let wheelCx = 0.0;
  let wheelCy = 0.0;
  for (let i = 0; i < wheel.nbuckets; i++) {
    let v = Math.min(bmax, wheel.buckets[i]);
    let r = wheel.rotation + (i * 2 * Math.PI) / wheel.nbuckets;
    let x = +Math.sin(r) * z * wscale + w / 2;
    let y = -Math.cos(r) * z * wscale + h / 2;
    let x0 = x - bscale / 2;
    let y0 = y - bscale / 2;
    let fill = (v / bmax) * bscale;

    wheelMass += wheel.buckets[i];
    wheelCx += wheel.buckets[i] * x;
    wheelCy += wheel.buckets[i] * (y0 + bscale - fill / 2); // alt y = y0 + bscale - fill/2;
    // ctx.fillStyle = '#fff';
    // ctx.fillRect(x0, y0, bscale, bscale);
    ctx.fillStyle = "#28e";
    ctx.strokeStyle = "#24D2F0";
    ctx.fillRect(x0, y0 + bscale - fill, bscale, fill);
    ctx.strokeRect(x0, y0, bscale, bscale);

    // let strokeStyle = "#FFFFFF66";
    // ctx.strokeStyle = strokeStyle;
    // ctx.beginPath();
    // ctx.moveTo(x, y);
    // ctx.lineTo(w / 2, h / 2);
    // ctx.stroke();
  }
  wheel.centreOfMassHistory.push([wheelCx / wheelMass, wheelCy / wheelMass]);
  ctx.strokeStyle = "#FFD700";
  ctx.beginPath();
  ctx.moveTo(wheel.centreOfMassHistory[0][0], wheel.centreOfMassHistory[0][1]);
  for (const point of wheel.centreOfMassHistory) {
    ctx.lineTo(point[0], point[1]);
  }
  ctx.stroke();
}

// picking up size to fit before rendering components
function sizeCanvas() {
  let canvas = document.getElementById("chaos");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

window.onload = function () {
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  let dtMax = 30 / 1000;
  let ctx = document.getElementById("chaos").getContext("2d");
  let wheel = waterwheel(numBuckets);

  let last = 0;
  function animationLoop(t) {
    let dt = Math.min((t - last) / 1000 / 2, dtMax);
    last = t;
    wheel = rk4(wheel, dt);
    draw(ctx, wheel);
    window.requestAnimationFrame(animationLoop);
  }
  window.requestAnimationFrame(animationLoop);
};
