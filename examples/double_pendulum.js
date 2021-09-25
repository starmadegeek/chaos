const G = 2; // gravitational acceleration
const M = 1.0; // mass
const L = 1.0; // length
const dtMax = 30.0; // ms
const tailMax = 400; // tail length

const barWidth = 0.04;
const barLength = 0.23;
const massRadius = 0.035;
const tailThickness = 0.012;

function deriviative(a1, a2, p1, p2) {
    let ml2 = M * L * L;
    let cos12 = Math.cos(a1 - a2);
    let sin12 = Math.sin(a1 - a2);
    let da1 = 6 / ml2 * (2 * p1 - 3 * cos12 * p2) / (16 - 9 * cos12 * cos12);
    let da2 = 6 / ml2 * (8 * p2 - 3 * cos12 * p1) / (16 - 9 * cos12 * cos12);
    let dp1 = ml2 / -2 * (+da1 * da2 * sin12 + 3 * G / L * Math.sin(a1));
    let dp2 = ml2 / -2 * (-da1 * da2 * sin12 + 3 * G / L * Math.sin(a2));
    return [da1, da2, dp1, dp2];
}

// Update pendulum by timestep
function rk4(k1a1, k1a2, k1p1, k1p2, dt) {
    let [k1da1, k1da2, k1dp1, k1dp2] = deriviative(k1a1, k1a2, k1p1, k1p2);

    let k2a1 = k1a1 + k1da1 * dt / 2;
    let k2a2 = k1a2 + k1da2 * dt / 2;
    let k2p1 = k1p1 + k1dp1 * dt / 2;
    let k2p2 = k1p2 + k1dp2 * dt / 2;

    let [k2da1, k2da2, k2dp1, k2dp2] = deriviative(k2a1, k2a2, k2p1, k2p2);

    let k3a1 = k1a1 + k2da1 * dt / 2;
    let k3a2 = k1a2 + k2da2 * dt / 2;
    let k3p1 = k1p1 + k2dp1 * dt / 2;
    let k3p2 = k1p2 + k2dp2 * dt / 2;

    let [k3da1, k3da2, k3dp1, k3dp2] = deriviative(k3a1, k3a2, k3p1, k3p2);

    let k4a1 = k1a1 + k3da1 * dt;
    let k4a2 = k1a2 + k3da2 * dt;
    let k4p1 = k1p1 + k3dp1 * dt;
    let k4p2 = k1p2 + k3dp2 * dt;

    let [k4da1, k4da2, k4dp1, k4dp2] = deriviative(k4a1, k4a2, k4p1, k4p2);

    return [
        k1a1 + (k1da1 + 2*k2da1 + 2*k3da1 + k4da1) * dt / 6,
        k1a2 + (k1da2 + 2*k2da2 + 2*k3da2 + k4da2) * dt / 6,
        k1p1 + (k1dp1 + 2*k2dp1 + 2*k3dp1 + k4dp1) * dt / 6,
        k1p2 + (k1dp2 + 2*k2dp2 + 2*k3dp2 + k4dp2) * dt / 6
    ];
}

function history(n) {
    let h = {
        i: 0,
        length: 0,
        v: new Float32Array(n * 2),
        push: function(a1, a2) {
            h.v[h.i * 2 + 0] = Math.sin(a1) + Math.sin(a2);
            h.v[h.i * 2 + 1] = Math.cos(a1) + Math.cos(a2);
            h.i = (h.i + 1) % n;
            if (h.length < n)
                h.length++;
        },
        visit: function(f) {
            for (let j = h.i + n - 2; j > h.i + n - h.length - 1; j--) {
                let a = (j + 1) % n;
                let b = (j + 0) % n;
                f(h.v[a * 2], h.v[a * 2 + 1], h.v[b * 2], h.v[b * 2 + 1]);
            }
        }
    };
    return h;
}

function normalize(v0, v1) {
    let d = Math.sqrt(v0 * v0 + v1 * v1);
    return [v0 / d, v1 / d];
}

function sub(a0, a1, b0, b1) {
    return [a0 - b0, a1 - b1];
}

function add(a0, a1, b0, b1) {
    return [a0 + b0, a1 + b1];
}

function dot(ax, ay, bx, by) {
    return ax * bx + ay * by;
}

// Create a new, random double pendulum
function pendulum({
    tailColor = [0, 0, 1],
    massColor = [50, 168, 82],
    init = null
} = {}) {
    let tail = new history(tailMax);
    let a1, a2, p1, p2;
    if (init) {
        [a1, a2, p1, p2] = init;
    } else {
        a1 = Math.random() * Math.PI / 2 + Math.PI * 3 / 4;
        a2 = Math.random() * Math.PI / 2 + Math.PI * 3 / 4;
        p1 = 0.0;
        p2 = 0.0;
    }

    return {
        tailColor: tailColor,
        massColor: massColor,
        tail: tail,
        state: function() {
            return [a1, a2, p1, p2];
        },
        positions: function() {
            let x1 = +Math.sin(a1);
            let y1 = -Math.cos(a1);
            let x2 = +Math.sin(a2) + x1;
            let y2 = -Math.cos(a2) + y1;
            return [x1, y1, x2, y2];
        },
        step: function(dt) {
            [a1, a2, p1, p2] = rk4(a1, a2, p1, p2, dt);
            tail.push(a1, a2);
        },
        draw2d: function(ctx) {
            draw2d(ctx, tail, a1, a2, massColor, tailColor);
        },
        /* Create a slightly imperfect clone */
        clone: function(conf) {
            if (!conf)
                conf = {};
            let cp2;
            if (p2 === 0.0)
                cp2 = Math.random() * 1e-6;
            else
                cp2 = p2 * (1 - Math.random() * 1e-14);
            conf.init = [a1, a2, p1, cp2];
            return new pendulum(conf);
        },
    };
}


function color2style(color) {
    let r = Math.round(255 * color[0]);
    let g = Math.round(255 * color[1]);
    let b = Math.round(255 * color[2]);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function clear2d(ctx) {
    // ctx.fillStyle = 'white';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function draw2d(ctx, tail, a1, a2, massColor, tailColor) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;
    let cx = w / 2;
    let cy = h / 2;
    let z = Math.min(w, h);
    let d = z * barLength;
    let x0 = Math.sin(a1) * d + cx;
    let y0 = Math.cos(a1) * d + cy;
    let x1 = Math.sin(a2) * d + x0;
    let y1 = Math.cos(a2) * d + y0;
    let massStyle = color2style(massColor);

    ctx.lineCap = 'butt';
    ctx.lineWidth = z * tailThickness / 2;
    ctx.strokeStyle = color2style(tailColor);
    let n = tail.length;
    tail.visit(function(x0, y0, x1, y1) {
        ctx.globalAlpha = n-- / tail.length;
        ctx.beginPath();
        ctx.moveTo(x0 * d + cx, y0 * d + cy);
        ctx.lineTo(x1 * d + cx, y1 * d + cy);
        ctx.stroke();
    });

    ctx.lineWidth = z * barWidth / 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'bevel';
    ctx.strokeStyle = massStyle;
    ctx.fillStyle = massStyle;
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x0, y0, z * massRadius / 2, 0, 2 * Math.PI);
    ctx.arc(x1, y1, z * massRadius / 2, 0, 2 * Math.PI);
    ctx.fill();
}

(function() {
    let state = [new pendulum()];
    let c2d = document.getElementById('c2d');
    let canvas;
    let running = true;
    let ctx = c2d.getContext('2d');
    mode = '2d-only';
    canvas = c2d;

    window.addEventListener('keypress', function(e) {
        switch (e.which) {
            case 32: // SPACE
                running = !running;
                break;
            case 97: // a
                let color = [Math.random(), Math.random(), Math.random()];
                state.push(new pendulum({tailColor: color}));
                break;
            case 99: // c
                if (state.length) {
                    let color = [Math.random(), Math.random(), Math.random()];
                    state.push(state[0].clone({tailColor: color}));
                }
                break;
            case 100: // d
                if (state.length)
                    state.pop();
                break;
        }
    });

    let last = 0.0;
    function cb(t) {
        let dt = Math.min(t - last, dtMax);
        let ww = window.innerWidth;
        let wh = window.innerHeight;
        if (canvas.width != ww || canvas.height != wh) {
            /* Only resize when necessary */
            canvas.width = ww;
            canvas.height = wh;
        }
        if (running)
            for (let i = 0; i < state.length; i++)
                state[i].step(dt / 1000.0);
            clear2d(ctx);
            for (let i = 0; i < state.length; i++)
                state[i].draw2d(ctx);
        
        last = t;
        ctx.font = "11px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "Left";
        ctx.fillText("Controls", 40, canvas.height - 40);
        ctx.font = "10px Arial";
        ctx.fillStyle = "#b8bfba";
        ctx.fillText("a: add a new random pendulum", 43, canvas.height - 30);
        ctx.fillText("c: imperfectly clone an existing pendulum", 43, canvas.height - 20);
        ctx.fillText("d: delete the most recently added pendulum", 43, canvas.height - 10);
        window.requestAnimationFrame(cb);
    }

    window.requestAnimationFrame(cb);
}());