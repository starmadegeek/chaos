let width = 150;
let height = 150;
const numBalls = 14;
const ballRadius = 8;
const initGroupCircleRadius = 40;
const ConcavenessRadius = 6000;
const dt = 0.1;
const [init_vx, init_vy] = [6, -7];
let DRAW_TRAIL = true;

let ballsNormal = [];
let ballsConcave = [];

let ballColors = [];
for (let i = 0; i < numBalls; i++)
  ballColors[i] = "#" + Math.floor(Math.random() * 16777215).toString(16);

// Util function to calculate distance between two given balls
function distance(ball1, ball2) {
  return Math.sqrt(
    (ball1.x - ball2.x) * (ball1.x - ball2.x) +
      (ball1.y - ball2.y) * (ball1.y - ball2.y)
  );
}

function nCircumBalls([x0, y0], r, n, ballList) {
  for (var i = 0; i < n; i++) {
    var x = x0 + r * Math.cos((2 * Math.PI * i) / n);
    var y = y0 + r * Math.sin((2 * Math.PI * i) / n);
    ballList[ballList.length] = {
      x: x,
      y: y,
      vx: init_vx,
      vy: init_vy,
      r: ballRadius,
      color: ballColors[i],
      history: [],
    };
  }
}

function drawConcaveArc(p1, p3, center, ctx) {
  ctx.beginPath();
  var startAngle = Math.atan2(p1.y - center.y, p1.x - center.x),
    endAngle = Math.atan2(p3.y - center.y, p3.x - center.x);
  ctx.arc(
    center.x,
    center.y,
    ConcavenessRadius,
    startAngle,
    endAngle,
    (anticlockwise = true)
  );
  ctx.stroke();
}

function drawBall(ctx, ball) {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI);
  ctx.fillStyle = ball.color;
  ctx.fill();

  if (DRAW_TRAIL) {
    ctx.strokeStyle = ball.color;
    ctx.beginPath();
    ctx.moveTo(ball.history[0][0], ball.history[0][1]);
    for (const point of ball.history) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();
  }
}

function initBoudaries(ctx) {
  let strokeStyle = "#558cf466";
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  ctx.moveTo(box1[0][0], box1[0][1]);
  ctx.lineTo(box1[1][0], box1[1][1]);
  ctx.lineTo(box1[2][0], box1[2][1]);
  ctx.lineTo(box1[3][0], box1[3][1]);
  ctx.lineTo(box1[0][0], box1[0][1]);
  ctx.stroke();

  let centreOffset = Math.sqrt(
    ConcavenessRadius * ConcavenessRadius -
      Math.pow(Math.abs(box2[0][0] - box2[1][0]) / 2, 2)
  );
  drawConcaveArc(
    { x: box2[0][0], y: box2[0][1] },
    { x: box2[1][0], y: box2[1][1] },
    { x: (box2[0][0] + box2[1][0]) / 2, y: box2[0][1] - centreOffset },
    ctx
  );
  drawConcaveArc(
    { x: box2[1][0], y: box2[1][1] },
    { x: box2[2][0], y: box2[2][1] },
    { y: (box2[1][1] + box2[2][1]) / 2, x: box2[1][0] + centreOffset },
    ctx
  );
  drawConcaveArc(
    { x: box2[2][0], y: box2[2][1] },
    { x: box2[3][0], y: box2[3][1] },
    { x: (box2[2][0] + box2[3][0]) / 2, y: box2[2][1] + centreOffset },
    ctx
  );
  drawConcaveArc(
    { x: box2[3][0], y: box2[3][1] },
    { x: box2[0][0], y: box2[0][1] },
    { y: (box2[0][1] + box2[3][1]) / 2, x: box2[0][0] - centreOffset },
    ctx
  );
}

function initBalls() {
  // console.log(width * 0.7,height * 0.7);
  let [x0, y0] = [
    box1[0][0] + (initGroupCircleRadius + 15),
    box1[0][1] + (initGroupCircleRadius + 30),
  ];
  nCircumBalls([x0, y0], initGroupCircleRadius, numBalls, ballsNormal);

  [x0, y0] = [
    box2[0][0] + (initGroupCircleRadius + 15),
    box2[0][1] + (initGroupCircleRadius + 30),
  ];
  nCircumBalls([x0, y0], initGroupCircleRadius, numBalls, ballsConcave);
}

function moveNormal(ball) {
  if (ball.x + ball.r >= box1[2][0] || ball.x - ball.r <= box1[0][0]) {
    ball.vx = -1 * ball.vx;
  }

  if (ball.y + ball.r >= box1[2][1] || ball.y - ball.r <= box1[0][1]) {
    ball.vy = -1 * ball.vy;
  }

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
}

function moveConcave(ball) {
  let centreOffset = Math.sqrt(
    ConcavenessRadius * ConcavenessRadius -
      Math.pow(Math.abs(box2[0][0] - box2[1][0]) / 2, 2)
  );

  //upper boundary
  let [cx, cy] = [(box2[0][0] + box2[1][0]) / 2.0, box2[0][1] - centreOffset];
  let d = distance(ball, { x: cx, y: cy });
  if (d - ball.r <= ConcavenessRadius) {
    let nx = cx - ball.x;
    let ny = cy - ball.y;
    let dotproduct = ball.vx * (nx / d) + ball.vy * (ny / d);
    ball.vx += -2 * dotproduct * (nx / d);
    ball.vy += -2 * dotproduct * (ny / d);
  }

  //right boundary
  [cx, cy] = [box2[1][0] + centreOffset, (box2[1][1] + box2[2][1]) / 2];
  d = distance(ball, { x: cx, y: cy });
  if (d - ball.r <= ConcavenessRadius) {
    let nx = ball.x - cx;
    let ny = ball.y - cy;
    let dotproduct = ball.vx * (nx / d) + ball.vy * (ny / d);
    ball.vx += -2 * dotproduct * (nx / d);
    ball.vy += -2 * dotproduct * (ny / d);
  }

  // Bottom boundary
  [cx, cy] = [(box2[2][0] + box2[3][0]) / 2, box2[2][1] + centreOffset];
  d = distance(ball, { x: cx, y: cy });
  if (d - ball.r <= ConcavenessRadius) {
    let nx = ball.x - cx;
    let ny = ball.y - cy;
    let dotproduct = ball.vx * (nx / d) + ball.vy * (ny / d);
    ball.vx += -2 * dotproduct * (nx / d);
    ball.vy += -2 * dotproduct * (ny / d);
  }

  // Left boundary
  [cx, cy] = [box2[0][0] - centreOffset, (box2[0][1] + box2[3][1]) / 2];
  d = distance(ball, { x: cx, y: cy });
  if (d - ball.r <= ConcavenessRadius) {
    let nx = ball.x - cx;
    let ny = ball.y - cy;
    let dotproduct = ball.vx * (nx / d) + ball.vy * (ny / d);
    ball.vx += -2 * dotproduct * (nx / d);
    ball.vy += -2 * dotproduct * (ny / d);
  }

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
}

function animationLoop() {
  const ctx = document.getElementById("chaos").getContext("2d");
  ctx.clearRect(0, 0, width, height);
  initBoudaries(ctx);
  //Calculate Velocities and new positions
  for (let ball of ballsNormal) {
    // let ball = balls[0];
    // actGravity(ball);
    moveNormal(ball);
    ball.history.push([ball.x, ball.y]);
  }

  for (let ball of ballsConcave) {
    // let ball = balls[0];
    // actGravity(ball);
    moveConcave(ball);
    ball.history.push([ball.x, ball.y]);
  }

  for (let ball of ballsNormal) {
    drawBall(ctx, ball);
  }

  for (let ball of ballsConcave) {
    drawBall(ctx, ball);
  }

  window.requestAnimationFrame(animationLoop);
}

function sizeCanvas() {
  let canvas = document.getElementById("chaos");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  let [w, h] = [width, height];
  box1 = [
    [w * (2 / 20), h * 0.1],
    [w * (8 / 20), h * 0.1],
    [w * (8 / 20), h * 0.9],
    [w * (2 / 20), h * 0.9],
  ];
  box2 = [
    [w * (12 / 20), h * 0.1],
    [w * (18 / 20), h * 0.1],
    [w * (18 / 20), h * 0.9],
    [w * (12 / 20), h * 0.9],
  ];
}

window.onload = function () {
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  initBalls();
  // Randomly distribute the balls to start
  // initBalls();

  // Schedule the main animation loop
  window.requestAnimationFrame(animationLoop);
};
