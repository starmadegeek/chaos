let width = 150;
let height = 150;
const g = 9.81;
const GravitationalConstant = 1000;
const numBalls = 2;
const ballRadius = 10;
const dt = 0.1; 
let DRAW_TRAIL = true;

let balls = []

function initBalls(){
    // console.log(width * 0.7,height * 0.7);
    for (var i = 0; i < numBalls; i += 1) {
        balls[balls.length] = {
            x : width / 2 + randomBetween(-30, 30),
            y: height / 2 + randomBetween(-30, 30),
            vx : randomBetween(0, 100),
            vy : randomBetween(0, 100),
            mass : 10,
            ax : 0,
            ay : g,
            r: ballRadius,
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            history: [],
        };
        // console.log(balls[balls.length - 1]);
     }
} 

// Util function to calculate distance between two given balls
function distance(ball1, ball2) {
    return Math.sqrt(
      (ball1.x - ball2.x) * (ball1.x - ball2.x) +
        (ball1.y - ball2.y) * (ball1.y - ball2.y),
    );
  }


function randomBetween(min, max) {
    if (min < 0) {
        return Math.floor(min + Math.random() * (Math.abs(min)+max));
    }else {
        return Math.floor(min + Math.random() * max);
    }
}

function actGravity(ball){
    if(ball.x + ball.r >= width * 0.75 || ball.x - ball.r <= width * 0.25){
        ball.vx = -1 * ball.vx;
    }
    else{
        ball.vx += ball.ax * dt;
    }
    ball.x += ball.vx * dt;

    if(ball.y + ball.r >= height * 0.75 || ball.y - ball.r <= height * 0.25){
        ball.vy = -1 * ball.vy;
    }
    else {
        ball.vy += ball.ay * dt;
    }
    ball.y += ball.vy * dt;
}

function drawBall(ctx, ball){
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,10,0,2*Math.PI);
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

function animationLoop(){
    const ctx = document.getElementById("chaos").getContext("2d");
    ctx.clearRect(0, 0, width, height);
    initUniverse(ctx);
    for(let ball of balls) {
        // let ball = balls[0];
        actGravity(ball);
        ball.history.push([ball.x, ball.y]);
    }

    for(let ball of balls) drawBall(ctx, ball);

    window.requestAnimationFrame(animationLoop);
}

function initUniverse(ctx){
    let fillStyle = "#558cf4";
    let strokeStyle = "#558cf466";
    let [sx,sy] = [width/2 - width * 0.25, height/2  - height * 0.25];
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(sx,sy);
    ctx.lineTo(sx + width * 0.5, sy);
    ctx.lineTo(sx + width * 0.5, sy + height * 0.5);
    ctx.lineTo(sx , sy + height * 0.5);
    ctx.lineTo(sx , sy);
    ctx.stroke();
}

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
  
    initBalls();
    // Randomly distribute the balls to start
    // initBalls();
  
    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop);
  };
  