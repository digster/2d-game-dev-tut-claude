// ===================================
// DEMO BUNDLES FOR EXPORT FEATURE
// Stores demo-specific code and HTML configurations
// ===================================

const DEMO_CODE = {
    // ============ INTERMEDIATE DEMOS ============

    lerp: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const follower = new Vector2D(400, 200);
let target = new Vector2D(600, 200);
let lerpSpeed = 0.1;

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    target.x = e.clientX - rect.left;
    target.y = e.clientY - rect.top;
});

document.getElementById('btnSlow').addEventListener('click', () => lerpSpeed = 0.02);
document.getElementById('btnMedium').addEventListener('click', () => lerpSpeed = 0.1);
document.getElementById('btnFast').addEventListener('click', () => lerpSpeed = 0.3);
document.getElementById('btnReset').addEventListener('click', () => {
    follower.set(400, 200);
    target.set(600, 200);
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    follower.lerp(target, lerpSpeed);

    // Draw target
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 20, 0, Math.PI * 2);
    ctx.stroke();

    // Draw follower
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(follower.x, follower.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw line between them
    ctx.strokeStyle = '#ffa726';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(follower.x, follower.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const distance = follower.distance(target);
    info.textContent = 'Lerp speed: ' + lerpSpeed.toFixed(2) + ' | Distance: ' + distance.toFixed(1);

    requestAnimationFrame(animate);
}

animate();`,

    physics: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class Ball {
    constructor(x, y, radius = 15) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(randomFloat(-2, 2), randomFloat(-2, 2));
        this.acceleration = new Vector2D(0, 0);
        this.mass = radius;
        this.radius = radius;
    }

    applyForce(force) {
        const f = force.copy().divide(this.mass);
        this.acceleration.add(f);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.multiply(0.99);
        this.position.add(this.velocity);
        this.acceleration.multiply(0);

        if (this.position.x < this.radius || this.position.x > canvas.width - this.radius) {
            this.velocity.x *= -0.8;
            this.position.x = clamp(this.position.x, this.radius, canvas.width - this.radius);
        }
        if (this.position.y < this.radius || this.position.y > canvas.height - this.radius) {
            this.velocity.y *= -0.8;
            this.position.y = clamp(this.position.y, this.radius, canvas.height - this.radius);
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        const end = new Vector2D(
            this.position.x + this.velocity.x * 5,
            this.position.y + this.velocity.y * 5
        );
        drawVector(ctx, this.position, end, '#ffa726', 2);
    }
}

const balls = [];
let gravityEnabled = true;
let windEnabled = false;
const gravity = new Vector2D(0, 0.3);
const wind = new Vector2D(0.1, 0);

document.getElementById('btnAdd').addEventListener('click', () => {
    const x = randomFloat(50, canvas.width - 50);
    const y = randomFloat(50, 200);
    balls.push(new Ball(x, y, randomFloat(10, 20)));
});

document.getElementById('btnGravity').addEventListener('click', () => {
    gravityEnabled = !gravityEnabled;
});

document.getElementById('btnWind').addEventListener('click', () => {
    windEnabled = !windEnabled;
});

document.getElementById('btnReset').addEventListener('click', () => {
    balls.length = 0;
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickPos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);

    balls.forEach(ball => {
        const dist = ball.position.distance(clickPos);
        if (dist < 150) {
            const force = ball.position.subtract(clickPos).normalize().multiply(10);
            ball.applyForce(force);
        }
    });
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    balls.forEach(ball => {
        if (gravityEnabled) ball.applyForce(gravity);
        if (windEnabled) ball.applyForce(wind);
        ball.update();
        ball.draw(ctx);
    });

    info.textContent = 'Balls: ' + balls.length + ' | Gravity: ' + (gravityEnabled ? 'ON' : 'OFF') + ' | Wind: ' + (windEnabled ? 'ON' : 'OFF');

    requestAnimationFrame(animate);
}

for (let i = 0; i < 3; i++) {
    balls.push(new Ball(randomFloat(100, canvas.width - 100), 100, 15));
}

animate();`,

    spaceship: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class Spaceship {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
        this.angle = -Math.PI / 2;
        this.rotation = 0;
        this.mass = 1;
        this.thrustPower = 0.15;
        this.rotationSpeed = 0.08;
        this.thrusting = false;
        this.size = 15;
    }

    applyForce(force) {
        const f = force.copy().divide(this.mass);
        this.acceleration.add(f);
    }

    thrust() {
        const thrustForce = new Vector2D(
            Math.cos(this.angle) * this.thrustPower,
            Math.sin(this.angle) * this.thrustPower
        );
        this.applyForce(thrustForce);
        this.thrusting = true;
    }

    rotateLeft() { this.rotation = -this.rotationSpeed; }
    rotateRight() { this.rotation = this.rotationSpeed; }

    update() {
        this.angle += this.rotation;
        this.rotation *= 0.85;
        this.velocity.add(this.acceleration);
        const speed = this.velocity.length();
        if (speed > 10) this.velocity.normalize().multiply(10);
        this.position.add(this.velocity);
        this.acceleration.multiply(0);

        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.x > canvas.width) this.position.x = 0;
        if (this.position.y < 0) this.position.y = canvas.height;
        if (this.position.y > canvas.height) this.position.y = 0;
        this.thrusting = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#4fc3f7';
        ctx.strokeStyle = '#81d4fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size, -this.size * 0.7);
        ctx.lineTo(-this.size * 0.5, 0);
        ctx.lineTo(-this.size, this.size * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (this.thrusting) {
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.moveTo(-this.size * 0.5, -this.size * 0.4);
            ctx.lineTo(-this.size * 1.5, 0);
            ctx.lineTo(-this.size * 0.5, this.size * 0.4);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        const velEnd = new Vector2D(this.position.x + this.velocity.x * 10, this.position.y + this.velocity.y * 10);
        if (this.velocity.length() > 0.5) drawVector(ctx, this.position, velEnd, '#66bb6a', 2);
    }
}

class GravityWell {
    constructor(x, y, mass = 100) {
        this.position = new Vector2D(x, y);
        this.mass = mass;
        this.radius = Math.sqrt(mass) * 2;
    }

    attract(entity) {
        const force = this.position.copy().subtract(entity.position);
        const distance = clamp(force.length(), 10, 250);
        const strength = (1 * this.mass * entity.mass) / (distance * distance);
        force.normalize().multiply(strength);
        entity.applyForce(force);
    }

    draw(ctx) {
        ctx.fillStyle = '#9c27b0';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(156, 39, 176, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius + i * 30, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

let spaceship = new Spaceship(400, 300);
const gravityWells = [new GravityWell(400, 450, 150)];

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

document.getElementById('btnThrust').addEventListener('mousedown', () => { keys['w'] = true; });
document.getElementById('btnThrust').addEventListener('mouseup', () => { keys['w'] = false; });
document.getElementById('btnLeft').addEventListener('mousedown', () => { keys['a'] = true; });
document.getElementById('btnLeft').addEventListener('mouseup', () => { keys['a'] = false; });
document.getElementById('btnRight').addEventListener('mousedown', () => { keys['d'] = true; });
document.getElementById('btnRight').addEventListener('mouseup', () => { keys['d'] = false; });

document.getElementById('btnAddWell').addEventListener('click', () => {
    gravityWells.push(new GravityWell(randomFloat(100, canvas.width - 100), randomFloat(100, canvas.height - 100), randomFloat(80, 150)));
});

document.getElementById('btnReset').addEventListener('click', () => {
    spaceship = new Spaceship(400, 300);
    gravityWells.length = 0;
    gravityWells.push(new GravityWell(400, 450, 150));
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    gravityWells.push(new GravityWell(e.clientX - rect.left, e.clientY - rect.top, 120));
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 137.5) % canvas.width;
        const y = (i * 217.3) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }

    if (keys['w'] || keys['arrowup']) spaceship.thrust();
    if (keys['a'] || keys['arrowleft']) spaceship.rotateLeft();
    if (keys['d'] || keys['arrowright']) spaceship.rotateRight();

    gravityWells.forEach(well => {
        well.attract(spaceship);
        well.draw(ctx);
    });

    spaceship.update();
    spaceship.draw(ctx);

    info.textContent = 'Speed: ' + spaceship.velocity.length().toFixed(2) + ' | Wells: ' + gravityWells.length + ' | W=Thrust, A/D=Rotate';

    requestAnimationFrame(animate);
}

animate();`,

    spring: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const anchorPos = new Vector2D(150, 400);

class Projectile {
    constructor(x, y, vx, vy) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(vx, vy);
        this.radius = 12;
        this.trail = [];
        this.maxTrailLength = 40;
        this.alive = true;
    }

    update() {
        this.velocity.y += 0.3;
        this.position.add(this.velocity);
        this.trail.push(this.position.copy());
        if (this.trail.length > this.maxTrailLength) this.trail.shift();

        if (this.position.x > canvas.width + 50 || this.position.y > canvas.height + 50) {
            this.alive = false;
        }

        if (this.position.y > canvas.height - this.radius) {
            this.position.y = canvas.height - this.radius;
            this.velocity.y *= -0.6;
            this.velocity.x *= 0.9;
        }
        if (this.position.x > canvas.width - this.radius) {
            this.position.x = canvas.width - this.radius;
            this.velocity.x *= -0.6;
        }
    }

    draw(ctx) {
        if (this.trail.length > 1) {
            ctx.strokeStyle = '#ffa726';
            ctx.lineWidth = 2;
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = i / this.trail.length;
                ctx.globalAlpha = alpha * 0.5;
                ctx.beginPath();
                ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

const targets = [
    { x: 500, y: canvas.height - 80, width: 60, height: 80, hit: false, color: '#66bb6a' },
    { x: 650, y: canvas.height - 120, width: 60, height: 120, hit: false, color: '#ffa726' },
    { x: 720, y: canvas.height - 60, width: 50, height: 60, hit: false, color: '#ef5350' }
];

let projectiles = [];
let isDragging = false;
let dragPos = anchorPos.copy();
let stiffness = 0.15;
let score = 0;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mousePos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);
    if (mousePos.distance(anchorPos) < 100) isDragging = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        dragPos.x = e.clientX - rect.left;
        dragPos.y = e.clientY - rect.top;
        const displacement = dragPos.subtract(anchorPos);
        const maxDistance = 150;
        if (displacement.length() > maxDistance) {
            dragPos = anchorPos.copy().add(displacement.normalize().multiply(maxDistance));
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        const displacement = anchorPos.subtract(dragPos);
        const launchForce = displacement.multiply(stiffness);
        projectiles.push(new Projectile(dragPos.x, dragPos.y, launchForce.x, launchForce.y));
        isDragging = false;
        dragPos = anchorPos.copy();
    }
});

document.getElementById('btnTight').addEventListener('click', () => { stiffness = 0.2; targets.forEach(t => t.hit = false); projectiles = []; score = 0; });
document.getElementById('btnLoose').addEventListener('click', () => { stiffness = 0.08; targets.forEach(t => t.hit = false); projectiles = []; score = 0; });
document.getElementById('btnBouncy').addEventListener('click', () => { stiffness = 0.15; targets.forEach(t => t.hit = false); projectiles = []; score = 0; });
document.getElementById('btnReset').addEventListener('click', () => { targets.forEach(t => t.hit = false); projectiles = []; score = 0; });

function drawSpringBand(ctx, start, end) {
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const mid = new Vector2D((start.x + end.x) / 2, (start.y + end.y) / 2);
    const displacement = end.subtract(start);
    const perpendicular = new Vector2D(-displacement.y, displacement.x).normalize().multiply(20);
    const control = mid.add(perpendicular);
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
    ctx.stroke();
}

function checkTargetCollisions() {
    projectiles.forEach(proj => {
        targets.forEach(target => {
            if (!target.hit && proj.position.x > target.x && proj.position.x < target.x + target.width &&
                proj.position.y > target.y && proj.position.y < target.y + target.height) {
                target.hit = true;
                score += 10;
            }
        });
    });
}

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    ctx.fillStyle = '#424242';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    targets.forEach(target => {
        ctx.fillStyle = target.hit ? '#424242' : target.color;
        ctx.fillRect(target.x, target.y, target.width, target.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(target.x, target.y, target.width, target.height);
        if (!target.hit) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(target.x + target.width / 2, target.y + target.height / 2, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.arc(anchorPos.x, anchorPos.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (isDragging) {
        const bandOffset = 15;
        drawSpringBand(ctx, anchorPos.copy().add(new Vector2D(-bandOffset, 0)), dragPos);
        drawSpringBand(ctx, anchorPos.copy().add(new Vector2D(bandOffset, 0)), dragPos);

        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(dragPos.x, dragPos.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        const displacement = anchorPos.subtract(dragPos);
        const springForce = displacement.multiply(stiffness);
        const forceScale = 5;
        ctx.strokeStyle = '#ffa726';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(dragPos.x, dragPos.y);
        ctx.lineTo(dragPos.x + springForce.x * forceScale, dragPos.y + springForce.y * forceScale);
        ctx.stroke();
    }

    projectiles = projectiles.filter(proj => proj.alive);
    projectiles.forEach(proj => { proj.update(); proj.draw(ctx); });
    checkTargetCollisions();

    const displacement = anchorPos.subtract(dragPos);
    const springForceCalc = displacement.multiply(stiffness);
    info.textContent = 'Stiffness: ' + stiffness.toFixed(2) + ' | Score: ' + score + (isDragging ? ' | Force: ' + springForceCalc.length().toFixed(1) : ' | Drag launcher to fire!');

    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Drag the launcher to aim and release to fire!', canvas.width / 2, 30);

    requestAnimationFrame(animate);
}

animate();`,

    verlet: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class VerletPoint {
    constructor(x, y, pinned = false) {
        this.position = new Vector2D(x, y);
        this.oldPosition = new Vector2D(x, y);
        this.acceleration = new Vector2D(0, 0);
        this.pinned = pinned;
        this.radius = 5;
    }

    update(dt = 1) {
        if (this.pinned) return;
        const velocity = this.position.copy().subtract(this.oldPosition);
        const temp = this.position.copy();
        this.position.add(velocity);
        this.position.add(this.acceleration.copy().multiply(dt * dt));
        this.oldPosition = temp;
        this.acceleration.multiply(0);
    }

    applyForce(force) { this.acceleration.add(force); }

    constrain(bounds) {
        if (this.position.x < 0) { this.position.x = 0; this.oldPosition.x = this.position.x; }
        if (this.position.x > bounds.width) { this.position.x = bounds.width; this.oldPosition.x = this.position.x; }
        if (this.position.y < 0) { this.position.y = 0; this.oldPosition.y = this.position.y; }
        if (this.position.y > bounds.height) { this.position.y = bounds.height; this.oldPosition.y = this.position.y; }
    }

    draw(ctx) {
        ctx.fillStyle = this.pinned ? '#ff5252' : '#42a5f5';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Constraint {
    constructor(p1, p2, length = null) {
        this.p1 = p1; this.p2 = p2;
        this.length = length || p1.position.distance(p2.position);
        this.active = true;
    }

    solve() {
        if (!this.active) return;
        const diff = this.p2.position.copy().subtract(this.p1.position);
        const currentDistance = diff.length();
        if (currentDistance === 0) return;
        const correction = (currentDistance - this.length) / currentDistance;
        const correctionVector = diff.copy().multiply(correction * 0.5);
        if (!this.p1.pinned) this.p1.position.add(correctionVector);
        if (!this.p2.pinned) this.p2.position.add(correctionVector.copy().multiply(-1));
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.p1.position.x, this.p1.position.y);
        ctx.lineTo(this.p2.position.x, this.p2.position.y);
        ctx.stroke();
    }
}

class Rope {
    constructor(startX, startY, segments = 10, segmentLength = 20, pinFirst = true) {
        this.points = [];
        this.constraints = [];
        for (let i = 0; i <= segments; i++) {
            const pinned = (i === 0 && pinFirst);
            this.points.push(new VerletPoint(startX, startY + i * segmentLength, pinned));
        }
        for (let i = 0; i < segments; i++) {
            this.constraints.push(new Constraint(this.points[i], this.points[i + 1], segmentLength));
        }
    }

    update(gravity, wind = new Vector2D(0, 0)) {
        this.points.forEach(point => { point.applyForce(gravity); point.applyForce(wind); });
        this.points.forEach(point => { point.update(); point.constrain({ width: canvas.width, height: canvas.height }); });
        for (let i = 0; i < 3; i++) this.constraints.forEach(c => c.solve());
    }

    draw(ctx) {
        this.constraints.forEach(c => c.draw(ctx));
        this.points.forEach(p => p.draw(ctx));
    }
}

let ropes = [new Rope(400, 50, 15, 20)];
const gravity = new Vector2D(0, 0.5);
let wind = new Vector2D(0, 0);
let windEnabled = false;
let cutMode = false;
let draggedPoint = null;
let mousePos = new Vector2D(0, 0);

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
    if (draggedPoint) {
        draggedPoint.position.x = mousePos.x;
        draggedPoint.position.y = mousePos.y;
        draggedPoint.oldPosition.x = mousePos.x;
        draggedPoint.oldPosition.y = mousePos.y;
    }
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;

    if (cutMode) {
        ropes.forEach(rope => {
            rope.constraints.forEach(c => {
                const midPoint = new Vector2D((c.p1.position.x + c.p2.position.x) / 2, (c.p1.position.y + c.p2.position.y) / 2);
                if (mousePos.distance(midPoint) < 10) c.active = false;
            });
        });
    } else {
        ropes.forEach(rope => {
            rope.points.forEach(point => {
                if (mousePos.distance(point.position) < 20 && !point.pinned) draggedPoint = point;
            });
        });
    }
});

canvas.addEventListener('mouseup', () => { draggedPoint = null; });

document.getElementById('btnAddRope').addEventListener('click', () => { ropes.push(new Rope(randomFloat(100, canvas.width - 100), 50, 12, 25)); });
document.getElementById('btnWind').addEventListener('click', () => { windEnabled = !windEnabled; wind = windEnabled ? new Vector2D(0.3, 0) : new Vector2D(0, 0); });
document.getElementById('btnCut').addEventListener('click', () => { cutMode = !cutMode; });
document.getElementById('btnReset').addEventListener('click', () => { ropes = [new Rope(400, 50, 15, 20)]; windEnabled = false; wind = new Vector2D(0, 0); cutMode = false; });

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    ropes.forEach(rope => { rope.update(gravity, wind); rope.draw(ctx); });

    if (cutMode) {
        ctx.strokeStyle = '#ff5252';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 15, 0, Math.PI * 2);
        ctx.stroke();
    }

    info.textContent = 'Ropes: ' + ropes.length + ' | Wind: ' + (windEnabled ? 'ON' : 'OFF') + ' | Cut Mode: ' + (cutMode ? 'ON' : 'OFF');

    requestAnimationFrame(animate);
}

animate();`,

    procedural: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class Butterfly {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.time = Math.random() * Math.PI * 2;
        this.speed = randomFloat(0.8, 1.5);
        this.size = randomFloat(20, 30);
        this.color = 'hsl(' + (Math.random() * 60 + 280) + ', 70%, 65%)';
        this.wingPhase = 0;
    }

    update(dt) {
        this.time += dt * this.speed;
        this.wingPhase += dt * 12;
        this.position.x += Math.sin(this.time * 0.8) * 0.5;
        this.position.y += Math.sin(this.time * 1.6) * 0.3;

        if (this.position.x > canvas.width + 50) this.position.x = -50;
        if (this.position.x < -50) this.position.x = canvas.width + 50;
        if (this.position.y > canvas.height + 50) this.position.y = -50;
        if (this.position.y < -50) this.position.y = canvas.height + 50;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        const angle = Math.atan2(Math.sin(this.time * 1.6), Math.sin(this.time * 0.8));
        ctx.rotate(angle);
        const wingAngle = Math.sin(this.wingPhase) * 0.5;

        ctx.save();
        ctx.rotate(-wingAngle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.rotate(wingAngle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.size * 0.3, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#212121';
        ctx.fillRect(-this.size * 0.15, -this.size * 0.6, this.size * 0.3, this.size * 1.2);
        ctx.restore();
    }
}

class Fish {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.time = Math.random() * Math.PI * 2;
        this.size = randomFloat(25, 40);
        this.color = 'hsl(' + (Math.random() * 60 + 180) + ', 70%, 60%)';
        this.tailPhase = 0;
        this.targetAngle = 0;
        this.currentAngle = 0;
        this.changeDirectionTimer = randomFloat(2, 4);
    }

    update(dt) {
        this.time += dt;
        this.tailPhase += dt * 8;
        this.changeDirectionTimer -= dt;
        if (this.changeDirectionTimer <= 0) {
            this.targetAngle = Math.random() * Math.PI * 2;
            this.changeDirectionTimer = randomFloat(2, 4);
        }

        let angleDiff = this.targetAngle - this.currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.currentAngle += angleDiff * dt * 2;

        const speed = 50;
        this.position.x += Math.cos(this.currentAngle) * speed * dt;
        this.position.y += Math.sin(this.currentAngle) * speed * dt;

        if (this.position.x > canvas.width + 50) this.position.x = -50;
        if (this.position.x < -50) this.position.x = canvas.width + 50;
        if (this.position.y > canvas.height + 50) this.position.y = -50;
        if (this.position.y < -50) this.position.y = canvas.height + 50;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.currentAngle);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const tailWag = Math.sin(this.tailPhase) * 0.4;
        ctx.save();
        ctx.translate(-this.size, 0);
        ctx.rotate(tailWag);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.size * 0.5, -this.size * 0.4);
        ctx.lineTo(-this.size * 0.5, this.size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.size * 0.4, -this.size * 0.15, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(this.size * 0.45, -this.size * 0.15, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let creatures = [];
let lastTime = performance.now();

document.getElementById('btnButterfly').addEventListener('click', () => {
    creatures.push(new Butterfly(randomFloat(100, canvas.width - 100), randomFloat(100, canvas.height - 100)));
});
document.getElementById('btnFish').addEventListener('click', () => {
    creatures.push(new Fish(randomFloat(100, canvas.width - 100), randomFloat(100, canvas.height - 100)));
});
document.getElementById('btnClear').addEventListener('click', () => { creatures = []; });

for (let i = 0; i < 2; i++) creatures.push(new Butterfly(randomFloat(100, 700), randomFloat(100, 400)));
creatures.push(new Fish(randomFloat(100, 700), randomFloat(100, 400)));

function animate(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    clearCanvas(ctx, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    creatures.forEach(c => { c.update(dt); c.draw(ctx); });

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Watch the procedural animation magic!', canvas.width / 2, 30);

    info.textContent = 'Creatures: ' + creatures.length;
    requestAnimationFrame(animate);
}

animate(performance.now());`,

    wave: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let mode = 'physical';
let lastTime = performance.now();

const POINTS = 100;
let wave1D = {
    points: POINTS,
    y: new Array(POINTS).fill(0),
    velocity: new Array(POINTS).fill(0),
    damping: 0.99,
    tension: 0.025
};

let standingWave = { amplitude: 40, frequency: 0.05, time: 0 };
let travelingWave = { amplitude: 30, wavelength: 100, speed: 3, time: 0 };
let waveField = { sources: [], time: 0 };
waveField.sources.push({ x: 300, y: 250, amplitude: 20, frequency: 0.08, phase: 0 });
waveField.sources.push({ x: 500, y: 250, amplitude: 20, frequency: 0.08, phase: Math.PI });

function updatePhysicalWave() {
    const newVelocity = [...wave1D.velocity];
    for (let i = 1; i < wave1D.points - 1; i++) {
        const force = (wave1D.y[i - 1] + wave1D.y[i + 1]) / 2 - wave1D.y[i];
        newVelocity[i] += force * wave1D.tension;
    }
    wave1D.velocity = newVelocity;
    for (let i = 0; i < wave1D.points; i++) {
        wave1D.y[i] += wave1D.velocity[i];
        wave1D.velocity[i] *= wave1D.damping;
    }
    wave1D.y[0] = 0;
    wave1D.y[wave1D.points - 1] = 0;
}

function disturbWave(index, force) {
    if (index >= 0 && index < wave1D.points) {
        wave1D.velocity[index] += force;
        if (index > 0) wave1D.velocity[index - 1] += force * 0.5;
        if (index < wave1D.points - 1) wave1D.velocity[index + 1] += force * 0.5;
    }
}

function drawWave1D(ctx, yData, offsetY, color = '#4fc3f7') {
    const width = canvas.width - 40;
    const spacing = width / (yData.length - 1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < yData.length; i++) {
        const x = 20 + i * spacing;
        const y = offsetY + yData[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, offsetY);
    ctx.lineTo(20 + width, offsetY);
    ctx.stroke();
    ctx.setLineDash([]);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (mode === 'physical') {
        const width = canvas.width - 40;
        const clickX = x - 20;
        const index = Math.floor((clickX / width) * (POINTS - 1));
        disturbWave(index, 20);
    } else if (mode === 'interference') {
        waveField.sources.push({ x, y, amplitude: 20, frequency: 0.08, phase: 0 });
    }
});

document.getElementById('btnPhysical').addEventListener('click', () => { mode = 'physical'; wave1D.y = new Array(POINTS).fill(0); wave1D.velocity = new Array(POINTS).fill(0); });
document.getElementById('btnStanding').addEventListener('click', () => { mode = 'standing'; });
document.getElementById('btnTraveling').addEventListener('click', () => { mode = 'traveling'; });
document.getElementById('btnInterference').addEventListener('click', () => {
    mode = 'interference';
    waveField.sources = [];
    waveField.sources.push({ x: 300, y: 250, amplitude: 20, frequency: 0.08, phase: 0 });
    waveField.sources.push({ x: 500, y: 250, amplitude: 20, frequency: 0.08, phase: Math.PI });
});
document.getElementById('btnReset').addEventListener('click', () => {
    wave1D.y = new Array(POINTS).fill(0);
    wave1D.velocity = new Array(POINTS).fill(0);
    standingWave.time = 0;
    travelingWave.time = 0;
    waveField.sources = [];
    waveField.sources.push({ x: 300, y: 250, amplitude: 20, frequency: 0.08, phase: 0 });
    waveField.sources.push({ x: 500, y: 250, amplitude: 20, frequency: 0.08, phase: Math.PI });
});

function animate(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    clearCanvas(ctx, canvas.width, canvas.height);

    if (mode === 'physical') {
        updatePhysicalWave();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Physical Wave - Click to create ripples!', canvas.width / 2, 30);
        drawWave1D(ctx, wave1D.y, canvas.height / 2);
    } else if (mode === 'standing') {
        standingWave.time += dt;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Standing Wave', canvas.width / 2, 30);
        const yData = [];
        for (let i = 0; i < POINTS; i++) {
            const x = (i / (POINTS - 1)) * Math.PI * 4;
            yData.push(standingWave.amplitude * Math.sin(x) * Math.cos(standingWave.time * 3));
        }
        drawWave1D(ctx, yData, canvas.height / 2, '#66bb6a');
    } else if (mode === 'traveling') {
        travelingWave.time += dt;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Traveling Wave', canvas.width / 2, 30);
        const yData = [];
        const frequency = (2 * Math.PI) / travelingWave.wavelength;
        for (let i = 0; i < POINTS; i++) {
            const x = (i / (POINTS - 1)) * (canvas.width - 40);
            yData.push(travelingWave.amplitude * Math.sin(x * frequency - travelingWave.time * travelingWave.speed));
        }
        drawWave1D(ctx, yData, canvas.height / 2, '#ab47bc');
    } else if (mode === 'interference') {
        waveField.sources.forEach(s => { s.phase += dt * 2; });
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Wave Interference - Click to add sources!', canvas.width / 2, 30);

        waveField.sources.forEach((source, index) => {
            for (let r = 0; r < 5; r++) {
                const radius = (source.phase + r * Math.PI / 2) / source.frequency;
                const alpha = Math.sin(source.phase + r * Math.PI / 2) * 0.3;
                if (alpha > 0) {
                    ctx.strokeStyle = 'rgba(79, 195, 247, ' + alpha + ')';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(source.x, source.y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            ctx.fillStyle = '#ffa726';
            ctx.beginPath();
            ctx.arc(source.x, source.y, 8, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    info.textContent = 'Mode: ' + mode;
    requestAnimationFrame(animate);
}

animate(performance.now());`,

    friction: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let objects = [];
let friction = 0.92;

class FrictionObject {
    constructor(x, y, vx, vy) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(vx, vy);
        this.radius = 15;
        this.color = '#4fc3f7';
    }

    update() {
        this.velocity.multiply(friction);
        if (this.velocity.length() < 0.1) this.velocity.multiply(0);
        this.position.add(this.velocity);

        if (this.position.x - this.radius < 0 || this.position.x + this.radius > canvas.width) {
            this.velocity.x *= -0.8;
            this.position.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.position.x));
        }
        if (this.position.y - this.radius < 0 || this.position.y + this.radius > canvas.height) {
            this.velocity.y *= -0.8;
            this.position.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.position.y));
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.velocity.length() > 0.5) {
            ctx.strokeStyle = '#66bb6a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + this.velocity.x * 3, this.position.y + this.velocity.y * 3);
            ctx.stroke();
        }
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const angle = Math.random() * Math.PI * 2;
    objects.push(new FrictionObject(x, y, Math.cos(angle) * 10, Math.sin(angle) * 10));
});

document.getElementById('btnNone').addEventListener('click', () => friction = 1.0);
document.getElementById('btnLow').addEventListener('click', () => friction = 0.99);
document.getElementById('btnMedium').addEventListener('click', () => friction = 0.92);
document.getElementById('btnHigh').addEventListener('click', () => friction = 0.80);

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    const surfaceNames = { 1.0: 'Space (No Friction)', 0.99: 'Ice', 0.92: 'Grass', 0.80: 'Mud' };
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(surfaceNames[friction] || 'Custom', canvas.width / 2, 30);

    objects.forEach(obj => { obj.update(); obj.draw(ctx); });
    objects = objects.filter(obj => obj.velocity.length() > 0.01 || Date.now() % 5000 < 100);

    info.textContent = 'Friction: ' + friction.toFixed(2) + ' | Objects: ' + objects.length + ' | Click to add!';
    requestAnimationFrame(animate);
}

animate();`,

    collision: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class CollidableCircle {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.radius = 30;
        this.colliding = false;
    }

    checkCollision(other) {
        if (other instanceof CollidableCircle) {
            return this.position.distance(other.position) < this.radius + other.radius;
        } else if (other instanceof CollidableRect) {
            const closestX = clamp(this.position.x, other.position.x, other.position.x + other.width);
            const closestY = clamp(this.position.y, other.position.y, other.position.y + other.height);
            const distX = this.position.x - closestX;
            const distY = this.position.y - closestY;
            return (distX * distX + distY * distY) < (this.radius * this.radius);
        }
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = this.colliding ? '#ef5350' : '#4fc3f7';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class CollidableRect {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.width = 60;
        this.height = 40;
        this.colliding = false;
    }

    checkCollision(other) {
        if (other instanceof CollidableRect) {
            return this.position.x < other.position.x + other.width &&
                   this.position.x + this.width > other.position.x &&
                   this.position.y < other.position.y + other.height &&
                   this.position.y + this.height > other.position.y;
        } else if (other instanceof CollidableCircle) {
            return other.checkCollision(this);
        }
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = this.colliding ? '#ef5350' : '#66bb6a';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

const objects = [];
let dragging = null;

document.getElementById('btnCircle').addEventListener('click', () => {
    objects.push(new CollidableCircle(randomFloat(50, canvas.width - 50), randomFloat(50, canvas.height - 50)));
});
document.getElementById('btnRect').addEventListener('click', () => {
    objects.push(new CollidableRect(randomFloat(50, canvas.width - 100), randomFloat(50, canvas.height - 100)));
});
document.getElementById('btnClear').addEventListener('click', () => { objects.length = 0; });

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mousePos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);
    for (let obj of objects) {
        if (obj instanceof CollidableCircle && obj.position.distance(mousePos) < obj.radius) {
            dragging = obj; break;
        } else if (obj instanceof CollidableRect &&
            mousePos.x >= obj.position.x && mousePos.x <= obj.position.x + obj.width &&
            mousePos.y >= obj.position.y && mousePos.y <= obj.position.y + obj.height) {
            dragging = obj; break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        dragging.position.x = e.clientX - rect.left;
        dragging.position.y = e.clientY - rect.top;
    }
});

canvas.addEventListener('mouseup', () => { dragging = null; });

objects.push(new CollidableCircle(200, 250));
objects.push(new CollidableCircle(400, 250));
objects.push(new CollidableRect(300, 200));

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    objects.forEach(obj => obj.colliding = false);

    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            if (objects[i].checkCollision(objects[j])) {
                objects[i].colliding = true;
                objects[j].colliding = true;
            }
        }
    }

    objects.forEach(obj => obj.draw(ctx));
    info.textContent = 'Objects: ' + objects.length + ' | Colliding: ' + objects.filter(o => o.colliding).length + ' | Drag to move!';
    requestAnimationFrame(animate);
}

animate();`,

    reflection: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let balls = [];
let bounciness = 0.8;
let mode = 'normal';

class BouncingBall {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 3;
        this.velocity = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.radius = 10 + Math.random() * 10;
        this.mass = this.radius / 10;
        this.color = 'hsl(' + Math.random() * 360 + ', 70%, 60%)';
    }

    update() {
        this.velocity.y += 0.3;
        this.position.add(this.velocity);

        if (this.position.x + this.radius > canvas.width) { this.position.x = canvas.width - this.radius; this.velocity.x *= -bounciness; }
        if (this.position.x - this.radius < 0) { this.position.x = this.radius; this.velocity.x *= -bounciness; }
        if (this.position.y + this.radius > canvas.height) { this.position.y = canvas.height - this.radius; this.velocity.y *= -bounciness; }
        if (this.position.y - this.radius < 0) { this.position.y = this.radius; this.velocity.y *= -bounciness; }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    collidesWith(other) {
        return this.position.distance(other.position) < this.radius + other.radius;
    }

    bounceOff(other) {
        const normal = this.position.subtract(other.position).normalize();
        const relativeVel = this.velocity.subtract(other.velocity);
        const speed = relativeVel.dot(normal);
        if (speed > 0) return;

        const impulse = (2 * speed) / (this.mass + other.mass);
        this.velocity.subtract(normal.copy().multiply(impulse * other.mass * bounciness));
        other.velocity.add(normal.copy().multiply(impulse * this.mass * bounciness));

        const overlap = (this.radius + other.radius) - this.position.distance(other.position);
        if (overlap > 0) {
            const separation = normal.copy().multiply(overlap / 2);
            this.position.add(separation);
            other.position.subtract(separation);
        }
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    balls.push(new BouncingBall(e.clientX - rect.left, e.clientY - rect.top));
});

document.getElementById('btnPerfect').addEventListener('click', () => { bounciness = 1.0; mode = 'normal'; });
document.getElementById('btnNormal').addEventListener('click', () => { bounciness = 0.8; mode = 'normal'; });
document.getElementById('btnDead').addEventListener('click', () => { bounciness = 0.3; mode = 'normal'; });
document.getElementById('btnCollide').addEventListener('click', () => { bounciness = 0.9; mode = 'circle'; });

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    balls.forEach(ball => ball.update());

    if (mode === 'circle') {
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                if (balls[i].collidesWith(balls[j])) balls[i].bounceOff(balls[j]);
            }
        }
    }

    balls.forEach(ball => ball.draw(ctx));
    info.textContent = 'Bounciness: ' + bounciness.toFixed(1) + ' | Balls: ' + balls.length + ' | Click to add!';
    requestAnimationFrame(animate);
}

animate();`,

    particles: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class Particle {
    constructor(x, y, mode = 'explosion') {
        this.position = new Vector2D(x, y);
        if (mode === 'explosion') {
            this.velocity = Vector2D.random(randomFloat(2, 8));
        } else if (mode === 'fountain') {
            const angle = randomFloat(-Math.PI/3, -2*Math.PI/3);
            this.velocity = Vector2D.fromAngle(angle, randomFloat(5, 10));
        } else {
            this.velocity = Vector2D.random(randomFloat(1, 3));
        }
        this.life = 1.0;
        this.decay = randomFloat(0.01, 0.03);
        this.size = randomFloat(3, 8);
        this.gravity = new Vector2D(0, 0.2);
    }

    update() {
        this.velocity.add(this.gravity);
        this.velocity.multiply(0.98);
        this.position.add(this.velocity);
        this.life -= this.decay;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        const hue = Math.floor(this.life * 60);
        ctx.fillStyle = 'hsl(' + hue + ', 100%, 60%)';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

const MAX_PARTICLES = 500;
const particles = [];
let currentMode = 'explosion';
let trailMode = false;

function emit(x, y, count = 30) {
    const available = MAX_PARTICLES - particles.length;
    const toEmit = Math.min(count, available);
    for (let i = 0; i < toEmit; i++) particles.push(new Particle(x, y, currentMode));
}

document.getElementById('btnExplosion').addEventListener('click', () => { currentMode = 'explosion'; trailMode = false; });
document.getElementById('btnFountain').addEventListener('click', () => { currentMode = 'fountain'; trailMode = false; });
document.getElementById('btnTrail').addEventListener('click', () => { trailMode = !trailMode; });

canvas.addEventListener('click', (e) => {
    if (!trailMode) {
        const rect = canvas.getBoundingClientRect();
        emit(e.clientX - rect.left, e.clientY - rect.top, 50);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (trailMode) {
        const rect = canvas.getBoundingClientRect();
        emit(e.clientX - rect.left, e.clientY - rect.top, 5);
    }
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) particles.splice(i, 1);
        else particles[i].draw(ctx);
    }

    info.textContent = 'Particles: ' + particles.length + ' | Mode: ' + currentMode + ' | Trail: ' + (trailMode ? 'ON' : 'OFF');
    requestAnimationFrame(animate);
}

animate();`,

    advancedParticles: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let particles = [];
let emitters = [];

class FireParticle {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D((Math.random() - 0.5) * 1, -Math.random() * 3 - 1);
        this.size = Math.random() * 8 + 4;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.02;
    }
    update() {
        this.life -= this.decay;
        this.velocity.y -= 0.05;
        this.size *= 0.98;
        this.position.add(this.velocity);
        return this.life > 0;
    }
    draw(ctx) {
        const colorIndex = Math.floor((1 - this.life) * 2);
        const colors = [{r:255,g:255,b:100}, {r:255,g:150,b:50}, {r:255,g:50,b:50}];
        const color = colors[Math.min(colorIndex, 2)];
        ctx.globalAlpha = this.life;
        ctx.fillStyle = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class SmokeParticle {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D((Math.random() - 0.5) * 0.6, -Math.random() * 0.8 - 0.3);
        this.size = Math.random() * 12 + 8;
        this.life = 1.0;
        this.decay = Math.random() * 0.01 + 0.005;
        this.angle = Math.random() * Math.PI * 2;
        this.swirl = (Math.random() - 0.5) * 0.04;
    }
    update() {
        this.life -= this.decay;
        this.angle += this.swirl;
        this.velocity.x += Math.cos(this.angle) * 0.05;
        this.size += 0.2;
        this.position.add(this.velocity);
        return this.life > 0;
    }
    draw(ctx) {
        const gray = Math.floor(100 + this.life * 100);
        ctx.globalAlpha = this.life * 0.4;
        ctx.fillStyle = 'rgb(' + gray + ',' + gray + ',' + gray + ')';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class SparkleParticle {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        this.velocity = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.size = Math.random() * 4 + 2;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.03;
        this.hue = Math.random() * 360;
        this.twinkle = 0;
    }
    update() {
        this.life -= this.decay;
        this.velocity.multiply(0.95);
        this.twinkle += 0.2;
        this.currentSize = this.size * Math.abs(Math.sin(this.twinkle));
        this.position.add(this.velocity);
        return this.life > 0;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life;
        const s = this.currentSize;
        ctx.strokeStyle = 'hsl(' + this.hue + ', 100%, 90%)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.position.x - s, this.position.y);
        ctx.lineTo(this.position.x + s, this.position.y);
        ctx.moveTo(this.position.x, this.position.y - s);
        ctx.lineTo(this.position.x, this.position.y + s);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

class Emitter {
    constructor(x, y, type, rate) {
        this.position = new Vector2D(x, y);
        this.type = type;
        this.rate = rate;
        this.timer = 0;
    }
    update() {
        this.timer++;
        if (this.timer >= this.rate) { this.timer = 0; this.emit(); }
    }
    emit() {
        let particle;
        switch(this.type) {
            case 'fire': particle = new FireParticle(this.position.x, this.position.y); break;
            case 'smoke': particle = new SmokeParticle(this.position.x, this.position.y); break;
            case 'sparkles': particle = new SparkleParticle(this.position.x, this.position.y); break;
        }
        if (particle) particles.push(particle);
    }
}

document.getElementById('btnFire').addEventListener('click', () => { emitters = [new Emitter(400, 450, 'fire', 2)]; });
document.getElementById('btnSmoke').addEventListener('click', () => { emitters = [new Emitter(400, 450, 'smoke', 3)]; });
document.getElementById('btnSparkles').addEventListener('click', () => { emitters = [new Emitter(400, 250, 'sparkles', 1)]; });
document.getElementById('btnCombined').addEventListener('click', () => { emitters = [new Emitter(400, 450, 'fire', 2), new Emitter(400, 420, 'smoke', 4), new Emitter(400, 450, 'sparkles', 5)]; });
document.getElementById('btnClear').addEventListener('click', () => { particles = []; emitters = []; });

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < 20; i++) particles.push(new SparkleParticle(e.clientX - rect.left, e.clientY - rect.top));
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    emitters.forEach(e => e.update());
    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) particles.splice(i, 1);
        else particles[i].draw(ctx);
    }
    info.textContent = 'Particles: ' + particles.length + ' | Emitters: ' + emitters.length;
    requestAnimationFrame(animate);
}

animate();`,

    raycasting: `
class Obstacle {
    constructor(x, y, radius) {
        this.position = new Vector2D(x, y);
        this.radius = radius;
    }

    draw(ctx, hit = false) {
        ctx.fillStyle = hit ? '#ef5350' : '#66bb6a';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const obstacles = [];
const rayOrigin = new Vector2D(400, 250);
let mousePos = new Vector2D(600, 250);

document.getElementById('btnAdd').addEventListener('click', () => {
    obstacles.push(new Obstacle(
        randomFloat(100, canvas.width - 100),
        randomFloat(100, canvas.height - 100),
        randomFloat(20, 40)
    ));
});

document.getElementById('btnClear').addEventListener('click', () => {
    obstacles.length = 0;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

function rayIntersectsCircle(origin, direction, center, radius) {
    const oc = origin.subtract(center);
    const a = direction.dot(direction);
    const b = 2 * oc.dot(direction);
    const c = oc.dot(oc) - radius * radius;
    return b * b - 4 * a * c >= 0;
}

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    const direction = mousePos.subtract(rayOrigin).normalize();

    let hitCount = 0;
    obstacles.forEach(obstacle => {
        const hit = rayIntersectsCircle(rayOrigin, direction, obstacle.position, obstacle.radius);
        obstacle.draw(ctx, hit);
        if (hit) hitCount++;
    });

    // Draw ray origin
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(rayOrigin.x, rayOrigin.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw ray
    const rayEnd = new Vector2D(rayOrigin.x + direction.x * 1000, rayOrigin.y + direction.y * 1000);
    ctx.strokeStyle = hitCount > 0 ? '#ef5350' : '#ffa726';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rayOrigin.x, rayOrigin.y);
    ctx.lineTo(rayEnd.x, rayEnd.y);
    ctx.stroke();

    info.textContent = 'Obstacles hit: ' + hitCount + ' / ' + obstacles.length;
    requestAnimationFrame(animate);
}

// Add initial obstacles
for (let i = 0; i < 5; i++) {
    obstacles.push(new Obstacle(
        randomFloat(100, canvas.width - 100),
        randomFloat(100, canvas.height - 100),
        randomFloat(20, 40)
    ));
}

animate();`,

    // ============ BEGINNER DEMOS ============

    vectorBasics: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let currentExample = 'simple';

function drawVectorBasics(type) {
    currentExample = type;
    clearCanvas(ctx, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    if (type === 'simple') {
        const start = new Vector2D(100, 200);
        const end = new Vector2D(400, 100);
        drawVector(ctx, start, end, '#4fc3f7', 3);

        ctx.fillStyle = '#4fc3f7';
        ctx.font = '16px Arial';
        ctx.fillText('Vector: (' + (end.x - start.x) + ', ' + (end.y - start.y) + ')', 250, 140);
        ctx.fillText('Start', start.x - 30, start.y + 30);
        ctx.fillText('End', end.x + 20, end.y);

        info.textContent = 'Simple vector from (' + start.x + ', ' + start.y + ') to (' + end.x + ', ' + end.y + ')';
    }
    else if (type === 'player') {
        const player = new Vector2D(200, 300);
        const movement = new Vector2D(150, -100);
        const newPos = new Vector2D(player.x + movement.x, player.y + movement.y);

        ctx.fillStyle = '#66bb6a';
        ctx.beginPath();
        ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText('Player', player.x - 20, player.y - 30);

        drawVector(ctx, player, newPos, '#ffa726', 3);

        ctx.fillStyle = '#66bb6a';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(newPos.x, newPos.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        info.textContent = 'Player moves by vector (' + movement.x + ', ' + movement.y + ')';
    }
    else if (type === 'bullet') {
        const gun = new Vector2D(100, 300);
        const target = new Vector2D(600, 150);
        const direction = target.subtract(gun);

        ctx.fillStyle = '#4fc3f7';
        ctx.fillRect(gun.x - 15, gun.y - 10, 30, 20);
        ctx.fillText('Gun', gun.x - 15, gun.y + 35);

        ctx.strokeStyle = '#ef5350';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(target.x, target.y, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillText('Target', target.x - 20, target.y + 45);

        drawVector(ctx, gun, target, '#ffa726', 3);

        info.textContent = 'Bullet direction: (' + direction.x.toFixed(1) + ', ' + direction.y.toFixed(1) + '), Distance: ' + direction.length().toFixed(1);
    }
}

document.getElementById('btnSimple').addEventListener('click', () => drawVectorBasics('simple'));
document.getElementById('btnPlayer').addEventListener('click', () => drawVectorBasics('player'));
document.getElementById('btnBullet').addEventListener('click', () => drawVectorBasics('bullet'));

drawVectorBasics('simple');`,

    vectorPlayground: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const objects = [];
let isDragging = false;
let dragStart = null;

class MovingObject {
    constructor(x, y, vx, vy) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(vx, vy);
        this.radius = 10;
    }

    update() {
        this.position.add(this.velocity);

        if (this.position.x < this.radius || this.position.x > canvas.width - this.radius) {
            this.velocity.x *= -1;
            this.position.x = clamp(this.position.x, this.radius, canvas.width - this.radius);
        }
        if (this.position.y < this.radius || this.position.y > canvas.height - this.radius) {
            this.velocity.y *= -1;
            this.position.y = clamp(this.position.y, this.radius, canvas.height - this.radius);
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        const end = new Vector2D(
            this.position.x + this.velocity.x * 5,
            this.position.y + this.velocity.y * 5
        );
        drawVector(ctx, this.position, end, '#ffa726', 2);
    }
}

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    objects.forEach(obj => {
        obj.update();
        obj.draw(ctx);
    });

    if (isDragging && dragStart) {
        ctx.strokeStyle = '#66bb6a';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragStart.currentX, dragStart.currentY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(79, 195, 247, 0.5)';
        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    dragStart = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top
    };
    isDragging = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && dragStart) {
        const rect = canvas.getBoundingClientRect();
        dragStart.currentX = e.clientX - rect.left;
        dragStart.currentY = e.clientY - rect.top;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isDragging && dragStart) {
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const vx = (endX - dragStart.x) * 0.1;
        const vy = (endY - dragStart.y) * 0.1;

        objects.push(new MovingObject(dragStart.x, dragStart.y, vx, vy));
    }
    isDragging = false;
    dragStart = null;
});

document.getElementById('btnAdd').addEventListener('click', () => {
    const x = randomFloat(50, canvas.width - 50);
    const y = randomFloat(50, canvas.height - 50);
    const vx = randomFloat(-3, 3);
    const vy = randomFloat(-3, 3);
    objects.push(new MovingObject(x, y, vx, vy));
});

document.getElementById('btnClear').addEventListener('click', () => {
    objects.length = 0;
});

animate();`,

    normalize: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let useNormalization = true;
const player = new Vector2D(400, 200);
const keys = { w: false, a: false, s: false, d: false };

window.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

document.getElementById('btnNormalized').addEventListener('click', () => {
    useNormalization = true;
    info.textContent = 'Normalization: ON - Use WASD to move';
});

document.getElementById('btnRaw').addEventListener('click', () => {
    useNormalization = false;
    info.textContent = 'Normalization: OFF - Use WASD to move';
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    const dir = new Vector2D(
        (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
        (keys.s ? 1 : 0) - (keys.w ? 1 : 0)
    );

    if (dir.length() > 0) {
        const speed = 3;

        if (useNormalization) {
            dir.normalize().multiply(speed);
        } else {
            dir.multiply(speed);
        }

        player.add(dir);

        player.x = clamp(player.x, 30, canvas.width - 30);
        player.y = clamp(player.y, 30, canvas.height - 30);

        info.textContent = (useNormalization ? 'Normalized' : 'Not normalized') + ' | Speed: ' + dir.length().toFixed(2) + ' px/frame';
    }

    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Player', player.x - 20, player.y - 30);

    requestAnimationFrame(animate);
}

animate();`,

    dotProduct: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const center = new Vector2D(400, 200);
const forward = new Vector2D(1, 0);
let mousePos = new Vector2D(600, 200);

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    const toMouse = mousePos.subtract(center);
    const normalized = toMouse.copy().normalize();

    const dot = forward.dot(normalized);

    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 15, 0, Math.PI * 2);
    ctx.fill();

    const forwardEnd = new Vector2D(center.x + forward.x * 100, center.y + forward.y * 100);
    drawVector(ctx, center, forwardEnd, '#66bb6a', 3);
    ctx.fillStyle = '#66bb6a';
    ctx.font = '14px Arial';
    ctx.fillText('Forward', forwardEnd.x + 10, forwardEnd.y);

    const mouseEnd = new Vector2D(center.x + normalized.x * 100, center.y + normalized.y * 100);
    const color = dot > 0 ? '#ffa726' : '#ef5350';
    drawVector(ctx, center, mouseEnd, color, 3);

    ctx.fillStyle = color;
    ctx.font = '20px Arial';
    ctx.fillText('Dot Product: ' + dot.toFixed(3), 20, 30);

    if (dot > 0.7) {
        info.textContent = 'Target is directly in front!';
    } else if (dot > 0) {
        info.textContent = 'Target is ahead';
    } else if (dot > -0.3) {
        info.textContent = 'Target is to the side';
    } else {
        info.textContent = 'Target is behind';
    }

    requestAnimationFrame(animate);
}

animate();`,

    trig: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let mode = 'orbit';
let time = 0;
let mousePos = new Vector2D(400, 250);

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

document.getElementById('btnOrbit').addEventListener('click', () => mode = 'orbit');
document.getElementById('btnWave').addEventListener('click', () => mode = 'wave');
document.getElementById('btnAim').addEventListener('click', () => mode = 'aim');

const orbitObjects = [
    { angle: 0, radius: 80, speed: 0.02, color: '#4fc3f7' },
    { angle: Math.PI, radius: 80, speed: 0.02, color: '#66bb6a' },
    { angle: Math.PI / 2, radius: 120, speed: 0.015, color: '#ffa726' }
];

const waveObjects = [];
for (let i = 0; i < 10; i++) {
    waveObjects.push({
        x: 100 + i * 60,
        baseY: 250,
        amplitude: 40,
        frequency: 2,
        phase: i * 0.5
    });
}

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    time += 0.05;

    const center = new Vector2D(400, 250);

    if (mode === 'orbit') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(center.x, center.y, 10, 0, Math.PI * 2);
        ctx.fill();

        orbitObjects.forEach(obj => {
            obj.angle += obj.speed;
            const x = center.x + Math.cos(obj.angle) * obj.radius;
            const y = center.y + Math.sin(obj.angle) * obj.radius;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(center.x, center.y, obj.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = obj.color;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = obj.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        });

        info.textContent = 'Circular orbit using cos(angle) for X and sin(angle) for Y';
    }
    else if (mode === 'wave') {
        waveObjects.forEach(obj => {
            const offset = Math.sin((time + obj.phase) * obj.frequency) * obj.amplitude;
            const y = obj.baseY + offset;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.baseY - 5);
            ctx.lineTo(obj.x, obj.baseY + 5);
            ctx.stroke();

            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(obj.x, y, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.baseY);
            ctx.lineTo(obj.x, y);
            ctx.stroke();
        });

        info.textContent = 'Wave motion using sin(time * frequency) for smooth up/down movement';
    }
    else if (mode === 'aim') {
        const objPos = new Vector2D(400, 250);
        const direction = mousePos.subtract(objPos);
        const angle = Math.atan2(direction.y, direction.x);

        ctx.save();
        ctx.translate(objPos.x, objPos.y);
        ctx.rotate(angle);
        ctx.fillStyle = '#66bb6a';
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(objPos.x, objPos.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ffa726';
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 8, 0, Math.PI * 2);
        ctx.fill();

        const angleDeg = (angle * 180 / Math.PI).toFixed(1);
        info.textContent = 'Using atan2(dy, dx) to face target. Angle: ' + angleDeg + '°';
    }

    requestAnimationFrame(animate);
}

animate();`,

    easing: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let currentEasing = 'linear';
let t = 0;
let comparing = false;

const easingFunctions = {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
};

document.getElementById('btnLinear').addEventListener('click', () => { currentEasing = 'linear'; comparing = false; t = 0; });
document.getElementById('btnEaseIn').addEventListener('click', () => { currentEasing = 'easeIn'; comparing = false; t = 0; });
document.getElementById('btnEaseOut').addEventListener('click', () => { currentEasing = 'easeOut'; comparing = false; t = 0; });
document.getElementById('btnEaseInOut').addEventListener('click', () => { currentEasing = 'easeInOut'; comparing = false; t = 0; });

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    t += 0.005;
    if (t > 1) t = 0;

    const startX = 100;
    const endX = 700;
    const y = 250;

    const easedT = easingFunctions[currentEasing](t);
    const x = startX + (endX - startX) * easedT;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
        const progress = i / 100;
        const eased = easingFunctions[currentEasing](progress);
        const gx = startX + (endX - startX) * progress;
        const gy = 400 - eased * 150;
        if (i === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
    }
    ctx.stroke();

    ctx.strokeStyle = '#4fc3f7';
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(startX, y, 8, 0, Math.PI * 2);
    ctx.arc(endX, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(100, 350, 600, 20);
    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(100, 350, 600 * t, 20);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentEasing.toUpperCase(), 400, 50);
    ctx.font = '12px monospace';
    ctx.fillText('Progress: ' + (t * 100).toFixed(0) + '%', 400, 380);
    ctx.fillText('Eased: ' + (easedT * 100).toFixed(0) + '%', 400, 395);

    info.textContent = currentEasing + ': See how the movement feels different with easing!';

    requestAnimationFrame(animate);
}

animate();`,

    game: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const keys = { w: false, a: false, s: false, d: false };

class Player {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.radius = 20;
        this.speed = 4;
    }

    update() {
        const dir = new Vector2D(
            (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
            (keys.s ? 1 : 0) - (keys.w ? 1 : 0)
        );

        if (dir.length() > 0) {
            dir.normalize().multiply(this.speed);
            this.position.add(dir);
        }

        this.position.x = clamp(this.position.x, this.radius, canvas.width - this.radius);
        this.position.y = clamp(this.position.y, this.radius, canvas.height - this.radius);
    }

    draw(ctx) {
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Enemy {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.radius = 15;
        this.alive = true;
    }

    draw(ctx) {
        if (this.alive) {
            ctx.fillStyle = '#ef5350';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Bullet {
    constructor(x, y, vx, vy) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(vx, vy);
        this.radius = 5;
        this.alive = true;
    }

    update() {
        this.position.add(this.velocity);

        if (this.position.x < 0 || this.position.x > canvas.width ||
            this.position.y < 0 || this.position.y > canvas.height) {
            this.alive = false;
        }
    }

    draw(ctx) {
        if (this.alive) {
            ctx.fillStyle = '#ffa726';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

const player = new Player(400, 300);
const enemies = [];
const bullets = [];
let score = 0;

window.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    const direction = new Vector2D(targetX - player.position.x, targetY - player.position.y);
    direction.normalize().multiply(8);

    bullets.push(new Bullet(player.position.x, player.position.y, direction.x, direction.y));
});

document.getElementById('btnStart').addEventListener('click', () => {
    for (let i = 0; i < 5; i++) {
        const x = randomFloat(50, canvas.width - 50);
        const y = randomFloat(50, canvas.height - 50);
        enemies.push(new Enemy(x, y));
    }
});

document.getElementById('btnReset').addEventListener('click', () => {
    enemies.length = 0;
    bullets.length = 0;
    score = 0;
    player.position.set(400, 300);
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    player.update();
    player.draw(ctx);

    bullets.forEach(bullet => {
        bullet.update();
        bullet.draw(ctx);
    });

    enemies.forEach(enemy => {
        enemy.draw(ctx);
    });

    bullets.forEach(bullet => {
        if (!bullet.alive) return;

        enemies.forEach(enemy => {
            if (!enemy.alive) return;

            const dist = bullet.position.distance(enemy.position);
            if (dist < bullet.radius + enemy.radius) {
                bullet.alive = false;
                enemy.alive = false;
                score++;
            }
        });
    });

    for (let i = bullets.length - 1; i >= 0; i--) {
        if (!bullets[i].alive) bullets.splice(i, 1);
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (!enemies[i].alive) enemies.splice(i, 1);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 20, 30);
    ctx.font = '16px Arial';
    ctx.fillText('Enemies: ' + enemies.length, 20, 55);

    info.textContent = 'Score: ' + score + ' | Use WASD to move, Click to shoot!';

    requestAnimationFrame(animate);
}

animate();`,

    homingMissile: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class Target {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(randomFloat(-2, 2), randomFloat(-2, 2));
        this.radius = 20;
    }

    update() {
        this.position.add(this.velocity);

        if (this.position.x < this.radius || this.position.x > canvas.width - this.radius) {
            this.velocity.x *= -1;
        }
        if (this.position.y < this.radius || this.position.y > canvas.height - this.radius) {
            this.velocity.y *= -1;
        }
    }

    draw(ctx) {
        ctx.strokeStyle = '#ef5350';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x - 10, this.position.y);
        ctx.lineTo(this.position.x + 10, this.position.y);
        ctx.moveTo(this.position.x, this.position.y - 10);
        ctx.lineTo(this.position.x, this.position.y + 10);
        ctx.stroke();
    }
}

class HomingMissile {
    constructor(x, y, target) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.target = target;
        this.speed = 3;
        this.turnRate = 0.05;
        this.rotation = 0;
        this.alive = true;
        this.trail = [];
    }

    update() {
        const toTarget = this.target.position.subtract(this.position);
        const desired = toTarget.copy().normalize().multiply(this.speed);

        this.velocity.lerp(desired, this.turnRate);

        this.position.add(this.velocity);
        this.rotation = Math.atan2(this.velocity.y, this.velocity.x);

        this.trail.push(this.position.copy());
        if (this.trail.length > 20) this.trail.shift();

        if (this.position.distance(this.target.position) < 20) {
            this.alive = false;
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length;
            ctx.fillStyle = 'rgba(255, 165, 0, ' + (alpha * 0.5) + ')';
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -6);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

const target = new Target(600, 300);
const missiles = [];

document.getElementById('btnFire').addEventListener('click', () => {
    missiles.push(new HomingMissile(100, canvas.height / 2, target));
});

document.getElementById('btnReset').addEventListener('click', () => {
    missiles.length = 0;
    target.position.set(600, 300);
    target.velocity.set(randomFloat(-2, 2), randomFloat(-2, 2));
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    target.update();
    target.draw(ctx);

    missiles.forEach(missile => {
        if (missile.alive) {
            missile.update();
            missile.draw(ctx);
        }
    });

    for (let i = missiles.length - 1; i >= 0; i--) {
        if (!missiles[i].alive) missiles.splice(i, 1);
    }

    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(50, canvas.height / 2 - 20, 30, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('Launcher', 35, canvas.height / 2 + 40);

    info.textContent = 'Active missiles: ' + missiles.length + ' | Click Fire to launch!';

    requestAnimationFrame(animate);
}

animate();`,

    // ============ ADVANCED DEMOS ============

    steering: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let mode = 'seek';
let mousePos = new Vector2D(400, 250);

class Agent {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(randomFloat(-2, 2), randomFloat(-2, 2));
        this.maxSpeed = 4;
        this.maxForce = 0.15;
        this.wanderAngle = 0;
    }

    seek(target) {
        const desired = target.subtract(this.position);
        desired.normalize().multiply(this.maxSpeed);
        const steer = desired.subtract(this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }

    flee(threat) {
        const desired = this.position.subtract(threat);
        desired.normalize().multiply(this.maxSpeed);
        const steer = desired.subtract(this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }

    wander() {
        this.wanderAngle += randomFloat(-0.3, 0.3);
        const circlePos = this.velocity.copy().normalize().multiply(60);
        const x = Math.cos(this.wanderAngle) * 30;
        const y = Math.sin(this.wanderAngle) * 30;
        return circlePos.add(new Vector2D(x, y));
    }

    update() {
        let force;
        if (mode === 'seek') force = this.seek(mousePos);
        else if (mode === 'flee') force = this.flee(mousePos);
        else force = this.wander();

        this.velocity.add(force);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);

        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.x > canvas.width) this.position.x = 0;
        if (this.position.y < 0) this.position.y = canvas.height;
        if (this.position.y > canvas.height) this.position.y = 0;
    }

    draw(ctx) {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-8, -6);
        ctx.lineTo(-8, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

const agents = [];
for (let i = 0; i < 10; i++) {
    agents.push(new Agent(randomFloat(50, canvas.width - 50), randomFloat(50, canvas.height - 50)));
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

document.getElementById('btnSeek').addEventListener('click', () => mode = 'seek');
document.getElementById('btnFlee').addEventListener('click', () => mode = 'flee');
document.getElementById('btnWander').addEventListener('click', () => mode = 'wander');

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    ctx.strokeStyle = mode === 'flee' ? '#ef5350' : '#66bb6a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, 20, 0, Math.PI * 2);
    ctx.stroke();

    agents.forEach(agent => {
        agent.update();
        agent.draw(ctx);
    });

    info.textContent = 'Mode: ' + mode.toUpperCase();
    requestAnimationFrame(animate);
}

animate();`,

    quaternion: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let rotationX = 0, rotationY = 0;

const cubeVertices = [
    new Vector2D(-50, -50), new Vector2D(50, -50),
    new Vector2D(50, 50), new Vector2D(-50, 50)
];

function project3D(x, y, z) {
    const scale = 200 / (200 + z);
    return new Vector2D(400 + x * scale, 250 + y * scale);
}

function rotatePoint(x, y, z) {
    let nx = x, ny = y, nz = z;

    const cosX = Math.cos(rotationX), sinX = Math.sin(rotationX);
    const tempY = ny * cosX - nz * sinX;
    nz = ny * sinX + nz * cosX;
    ny = tempY;

    const cosY = Math.cos(rotationY), sinY = Math.sin(rotationY);
    const tempX = nx * cosY + nz * sinY;
    nz = -nx * sinY + nz * cosY;
    nx = tempX;

    return { x: nx, y: ny, z: nz };
}

document.getElementById('btnRotateX').addEventListener('click', () => rotationX += 0.3);
document.getElementById('btnRotateY').addEventListener('click', () => rotationY += 0.3);
document.getElementById('btnReset').addEventListener('click', () => { rotationX = 0; rotationY = 0; });

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    const size = 60;
    const faces = [
        [[-size, -size, -size], [size, -size, -size], [size, size, -size], [-size, size, -size]],
        [[-size, -size, size], [size, -size, size], [size, size, size], [-size, size, size]],
        [[-size, -size, -size], [-size, -size, size], [-size, size, size], [-size, size, -size]],
        [[size, -size, -size], [size, -size, size], [size, size, size], [size, size, -size]]
    ];

    const colors = ['#4fc3f7', '#66bb6a', '#ffa726', '#ef5350'];

    faces.forEach((face, i) => {
        ctx.fillStyle = colors[i];
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        face.forEach((vertex, j) => {
            const rotated = rotatePoint(vertex[0], vertex[1], vertex[2]);
            const projected = project3D(rotated.x, rotated.y, rotated.z);
            if (j === 0) ctx.moveTo(projected.x, projected.y);
            else ctx.lineTo(projected.x, projected.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();
    });

    info.textContent = 'Rotation X: ' + (rotationX * 180 / Math.PI).toFixed(0) + '° Y: ' + (rotationY * 180 / Math.PI).toFixed(0) + '°';
    requestAnimationFrame(animate);
}

animate();`,

    bezier: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let curveType = 'quadratic';
let dragging = null;

const points = {
    p0: new Vector2D(100, 400),
    p1: new Vector2D(250, 100),
    p2: new Vector2D(550, 100),
    p3: new Vector2D(700, 400)
};

function quadraticBezier(p0, p1, p2, t) {
    const x = (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x;
    const y = (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y;
    return new Vector2D(x, y);
}

function cubicBezier(p0, p1, p2, p3, t) {
    const x = Math.pow(1-t,3)*p0.x + 3*Math.pow(1-t,2)*t*p1.x + 3*(1-t)*t*t*p2.x + t*t*t*p3.x;
    const y = Math.pow(1-t,3)*p0.y + 3*Math.pow(1-t,2)*t*p1.y + 3*(1-t)*t*t*p2.y + t*t*t*p3.y;
    return new Vector2D(x, y);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const key in points) {
        if (points[key].distance(new Vector2D(mx, my)) < 15) {
            dragging = key;
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        points[dragging].x = e.clientX - rect.left;
        points[dragging].y = e.clientY - rect.top;
    }
});

canvas.addEventListener('mouseup', () => dragging = null);

document.getElementById('btnQuadratic').addEventListener('click', () => curveType = 'quadratic');
document.getElementById('btnCubic').addEventListener('click', () => curveType = 'cubic');
document.getElementById('btnReset').addEventListener('click', () => {
    points.p0.set(100, 400);
    points.p1.set(250, 100);
    points.p2.set(550, 100);
    points.p3.set(700, 400);
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let t = 0; t <= 1; t += 0.01) {
        const p = curveType === 'quadratic'
            ? quadraticBezier(points.p0, points.p1, points.p2, t)
            : cubicBezier(points.p0, points.p1, points.p2, points.p3, t);
        if (t === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(points.p0.x, points.p0.y);
    ctx.lineTo(points.p1.x, points.p1.y);
    if (curveType === 'cubic') ctx.lineTo(points.p2.x, points.p2.y);
    ctx.lineTo(curveType === 'quadratic' ? points.p2.x : points.p3.x, curveType === 'quadratic' ? points.p2.y : points.p3.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const activePoints = curveType === 'quadratic' ? ['p0', 'p1', 'p2'] : ['p0', 'p1', 'p2', 'p3'];
    activePoints.forEach((key, i) => {
        ctx.fillStyle = ['#66bb6a', '#ffa726', '#ef5350', '#ab47bc'][i];
        ctx.beginPath();
        ctx.arc(points[key].x, points[key].y, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    info.textContent = curveType.charAt(0).toUpperCase() + curveType.slice(1) + ' Bézier - Drag control points!';
    requestAnimationFrame(animate);
}

animate();`,

    astar: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const cellSize = 25;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);
const grid = [];
let start = { x: 1, y: 1 };
let end = { x: cols - 2, y: rows - 2 };
let path = [];

for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
        grid[i][j] = { x: i, y: j, wall: false, g: 0, h: 0, f: 0, parent: null };
    }
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function findPath() {
    const openSet = [grid[start.x][start.y]];
    const closedSet = [];
    path = [];

    grid.forEach(col => col.forEach(cell => { cell.g = 0; cell.h = 0; cell.f = 0; cell.parent = null; }));

    while (openSet.length > 0) {
        let current = openSet.reduce((a, b) => a.f < b.f ? a : b);

        if (current.x === end.x && current.y === end.y) {
            while (current) {
                path.push(current);
                current = current.parent;
            }
            path.reverse();
            return;
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        const neighbors = [];
        if (current.x > 0) neighbors.push(grid[current.x - 1][current.y]);
        if (current.x < cols - 1) neighbors.push(grid[current.x + 1][current.y]);
        if (current.y > 0) neighbors.push(grid[current.x][current.y - 1]);
        if (current.y < rows - 1) neighbors.push(grid[current.x][current.y + 1]);

        for (const neighbor of neighbors) {
            if (closedSet.includes(neighbor) || neighbor.wall) continue;

            const g = current.g + 1;
            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (g >= neighbor.g) continue;

            neighbor.parent = current;
            neighbor.g = g;
            neighbor.h = heuristic(neighbor, grid[end.x][end.y]);
            neighbor.f = neighbor.g + neighbor.h;
        }
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        if (!(x === start.x && y === start.y) && !(x === end.x && y === end.y)) {
            grid[x][y].wall = !grid[x][y].wall;
        }
    }
});

document.getElementById('btnFindPath').addEventListener('click', findPath);
document.getElementById('btnClear').addEventListener('click', () => {
    grid.forEach(col => col.forEach(cell => cell.wall = false));
    path = [];
});
document.getElementById('btnReset').addEventListener('click', () => {
    grid.forEach(col => col.forEach(cell => cell.wall = false));
    path = [];
});

function draw() {
    clearCanvas(ctx, canvas.width, canvas.height);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const cell = grid[i][j];
            if (cell.wall) ctx.fillStyle = '#424242';
            else ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(i * cellSize, j * cellSize, cellSize - 1, cellSize - 1);
        }
    }

    path.forEach(cell => {
        ctx.fillStyle = '#4fc3f7';
        ctx.fillRect(cell.x * cellSize + 2, cell.y * cellSize + 2, cellSize - 5, cellSize - 5);
    });

    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(start.x * cellSize + 2, start.y * cellSize + 2, cellSize - 5, cellSize - 5);

    ctx.fillStyle = '#ef5350';
    ctx.fillRect(end.x * cellSize + 2, end.y * cellSize + 2, cellSize - 5, cellSize - 5);

    info.textContent = 'Click to add/remove walls. Path length: ' + (path.length > 0 ? path.length : 'None');
    requestAnimationFrame(draw);
}

draw();`,

    flowField: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const cellSize = 40;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);
const field = [];
const agents = [];
let target = new Vector2D(canvas.width - 50, canvas.height - 50);

for (let i = 0; i < cols; i++) {
    field[i] = [];
    for (let j = 0; j < rows; j++) {
        field[i][j] = new Vector2D(0, 0);
    }
}

function generateField() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const cellCenter = new Vector2D(i * cellSize + cellSize / 2, j * cellSize + cellSize / 2);
            const toTarget = target.subtract(cellCenter);
            toTarget.normalize();
            field[i][j] = toTarget;
        }
    }
}

class FlowAgent {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.maxSpeed = 3;
    }

    update() {
        const col = Math.floor(this.position.x / cellSize);
        const row = Math.floor(this.position.y / cellSize);

        if (col >= 0 && col < cols && row >= 0 && row < rows) {
            const desired = field[col][row].copy().multiply(this.maxSpeed);
            this.velocity.lerp(desired, 0.1);
        }

        this.position.add(this.velocity);

        if (this.position.x < 0 || this.position.x > canvas.width ||
            this.position.y < 0 || this.position.y > canvas.height) {
            this.position.set(randomFloat(50, 150), randomFloat(50, 150));
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 20; i++) {
    agents.push(new FlowAgent(randomFloat(50, 150), randomFloat(50, 150)));
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    target.x = e.clientX - rect.left;
    target.y = e.clientY - rect.top;
    generateField();
});

document.getElementById('btnAddAgent').addEventListener('click', () => {
    agents.push(new FlowAgent(randomFloat(50, 150), randomFloat(50, 150)));
});

document.getElementById('btnClear').addEventListener('click', () => {
    agents.length = 0;
});

generateField();

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = i * cellSize + cellSize / 2;
            const y = j * cellSize + cellSize / 2;
            const dir = field[i][j];

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + dir.x * 15, y + dir.y * 15);
            ctx.stroke();
        }
    }

    ctx.fillStyle = '#ef5350';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
    ctx.fill();

    agents.forEach(agent => {
        agent.update();
        agent.draw(ctx);
    });

    info.textContent = 'Agents: ' + agents.length + ' | Click to move target';
    requestAnimationFrame(animate);
}

animate();`,

    state: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class StateMachine {
    constructor() {
        this.state = 'idle';
        this.position = new Vector2D(400, 250);
        this.target = new Vector2D(400, 250);
        this.health = 100;
        this.speed = 2;
    }

    update() {
        switch (this.state) {
            case 'idle':
                if (this.position.distance(this.target) > 50) this.state = 'chase';
                break;
            case 'chase':
                if (this.health < 30) this.state = 'flee';
                else if (this.position.distance(this.target) < 30) this.state = 'attack';
                else {
                    const dir = this.target.subtract(this.position).normalize();
                    this.position.add(dir.multiply(this.speed));
                }
                break;
            case 'attack':
                if (this.health < 30) this.state = 'flee';
                else if (this.position.distance(this.target) > 50) this.state = 'chase';
                break;
            case 'flee':
                if (this.health >= 50) this.state = 'idle';
                else {
                    const dir = this.position.subtract(this.target).normalize();
                    this.position.add(dir.multiply(this.speed * 1.5));
                }
                this.health += 0.1;
                break;
        }

        this.position.x = Math.max(30, Math.min(canvas.width - 30, this.position.x));
        this.position.y = Math.max(30, Math.min(canvas.height - 30, this.position.y));
    }

    draw(ctx) {
        const colors = { idle: '#66bb6a', chase: '#ffa726', attack: '#ef5350', flee: '#ab47bc' };
        ctx.fillStyle = colors[this.state];
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#333';
        ctx.fillRect(this.position.x - 30, this.position.y - 40, 60, 8);
        ctx.fillStyle = this.health > 50 ? '#66bb6a' : this.health > 25 ? '#ffa726' : '#ef5350';
        ctx.fillRect(this.position.x - 30, this.position.y - 40, 60 * (this.health / 100), 8);
    }
}

const agent = new StateMachine();

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    agent.target.x = e.clientX - rect.left;
    agent.target.y = e.clientY - rect.top;
});

document.getElementById('btnSetTarget').addEventListener('click', () => {
    agent.target.set(randomFloat(100, canvas.width - 100), randomFloat(100, canvas.height - 100));
});

document.getElementById('btnDamage').addEventListener('click', () => {
    agent.health = Math.max(0, agent.health - 25);
});

document.getElementById('btnReset').addEventListener('click', () => {
    agent.position.set(400, 250);
    agent.target.set(400, 250);
    agent.health = 100;
    agent.state = 'idle';
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(agent.target.x, agent.target.y, 15, 0, Math.PI * 2);
    ctx.stroke();

    agent.update();
    agent.draw(ctx);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(agent.state.toUpperCase(), agent.position.x - 20, agent.position.y + 5);

    info.textContent = 'State: ' + agent.state.toUpperCase() + ' | Health: ' + agent.health.toFixed(0) + '%';
    requestAnimationFrame(animate);
}

animate();`,

    behaviorTree: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const RUNNING = 'RUNNING';

class BTAgent {
    constructor() {
        this.position = new Vector2D(100, 250);
        this.target = new Vector2D(700, 250);
        this.hasTarget = false;
        this.speed = 2;
        this.currentAction = 'None';
    }

    draw(ctx) {
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

const agent = new BTAgent();
let running = false;

function tick() {
    if (agent.position.distance(agent.target) > 30) {
        agent.currentAction = 'Moving to target';
        const dir = agent.target.subtract(agent.position).normalize();
        agent.position.add(dir.multiply(agent.speed));
        return RUNNING;
    }
    agent.currentAction = 'At target';
    return SUCCESS;
}

document.getElementById('btnStep').addEventListener('click', tick);

document.getElementById('btnRun').addEventListener('click', () => {
    running = !running;
});

document.getElementById('btnReset').addEventListener('click', () => {
    agent.position.set(100, 250);
    agent.target.set(700, 250);
    agent.currentAction = 'None';
    running = false;
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    agent.target.x = e.clientX - rect.left;
    agent.target.y = e.clientY - rect.top;
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    if (running) tick();

    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(agent.target.x, agent.target.y, 15, 0, Math.PI * 2);
    ctx.stroke();

    agent.draw(ctx);

    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(agent.position.x, agent.position.y);
    ctx.lineTo(agent.target.x, agent.target.y);
    ctx.stroke();
    ctx.setLineDash([]);

    info.textContent = 'Action: ' + agent.currentAction + ' | ' + (running ? 'Running' : 'Paused');
    requestAnimationFrame(animate);
}

animate();`,

    ik: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const base = new Vector2D(400, 400);
const length1 = 120;
const length2 = 100;
let mousePos = new Vector2D(500, 200);

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

function solveIK(target) {
    const dx = target.x - base.x;
    const dy = target.y - base.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const maxReach = length1 + length2;
    const minReach = Math.abs(length1 - length2);

    let clampedDist = Math.max(minReach + 1, Math.min(maxReach - 1, dist));

    const angle2 = Math.acos((length1 * length1 + length2 * length2 - clampedDist * clampedDist) / (2 * length1 * length2));
    const angle1 = Math.atan2(dy, dx) - Math.atan2(length2 * Math.sin(angle2), length1 + length2 * Math.cos(angle2));

    const joint = new Vector2D(
        base.x + Math.cos(angle1) * length1,
        base.y + Math.sin(angle1) * length1
    );

    const end = new Vector2D(
        joint.x + Math.cos(angle1 + Math.PI - angle2) * length2,
        joint.y + Math.sin(angle1 + Math.PI - angle2) * length2
    );

    return { joint, end, angle1, angle2 };
}

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    const ik = solveIK(mousePos);

    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(ik.joint.x, ik.joint.y);
    ctx.stroke();

    ctx.strokeStyle = '#66bb6a';
    ctx.beginPath();
    ctx.moveTo(ik.joint.x, ik.joint.y);
    ctx.lineTo(ik.end.x, ik.end.y);
    ctx.stroke();

    ctx.fillStyle = '#ffa726';
    ctx.beginPath();
    ctx.arc(base.x, base.y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ab47bc';
    ctx.beginPath();
    ctx.arc(ik.joint.x, ik.joint.y, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef5350';
    ctx.beginPath();
    ctx.arc(ik.end.x, ik.end.y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, 8, 0, Math.PI * 2);
    ctx.stroke();

    info.textContent = 'Move mouse to control arm endpoint';
    requestAnimationFrame(animate);
}

animate();`,

    shadow: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let lightPos = new Vector2D(400, 250);
const walls = [];

class Wall {
    constructor(x1, y1, x2, y2) {
        this.p1 = new Vector2D(x1, y1);
        this.p2 = new Vector2D(x2, y2);
    }
}

walls.push(new Wall(200, 150, 300, 150));
walls.push(new Wall(300, 150, 300, 250));
walls.push(new Wall(500, 200, 600, 200));
walls.push(new Wall(500, 200, 500, 350));

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    lightPos.x = e.clientX - rect.left;
    lightPos.y = e.clientY - rect.top;
});

document.getElementById('btnAddWall').addEventListener('click', () => {
    const x = randomFloat(100, canvas.width - 200);
    const y = randomFloat(100, canvas.height - 100);
    walls.push(new Wall(x, y, x + randomFloat(50, 150), y + randomFloat(-50, 50)));
});

document.getElementById('btnClear').addEventListener('click', () => {
    walls.length = 0;
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(lightPos.x, lightPos.y, 0, lightPos.x, lightPos.y, 300);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    walls.forEach(wall => {
        const shadowLength = 500;

        const dir1 = wall.p1.subtract(lightPos).normalize().multiply(shadowLength);
        const dir2 = wall.p2.subtract(lightPos).normalize().multiply(shadowLength);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.moveTo(wall.p1.x, wall.p1.y);
        ctx.lineTo(wall.p1.x + dir1.x, wall.p1.y + dir1.y);
        ctx.lineTo(wall.p2.x + dir2.x, wall.p2.y + dir2.y);
        ctx.lineTo(wall.p2.x, wall.p2.y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(wall.p1.x, wall.p1.y);
        ctx.lineTo(wall.p2.x, wall.p2.y);
        ctx.stroke();
    });

    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(lightPos.x, lightPos.y, 15, 0, Math.PI * 2);
    ctx.fill();

    info.textContent = 'Walls: ' + walls.length + ' | Move mouse to move light';
    requestAnimationFrame(animate);
}

animate();`,

    spatialHash: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const cellSize = 50;
const objects = [];

class SpatialHash {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    clear() {
        this.cells.clear();
    }

    getKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return cellX + ',' + cellY;
    }

    insert(obj) {
        const key = this.getKey(obj.position.x, obj.position.y);
        if (!this.cells.has(key)) this.cells.set(key, []);
        this.cells.get(key).push(obj);
    }

    getNearby(obj) {
        const nearby = [];
        const cellX = Math.floor(obj.position.x / this.cellSize);
        const cellY = Math.floor(obj.position.y / this.cellSize);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = (cellX + dx) + ',' + (cellY + dy);
                if (this.cells.has(key)) {
                    nearby.push(...this.cells.get(key));
                }
            }
        }
        return nearby;
    }
}

const hash = new SpatialHash(cellSize);

class Ball {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(randomFloat(-2, 2), randomFloat(-2, 2));
        this.radius = 8;
        this.colliding = false;
    }

    update() {
        this.position.add(this.velocity);
        if (this.position.x < this.radius || this.position.x > canvas.width - this.radius) this.velocity.x *= -1;
        if (this.position.y < this.radius || this.position.y > canvas.height - this.radius) this.velocity.y *= -1;
    }

    draw(ctx) {
        ctx.fillStyle = this.colliding ? '#ef5350' : '#4fc3f7';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function addObjects() {
    for (let i = 0; i < 10; i++) {
        objects.push(new Ball(randomFloat(50, canvas.width - 50), randomFloat(50, canvas.height - 50)));
    }
}

document.getElementById('btnAdd').addEventListener('click', addObjects);
document.getElementById('btnClear').addEventListener('click', () => objects.length = 0);

addObjects();

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x += cellSize) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    hash.clear();
    objects.forEach(obj => {
        obj.colliding = false;
        obj.update();
        hash.insert(obj);
    });

    let checks = 0;
    objects.forEach(obj => {
        const nearby = hash.getNearby(obj);
        nearby.forEach(other => {
            if (obj !== other) {
                checks++;
                if (obj.position.distance(other.position) < obj.radius + other.radius) {
                    obj.colliding = true;
                    other.colliding = true;
                }
            }
        });
    });

    objects.forEach(obj => obj.draw(ctx));

    info.textContent = 'Objects: ' + objects.length + ' | Collision checks: ' + checks + ' (vs ' + (objects.length * objects.length) + ' brute force)';
    requestAnimationFrame(animate);
}

animate();`,

    // ============ EXPERT DEMOS ============

    quadtree: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class QuadTree {
    constructor(boundary, capacity = 4) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.objects = [];
        this.divided = false;
    }

    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.width / 2;
        const h = this.boundary.height / 2;

        this.northeast = new QuadTree({x: x + w, y: y, width: w, height: h}, this.capacity);
        this.northwest = new QuadTree({x: x, y: y, width: w, height: h}, this.capacity);
        this.southeast = new QuadTree({x: x + w, y: y + h, width: w, height: h}, this.capacity);
        this.southwest = new QuadTree({x: x, y: y + h, width: w, height: h}, this.capacity);
        this.divided = true;
    }

    insert(point) {
        if (!this.contains(point)) return false;
        if (this.objects.length < this.capacity) {
            this.objects.push(point);
            return true;
        }
        if (!this.divided) this.subdivide();
        return this.northeast.insert(point) || this.northwest.insert(point) ||
               this.southeast.insert(point) || this.southwest.insert(point);
    }

    contains(point) {
        return point.x >= this.boundary.x && point.x < this.boundary.x + this.boundary.width &&
               point.y >= this.boundary.y && point.y < this.boundary.y + this.boundary.height;
    }

    query(range, found = []) {
        if (!this.intersects(range)) return found;
        for (const point of this.objects) {
            if (this.rangeContains(range, point)) found.push(point);
        }
        if (this.divided) {
            this.northeast.query(range, found);
            this.northwest.query(range, found);
            this.southeast.query(range, found);
            this.southwest.query(range, found);
        }
        return found;
    }

    intersects(range) {
        return !(this.boundary.x > range.x + range.width ||
                 this.boundary.x + this.boundary.width < range.x ||
                 this.boundary.y > range.y + range.height ||
                 this.boundary.y + this.boundary.height < range.y);
    }

    rangeContains(range, point) {
        return point.x >= range.x && point.x <= range.x + range.width &&
               point.y >= range.y && point.y <= range.y + range.height;
    }

    draw(ctx) {
        ctx.strokeStyle = '#2a2f4a';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.boundary.x, this.boundary.y, this.boundary.width, this.boundary.height);
        if (this.divided) {
            this.northeast.draw(ctx);
            this.northwest.draw(ctx);
            this.southeast.draw(ctx);
            this.southwest.draw(ctx);
        }
    }
}

const points = [];
let mousePos = new Vector2D(400, 300);
let showTree = true;

document.getElementById('btnAddMany').addEventListener('click', () => {
    for (let i = 0; i < 100; i++) {
        points.push(new Vector2D(randomFloat(0, canvas.width), randomFloat(0, canvas.height)));
    }
});

document.getElementById('btnToggleTree').addEventListener('click', () => showTree = !showTree);
document.getElementById('btnClearQuad').addEventListener('click', () => points.length = 0);

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

for (let i = 0; i < 50; i++) {
    points.push(new Vector2D(randomFloat(0, canvas.width), randomFloat(0, canvas.height)));
}

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    const boundary = {x: 0, y: 0, width: canvas.width, height: canvas.height};
    const quadtree = new QuadTree(boundary);
    points.forEach(point => quadtree.insert(point));

    if (showTree) quadtree.draw(ctx);

    const queryRange = { x: mousePos.x - 75, y: mousePos.y - 75, width: 150, height: 150 };
    const found = quadtree.query(queryRange);

    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(queryRange.x, queryRange.y, queryRange.width, queryRange.height);

    points.forEach(point => {
        ctx.fillStyle = found.includes(point) ? '#ffa726' : '#66bb6a';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    info.textContent = 'Total points: ' + points.length + ' | Found in range: ' + found.length;
    requestAnimationFrame(animate);
}

animate();`,

    pooling: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class ObjectPool {
    constructor(createFn, resetFn, initialSize = 50) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        for (let i = 0; i < initialSize; i++) this.pool.push(this.createFn());
    }

    get(...args) {
        let object = this.pool.length > 0 ? this.pool.pop() : this.createFn();
        this.resetFn(object, ...args);
        this.active.push(object);
        return object;
    }

    release(object) {
        const index = this.active.indexOf(object);
        if (index !== -1) this.active.splice(index, 1);
        this.pool.push(object);
    }

    update() {
        for (let i = this.active.length - 1; i >= 0; i--) {
            if (!this.active[i].update()) this.release(this.active[i]);
        }
    }
}

let usePooling = true;
let objects = [];
let objectsCreated = 0;
let objectsDestroyed = 0;

const pool = new ObjectPool(
    () => {
        objectsCreated++;
        return {
            position: new Vector2D(0, 0),
            velocity: new Vector2D(0, 0),
            life: 1.0,
            update() {
                this.position.add(this.velocity);
                this.life -= 0.01;
                return this.life > 0;
            }
        };
    },
    (obj, x, y) => {
        obj.position.set(x, y);
        obj.velocity = Vector2D.random(randomFloat(2, 5));
        obj.life = 1.0;
    }
);

function spawnObject(x, y) {
    if (usePooling) {
        pool.get(x, y);
    } else {
        objectsCreated++;
        objects.push({
            position: new Vector2D(x, y),
            velocity: Vector2D.random(randomFloat(2, 5)),
            life: 1.0,
            update() {
                this.position.add(this.velocity);
                this.life -= 0.01;
                return this.life > 0;
            }
        });
    }
}

document.getElementById('btnWithPool').addEventListener('click', () => {
    usePooling = true;
    objects = [];
    pool.active = [];
    pool.pool = [];
    for (let i = 0; i < 50; i++) pool.pool.push(pool.createFn());
    objectsCreated = 50;
    objectsDestroyed = 0;
});

document.getElementById('btnWithoutPool').addEventListener('click', () => {
    usePooling = false;
    objects = [];
    pool.active = [];
    objectsCreated = 0;
    objectsDestroyed = 0;
});

document.getElementById('btnSpawnMany').addEventListener('click', () => {
    for (let i = 0; i < 100; i++) spawnObject(canvas.width / 2, canvas.height / 2);
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < 10; i++) spawnObject(e.clientX - rect.left, e.clientY - rect.top);
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    if (usePooling) {
        pool.update();
        pool.active.forEach(obj => {
            ctx.globalAlpha = obj.life;
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(obj.position.x, obj.position.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
        info.textContent = 'WITH POOLING | Active: ' + pool.active.length + ' | Pool: ' + pool.pool.length + ' | Created: ' + objectsCreated;
    } else {
        for (let i = objects.length - 1; i >= 0; i--) {
            if (!objects[i].update()) {
                objects.splice(i, 1);
                objectsDestroyed++;
            } else {
                ctx.globalAlpha = objects[i].life;
                ctx.fillStyle = '#ffa726';
                ctx.beginPath();
                ctx.arc(objects[i].position.x, objects[i].position.y, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        info.textContent = 'WITHOUT POOLING | Active: ' + objects.length + ' | Created: ' + objectsCreated + ' | Destroyed: ' + objectsDestroyed;
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
}

animate();`,

    noise: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class NoiseGenerator {
    constructor(seed = 0) {
        this.seed = seed;
    }

    hash(x, y) {
        let h = this.seed + x * 374761393 + y * 668265263;
        h = (h ^ (h >> 13)) * 1274126177;
        return (h ^ (h >> 16)) / 2147483648 + 0.5;
    }

    smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    noise(x, y) {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const xf = x - xi;
        const yf = y - yi;

        const n00 = this.hash(xi, yi);
        const n10 = this.hash(xi + 1, yi);
        const n01 = this.hash(xi, yi + 1);
        const n11 = this.hash(xi + 1, yi + 1);

        const sx = this.smoothstep(xf);
        const sy = this.smoothstep(yf);

        const nx0 = n00 + sx * (n10 - n00);
        const nx1 = n01 + sx * (n11 - n01);

        return nx0 + sy * (nx1 - nx0);
    }

    fractalNoise(x, y, octaves = 4) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return value / maxValue;
    }
}

let noise = new NoiseGenerator(Date.now());
let mode = 'terrain';

function generateTerrain() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const value = noise.fractalNoise(x * 0.01, y * 0.01, 5);
            const index = (y * canvas.width + x) * 4;

            if (mode === 'terrain') {
                if (value < 0.3) { data[index] = 50; data[index + 1] = 100; data[index + 2] = 200; }
                else if (value < 0.5) { data[index] = 194; data[index + 1] = 178; data[index + 2] = 128; }
                else if (value < 0.7) { data[index] = 100; data[index + 1] = 180; data[index + 2] = 100; }
                else { data[index] = 150; data[index + 1] = 150; data[index + 2] = 150; }
            } else if (mode === 'clouds') {
                const cloudValue = Math.floor(value * 255);
                data[index] = 150 + cloudValue * 0.4;
                data[index + 1] = 180 + cloudValue * 0.3;
                data[index + 2] = 255;
            } else if (mode === 'marble') {
                const marbleValue = Math.sin(x * 0.05 + value * 20);
                const color = Math.floor((marbleValue + 1) * 127.5);
                data[index] = color;
                data[index + 1] = color;
                data[index + 2] = color;
            }

            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    info.textContent = 'Mode: ' + mode + ' | Seed: ' + noise.seed;
}

document.getElementById('btnNewSeed').addEventListener('click', () => {
    noise = new NoiseGenerator(Date.now());
    generateTerrain();
});

document.getElementById('btnTerrain').addEventListener('click', () => { mode = 'terrain'; generateTerrain(); });
document.getElementById('btnClouds').addEventListener('click', () => { mode = 'clouds'; generateTerrain(); });
document.getElementById('btnMarble').addEventListener('click', () => { mode = 'marble'; generateTerrain(); });

generateTerrain();`,

    procgen: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

let scale = 0.05;
let showHeightmap = false;
let showContours = false;

class PerlinNoise {
    constructor() {
        this.p = [];
        for (let i = 0; i < 256; i++) this.p[i] = Math.floor(Math.random() * 256);
        this.p = this.p.concat(this.p);
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(a, b, t) { return a + t * (b - a); }

    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const a = this.p[X] + Y;
        const b = this.p[X + 1] + Y;
        return this.lerp(
            this.lerp(this.grad(this.p[a], x, y), this.grad(this.p[b], x - 1, y), u),
            this.lerp(this.grad(this.p[a + 1], x, y - 1), this.grad(this.p[b + 1], x - 1, y - 1), u),
            v
        );
    }

    octaveNoise(x, y, octaves = 4, persistence = 0.5) {
        let total = 0, frequency = 1, amplitude = 1, maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        return total / maxValue;
    }
}

let perlin = new PerlinNoise();

function getTileColor(height) {
    if (height < 0.3) return '#4A90E2';
    if (height < 0.4) return '#F5DEB3';
    if (height < 0.7) return '#7EC850';
    if (height < 0.9) return '#8B7355';
    return '#FFFFFF';
}

function hexToRgb(hex) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
}

function generateTerrain() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const value = perlin.octaveNoise(x * scale, y * scale, 4, 0.5);
            const height = (value + 1) / 2;
            const index = (y * canvas.width + x) * 4;

            if (showHeightmap) {
                const gray = Math.floor(height * 255);
                data[index] = gray;
                data[index + 1] = gray;
                data[index + 2] = gray;
            } else {
                const color = getTileColor(height);
                const rgb = hexToRgb(color);
                data[index] = rgb.r;
                data[index + 1] = rgb.g;
                data[index + 2] = rgb.b;
            }
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    info.textContent = 'Scale: ' + scale.toFixed(3) + ' | Heightmap: ' + (showHeightmap ? 'ON' : 'OFF') + ' | Contours: ' + (showContours ? 'ON' : 'OFF');
}

document.getElementById('btnNewSeed').addEventListener('click', () => { perlin = new PerlinNoise(); generateTerrain(); });
document.getElementById('btnIncreaseScale').addEventListener('click', () => { scale *= 0.8; generateTerrain(); });
document.getElementById('btnDecreaseScale').addEventListener('click', () => { scale *= 1.2; generateTerrain(); });
document.getElementById('btnToggleHeight').addEventListener('click', () => { showHeightmap = !showHeightmap; generateTerrain(); });
document.getElementById('btnToggleContours').addEventListener('click', () => { showContours = !showContours; generateTerrain(); });

generateTerrain();`,

    tilemap: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const tileSize = 25;
const cols = Math.floor(canvas.width / tileSize);
const rows = Math.floor(canvas.height / tileSize);
let tilemap = [];
let currentTile = 1;

for (let y = 0; y < rows; y++) {
    tilemap[y] = [];
    for (let x = 0; x < cols; x++) tilemap[y][x] = 0;
}

const tileColors = { 0: '#1a1f3a', 1: '#66bb6a', 2: '#9e9e9e', 3: '#4fc3f7' };
let isDrawing = false;

canvas.addEventListener('mousedown', () => isDrawing = true);
canvas.addEventListener('mouseup', () => isDrawing = false);

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / tileSize);
        const y = Math.floor((e.clientY - rect.top) / tileSize);
        if (x >= 0 && x < cols && y >= 0 && y < rows) tilemap[y][x] = currentTile;
    }
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);
    if (x >= 0 && x < cols && y >= 0 && y < rows) tilemap[y][x] = currentTile;
});

document.getElementById('btnGrass').addEventListener('click', () => currentTile = 1);
document.getElementById('btnWall').addEventListener('click', () => currentTile = 2);
document.getElementById('btnWater').addEventListener('click', () => currentTile = 3);
document.getElementById('btnErase').addEventListener('click', () => currentTile = 0);
document.getElementById('btnClearTilemap').addEventListener('click', () => {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) tilemap[y][x] = 0;
    }
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.fillStyle = tileColors[tilemap[y][x]];
            ctx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
        }
    }

    let counts = {0: 0, 1: 0, 2: 0, 3: 0};
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) counts[tilemap[y][x]]++;
    }

    const tileNames = {0: 'Empty', 1: 'Grass', 2: 'Wall', 3: 'Water'};
    info.textContent = 'Current: ' + tileNames[currentTile] + ' | Grass: ' + counts[1] + ' | Wall: ' + counts[2] + ' | Water: ' + counts[3];

    requestAnimationFrame(animate);
}

animate();`,

    ecs: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class Position { constructor(x, y) { this.x = x; this.y = y; } }
class Velocity { constructor(x, y) { this.x = x; this.y = y; } }
class Renderable { constructor(color) { this.color = color; } }

class Entity {
    static nextId = 0;
    constructor() {
        this.id = Entity.nextId++;
        this.components = new Map();
    }
    addComponent(component) { this.components.set(component.constructor, component); return this; }
    getComponent(componentClass) { return this.components.get(componentClass); }
    hasComponent(componentClass) { return this.components.has(componentClass); }
    removeComponent(componentClass) { this.components.delete(componentClass); return this; }
}

class World {
    constructor() { this.entities = []; this.systems = []; }
    createEntity() { const entity = new Entity(); this.entities.push(entity); return entity; }
    removeEntity(entity) { const index = this.entities.indexOf(entity); if (index !== -1) this.entities.splice(index, 1); }
    addSystem(system) { this.systems.push(system); }
    update(deltaTime) { for (const system of this.systems) system.update(this.entities, deltaTime); }
    query(...componentClasses) { return this.entities.filter(entity => componentClasses.every(comp => entity.hasComponent(comp))); }
}

class MovementSystem {
    update(entities) {
        for (const entity of entities) {
            if (!entity.hasComponent(Position) || !entity.hasComponent(Velocity)) continue;
            const pos = entity.getComponent(Position);
            const vel = entity.getComponent(Velocity);
            pos.x += vel.x;
            pos.y += vel.y;
            if (pos.x < 10 || pos.x > canvas.width - 10) { vel.x *= -1; pos.x = Math.max(10, Math.min(canvas.width - 10, pos.x)); }
            if (pos.y < 10 || pos.y > canvas.height - 10) { vel.y *= -1; pos.y = Math.max(10, Math.min(canvas.height - 10, pos.y)); }
        }
    }
}

class RenderSystem {
    update(entities) {
        for (const entity of entities) {
            if (!entity.hasComponent(Position) || !entity.hasComponent(Renderable)) continue;
            const pos = entity.getComponent(Position);
            const rend = entity.getComponent(Renderable);
            ctx.fillStyle = rend.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
            ctx.fill();
            if (entity.hasComponent(Velocity)) {
                const vel = entity.getComponent(Velocity);
                ctx.strokeStyle = '#66bb6a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                ctx.lineTo(pos.x + vel.x * 3, pos.y + vel.y * 3);
                ctx.stroke();
            }
        }
    }
}

const world = new World();
world.addSystem(new MovementSystem());
world.addSystem(new RenderSystem());

document.getElementById('btnSpawnMoving').addEventListener('click', () => {
    world.createEntity()
        .addComponent(new Position(Math.random() * canvas.width, Math.random() * canvas.height))
        .addComponent(new Velocity((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4))
        .addComponent(new Renderable('hsl(' + Math.random() * 360 + ', 70%, 60%)'));
});

document.getElementById('btnSpawnStatic').addEventListener('click', () => {
    world.createEntity()
        .addComponent(new Position(Math.random() * canvas.width, Math.random() * canvas.height))
        .addComponent(new Renderable('#999'));
});

document.getElementById('btnAddVelocity').addEventListener('click', () => {
    world.entities.forEach(entity => {
        if (!entity.hasComponent(Velocity)) {
            entity.addComponent(new Velocity((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4));
        }
    });
});

document.getElementById('btnRemoveVelocity').addEventListener('click', () => {
    world.entities.forEach(entity => entity.removeComponent(Velocity));
});

document.getElementById('btnClearECS').addEventListener('click', () => { world.entities = []; Entity.nextId = 0; });

for (let i = 0; i < 5; i++) {
    world.createEntity()
        .addComponent(new Position(Math.random() * canvas.width, Math.random() * canvas.height))
        .addComponent(new Velocity((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4))
        .addComponent(new Renderable('hsl(' + Math.random() * 360 + ', 70%, 60%)'));
}

for (let i = 0; i < 3; i++) {
    world.createEntity()
        .addComponent(new Position(Math.random() * canvas.width, Math.random() * canvas.height))
        .addComponent(new Renderable('#999'));
}

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    world.update(1);
    const movingEntities = world.query(Position, Velocity).length;
    const staticEntities = world.entities.filter(e => e.hasComponent(Position) && !e.hasComponent(Velocity)).length;
    info.textContent = 'Total Entities: ' + world.entities.length + ' | Moving: ' + movingEntities + ' | Static: ' + staticEntities;
    requestAnimationFrame(animate);
}

animate();`,

    sound: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const soundSources = [];
const obstacles = [];
const listener = { position: new Vector2D(canvas.width / 2, canvas.height / 2) };
const soundKeys = {};

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

function lineIntersectsRect(p1, p2, rect) {
    const left = rect.x, right = rect.x + rect.width;
    const top = rect.y, bottom = rect.y + rect.height;

    function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 0.0001) return false;
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    return lineIntersectsLine(p1.x, p1.y, p2.x, p2.y, left, top, right, top) ||
           lineIntersectsLine(p1.x, p1.y, p2.x, p2.y, right, top, right, bottom) ||
           lineIntersectsLine(p1.x, p1.y, p2.x, p2.y, left, bottom, right, bottom) ||
           lineIntersectsLine(p1.x, p1.y, p2.x, p2.y, left, top, left, bottom);
}

class SoundSource {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.maxDistance = 300;
    }

    calculateVolume(listenerPos) {
        const distance = this.position.distance(listenerPos);
        if (distance >= this.maxDistance) return 0;
        return 1 - (distance / this.maxDistance);
    }

    calculateOcclusion(listenerPos) {
        let occlusionFactor = 1.0;
        for (const obstacle of obstacles) {
            if (lineIntersectsRect(listenerPos, this.position, obstacle)) {
                occlusionFactor *= 0.3;
            }
        }
        return occlusionFactor;
    }

    draw(ctx, listenerPos) {
        const volume = this.calculateVolume(listenerPos);
        const occlusion = this.calculateOcclusion(listenerPos);
        const finalVolume = volume * occlusion;

        ctx.strokeStyle = 'rgba(100, 255, 100, ' + (finalVolume * 0.5) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.maxDistance, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = occlusion < 1 ? '#ff9800' : '#4caf50';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(Math.floor(finalVolume * 100) + '%', this.position.x - 15, this.position.y - 20);
    }
}

soundSources.push(new SoundSource(200, 200));
soundSources.push(new SoundSource(600, 300));

window.addEventListener('keydown', (e) => soundKeys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => soundKeys[e.key.toLowerCase()] = false);

document.getElementById('btnAddSoundSource').addEventListener('click', () => {
    soundSources.push(new SoundSource(randomFloat(100, canvas.width - 100), randomFloat(100, canvas.height - 100)));
});

document.getElementById('btnAddWall').addEventListener('click', () => {
    obstacles.push({
        x: randomFloat(100, canvas.width - 150),
        y: randomFloat(100, canvas.height - 150),
        width: randomFloat(50, 150),
        height: randomFloat(50, 150)
    });
});

document.getElementById('btnToggleSound').addEventListener('click', function() {
    this.textContent = this.textContent === 'Enable Sound' ? 'Disable Sound' : 'Enable Sound';
});

document.getElementById('btnClearSound').addEventListener('click', () => {
    soundSources.length = 0;
    obstacles.length = 0;
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    const dir = new Vector2D(
        (soundKeys.d ? 1 : 0) - (soundKeys.a ? 1 : 0),
        (soundKeys.s ? 1 : 0) - (soundKeys.w ? 1 : 0)
    );

    if (dir.length() > 0) listener.position.add(dir.normalize().multiply(4));
    listener.position.x = clamp(listener.position.x, 20, canvas.width - 20);
    listener.position.y = clamp(listener.position.y, 20, canvas.height - 20);

    soundSources.forEach(source => source.draw(ctx, listener.position));

    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#666';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    ctx.fillStyle = '#42a5f5';
    ctx.beginPath();
    ctx.arc(listener.position.x, listener.position.y, 15, 0, Math.PI * 2);
    ctx.fill();

    info.textContent = 'Sources: ' + soundSources.length + ' | Obstacles: ' + obstacles.length + ' | Use WASD to move listener';
    requestAnimationFrame(animate);
}

animate();`,

    network: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

let latency = 0;
let packetLoss = 0;
let usePrediction = true;
const networkKeys = {};

const player = {
    position: new Vector2D(canvas.width / 2, canvas.height / 2),
    serverPosition: new Vector2D(canvas.width / 2, canvas.height / 2),
    renderPosition: new Vector2D(canvas.width / 2, canvas.height / 2),
    inputSequence: 0,
    pendingInputs: [],
    speed: 4
};

window.addEventListener('keydown', (e) => networkKeys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => networkKeys[e.key.toLowerCase()] = false);

document.getElementById('btnAddLatency').addEventListener('click', () => latency += 100);
document.getElementById('btnTogglePrediction').addEventListener('click', () => usePrediction = !usePrediction);
document.getElementById('btnPacketLoss').addEventListener('click', () => packetLoss = packetLoss > 0 ? 0 : 0.2);
document.getElementById('btnResetNetwork').addEventListener('click', () => {
    latency = 0;
    packetLoss = 0;
    player.position.set(canvas.width / 2, canvas.height / 2);
    player.serverPosition.set(canvas.width / 2, canvas.height / 2);
    player.renderPosition.set(canvas.width / 2, canvas.height / 2);
});

function simulateSendToServer(input, sequence) {
    if (Math.random() < packetLoss) return;
    setTimeout(() => {
        player.serverPosition.add(input);
        setTimeout(() => receiveServerUpdate(player.serverPosition.copy(), sequence), latency / 2);
    }, latency / 2);
}

function receiveServerUpdate(serverPos, lastProcessedInput) {
    if (usePrediction) {
        player.pendingInputs = player.pendingInputs.filter(i => i.sequence > lastProcessedInput);
        player.position = serverPos.copy();
        for (const input of player.pendingInputs) player.position.add(input.input);
    } else {
        player.position = serverPos.copy();
    }
    player.renderPosition = player.position.copy();
}

function applyInput() {
    const input = new Vector2D(
        (networkKeys.d ? 1 : 0) - (networkKeys.a ? 1 : 0),
        (networkKeys.s ? 1 : 0) - (networkKeys.w ? 1 : 0)
    );

    if (input.length() > 0) {
        input.normalize().multiply(player.speed);
        player.inputSequence++;

        if (usePrediction) {
            player.pendingInputs.push({ input: input.copy(), sequence: player.inputSequence });
            player.position.add(input);
            simulateSendToServer(input.copy(), player.inputSequence);
        } else {
            simulateSendToServer(input.copy(), player.inputSequence);
        }
    }
}

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    applyInput();

    if (!usePrediction) {
        player.renderPosition.x += (player.position.x - player.renderPosition.x) * 0.2;
        player.renderPosition.y += (player.position.y - player.renderPosition.y) * 0.2;
    } else {
        player.renderPosition = player.position.copy();
    }

    player.renderPosition.x = clamp(player.renderPosition.x, 20, canvas.width - 20);
    player.renderPosition.y = clamp(player.renderPosition.y, 20, canvas.height - 20);

    // Draw grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    // Draw server position ghost
    ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
    ctx.beginPath();
    ctx.arc(player.serverPosition.x, player.serverPosition.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw player
    ctx.fillStyle = usePrediction ? '#42a5f5' : '#ff5722';
    ctx.beginPath();
    ctx.arc(player.renderPosition.x, player.renderPosition.y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText('Latency: ' + latency + 'ms', 10, 20);
    ctx.fillText('Packet Loss: ' + Math.floor(packetLoss * 100) + '%', 10, 40);
    ctx.fillText('Prediction: ' + (usePrediction ? 'ON' : 'OFF'), 10, 60);

    info.textContent = 'Pending Inputs: ' + player.pendingInputs.length + ' | Use WASD to move';
    requestAnimationFrame(animate);
}

animate();`,

    // ============ SIMULATION DEMOS ============

    fluid: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

class FluidGrid {
    constructor(width, height, scale) {
        this.cols = Math.floor(width / scale);
        this.rows = Math.floor(height / scale);
        this.scale = scale;
        this.vx = this.createGrid();
        this.vy = this.createGrid();
        this.vx0 = this.createGrid();
        this.vy0 = this.createGrid();
        this.density = this.createGrid();
        this.density0 = this.createGrid();
        this.p = this.createGrid();
        this.div = this.createGrid();
        this.visc = 0.0001;
        this.diff = 0.0001;
        this.fadeRate = 0.99;
        this.material = 'water';
        this.windY = 0;
    }

    createGrid() {
        const grid = [];
        for (let i = 0; i < this.rows; i++) grid[i] = new Array(this.cols).fill(0);
        return grid;
    }

    diffuse(x, x0, diffusion, dt) {
        const a = dt * diffusion * this.cols * this.rows;
        for (let iter = 0; iter < 20; iter++) {
            for (let i = 1; i < this.rows - 1; i++) {
                for (let j = 1; j < this.cols - 1; j++) {
                    x[i][j] = (x0[i][j] + a * (x[i-1][j] + x[i+1][j] + x[i][j-1] + x[i][j+1])) / (1 + 4 * a);
                }
            }
        }
    }

    advect(d, d0, vx, vy, dt) {
        const dt0 = dt * this.cols;
        for (let i = 1; i < this.rows - 1; i++) {
            for (let j = 1; j < this.cols - 1; j++) {
                let x = j - dt0 * vx[i][j];
                let y = i - dt0 * vy[i][j];
                x = Math.max(0.5, Math.min(this.cols - 1.5, x));
                y = Math.max(0.5, Math.min(this.rows - 1.5, y));
                const i0 = Math.floor(y), j0 = Math.floor(x);
                const s1 = x - j0, s0 = 1 - s1, t1 = y - i0, t0 = 1 - t1;
                d[i][j] = s0 * (t0 * d0[i0][j0] + t1 * d0[i0+1][j0]) + s1 * (t0 * d0[i0][j0+1] + t1 * d0[i0+1][j0+1]);
            }
        }
    }

    project(vx, vy, p, div) {
        for (let i = 1; i < this.rows - 1; i++) {
            for (let j = 1; j < this.cols - 1; j++) {
                div[i][j] = -0.5 * (vx[i][j+1] - vx[i][j-1] + vy[i+1][j] - vy[i-1][j]) / this.cols;
                p[i][j] = 0;
            }
        }
        for (let iter = 0; iter < 20; iter++) {
            for (let i = 1; i < this.rows - 1; i++) {
                for (let j = 1; j < this.cols - 1; j++) {
                    p[i][j] = (div[i][j] + p[i-1][j] + p[i+1][j] + p[i][j-1] + p[i][j+1]) / 4;
                }
            }
        }
        for (let i = 1; i < this.rows - 1; i++) {
            for (let j = 1; j < this.cols - 1; j++) {
                vx[i][j] -= 0.5 * this.cols * (p[i][j+1] - p[i][j-1]);
                vy[i][j] -= 0.5 * this.cols * (p[i+1][j] - p[i-1][j]);
            }
        }
    }

    step(dt = 0.016) {
        if (this.windY !== 0) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) this.vy[i][j] += this.windY * dt * 10;
            }
        }
        [this.vx0, this.vx] = [this.vx, this.vx0];
        [this.vy0, this.vy] = [this.vy, this.vy0];
        this.diffuse(this.vx, this.vx0, this.visc, dt);
        this.diffuse(this.vy, this.vy0, this.visc, dt);
        this.project(this.vx, this.vy, this.vx0, this.vy0);
        [this.vx0, this.vx] = [this.vx, this.vx0];
        [this.vy0, this.vy] = [this.vy, this.vy0];
        this.advect(this.vx, this.vx0, this.vx0, this.vy0, dt);
        this.advect(this.vy, this.vy0, this.vx0, this.vy0, dt);
        this.project(this.vx, this.vy, this.vx0, this.vy0);
        [this.density0, this.density] = [this.density, this.density0];
        this.diffuse(this.density, this.density0, this.diff, dt);
        [this.density0, this.density] = [this.density, this.density0];
        this.advect(this.density, this.density0, this.vx, this.vy, dt);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) this.density[i][j] *= this.fadeRate;
        }
    }

    addDensity(x, y, amount) {
        const i = Math.floor(y / this.scale), j = Math.floor(x / this.scale);
        if (i >= 0 && i < this.rows && j >= 0 && j < this.cols) this.density[i][j] += amount;
    }

    addVelocity(x, y, vx, vy) {
        const i = Math.floor(y / this.scale), j = Math.floor(x / this.scale);
        if (i >= 0 && i < this.rows && j >= 0 && j < this.cols) {
            this.vx[i][j] += vx;
            this.vy[i][j] += vy;
        }
    }

    getColor(density) {
        const d = Math.min(255, Math.floor(density));
        const alpha = Math.min(1, d / 255);
        switch(this.material) {
            case 'water': return 'rgba(30, ' + (100 + d * 0.4) + ', ' + (150 + d * 0.4) + ', ' + (alpha * 0.7) + ')';
            case 'smoke': return 'rgba(' + (100 + d * 0.6) + ', ' + (100 + d * 0.6) + ', ' + (120 + d * 0.5) + ', ' + (alpha * 0.5) + ')';
            case 'ink': return 'hsla(' + (d / 255 * 360) + ', 100%, 60%, ' + (alpha * 0.9) + ')';
            case 'honey': return 'rgba(' + (200 + d * 0.2) + ', ' + (140 + d * 0.2) + ', 30, ' + (alpha * 0.85) + ')';
            case 'gas': return 'rgba(' + (150 + d * 0.3) + ', ' + (200 + d * 0.2) + ', 120, ' + (alpha * 0.4) + ')';
            default: return 'rgba(' + d + ', ' + (d * 0.5) + ', ' + (255 - d) + ', ' + (d / 255) + ')';
        }
    }

    render(ctx) {
        const bgColors = {water: '#001020', smoke: '#0a0a0a', ink: '#000', honey: '#1a0f00', gas: '#0a1008'};
        ctx.fillStyle = bgColors[this.material] || '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.density[i][j] > 0) {
                    ctx.fillStyle = this.getColor(this.density[i][j]);
                    ctx.fillRect(j * this.scale, i * this.scale, this.scale, this.scale);
                }
            }
        }
    }
}

const fluid = new FluidGrid(canvas.width, canvas.height, 8);
let mouseDown = false, lastX = 0, lastY = 0;

canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
});

canvas.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    fluid.addDensity(x, y, 200);
    fluid.addVelocity(x, y, (x - lastX) * 10, (y - lastY) * 10);
    lastX = x; lastY = y;
});

canvas.addEventListener('mouseup', () => mouseDown = false);
canvas.addEventListener('mouseleave', () => mouseDown = false);

document.getElementById('btnWater').addEventListener('click', () => { fluid.material = 'water'; fluid.visc = 0.0001; fluid.diff = 0.0001; fluid.fadeRate = 0.99; fluid.windY = 0; });
document.getElementById('btnSmoke').addEventListener('click', () => { fluid.material = 'smoke'; fluid.visc = 0.00001; fluid.diff = 0.0005; fluid.fadeRate = 0.97; fluid.windY = -0.8; });
document.getElementById('btnInk').addEventListener('click', () => { fluid.material = 'ink'; fluid.visc = 0.0002; fluid.diff = 0.0003; fluid.fadeRate = 0.995; fluid.windY = 0; });
document.getElementById('btnClearFluid').addEventListener('click', () => { fluid.density = fluid.createGrid(); fluid.vx = fluid.createGrid(); fluid.vy = fluid.createGrid(); fluid.windY = 0; });

function animate() {
    fluid.step();
    fluid.render(ctx);
    info.textContent = 'Material: ' + fluid.material + ' | Drag to add fluid';
    requestAnimationFrame(animate);
}

animate();`,

    buoyancy: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

let waterLevel = 350;
const objects = [];

class PhysicsObject {
    constructor(x, y, width, height, density, color, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.density = density;
        this.color = color;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.mass = width * height * density / 1000;
    }

    update(dt) {
        const gravity = 800;
        const waterDensity = 1.0;
        const airResistance = 0.02;
        const waterResistance = 0.1;

        const bottomY = this.y + this.height;
        const topY = this.y;
        let submergedHeight = 0;
        if (bottomY > waterLevel && topY < waterLevel) {
            submergedHeight = bottomY - waterLevel;
        } else if (topY >= waterLevel) {
            submergedHeight = this.height;
        }

        const submergedFraction = submergedHeight / this.height;
        const buoyancyForce = submergedFraction * this.width * this.height * waterDensity * gravity / 1000;
        const gravityForce = this.mass * gravity;
        let netForce = gravityForce - buoyancyForce;

        this.vy += (netForce / this.mass) * dt;

        if (submergedFraction > 0) {
            this.vx *= (1 - waterResistance);
            this.vy *= (1 - waterResistance);
        } else {
            this.vx *= (1 - airResistance);
            this.vy *= (1 - airResistance);
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.x < 0) { this.x = 0; this.vx = -this.vx * 0.5; }
        if (this.x + this.width > canvas.width) { this.x = canvas.width - this.width; this.vx = -this.vx * 0.5; }
        if (this.y + this.height > canvas.height) { this.y = canvas.height - this.height; this.vy = -this.vy * 0.3; }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type, this.x + this.width / 2, this.y + this.height / 2 + 4);
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const types = ['BOX', 'STONE', 'BALL'];
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === 'BOX') objects.push(new PhysicsObject(x - 20, y - 20, 40, 40, 0.5, '#8B4513', 'BOX'));
    else if (type === 'STONE') objects.push(new PhysicsObject(x - 15, y - 15, 30, 30, 2.5, '#555', 'STONE'));
    else objects.push(new PhysicsObject(x - 15, y - 15, 30, 30, 0.3, '#FF6B6B', 'BALL'));
});

document.getElementById('btnAddBox').addEventListener('click', () => {
    objects.push(new PhysicsObject(randomFloat(50, canvas.width - 100), 50, 40, 40, 0.5, '#8B4513', 'BOX'));
});

document.getElementById('btnAddStone').addEventListener('click', () => {
    objects.push(new PhysicsObject(randomFloat(50, canvas.width - 100), 50, 30, 30, 2.5, '#555', 'STONE'));
});

document.getElementById('btnDrain').addEventListener('click', () => waterLevel = Math.min(waterLevel + 100, 500));
document.getElementById('btnFill').addEventListener('click', () => waterLevel = Math.max(waterLevel - 100, 200));
document.getElementById('btnResetBuoyancy').addEventListener('click', () => { objects.length = 0; waterLevel = 350; });

function animate() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(30, 144, 255, 0.6)';
    ctx.fillRect(0, waterLevel, canvas.width, canvas.height - waterLevel);

    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, waterLevel);
    ctx.lineTo(canvas.width, waterLevel);
    ctx.stroke();

    objects.forEach(obj => { obj.update(0.016); obj.draw(ctx); });

    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Water Level: ' + Math.floor(waterLevel) + 'px', 10, 20);
    ctx.fillText('Objects: ' + objects.length, 10, 40);
    info.textContent = 'Click canvas to add random objects!';
    requestAnimationFrame(animate);
}

animate();`,

    risingWater: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

let waterLevel = canvas.height;
let waterRising = false;
const RISE_SPEED = 0.5;

const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 30,
    height: 40,
    vy: 0,
    grounded: false
};

const platforms = [
    { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 },
    { x: 100, y: canvas.height - 100, width: 150, height: 20 },
    { x: 350, y: canvas.height - 180, width: 150, height: 20 },
    { x: 550, y: canvas.height - 260, width: 150, height: 20 },
    { x: 200, y: canvas.height - 340, width: 150, height: 20 },
    { x: 450, y: canvas.height - 420, width: 150, height: 20 }
];

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

document.getElementById('btnStartRising').addEventListener('click', () => waterRising = true);
document.getElementById('btnStopRising').addEventListener('click', () => waterRising = false);
document.getElementById('btnResetRising').addEventListener('click', () => {
    waterLevel = canvas.height;
    waterRising = false;
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    // Rising water
    if (waterRising && waterLevel > 50) waterLevel -= RISE_SPEED;

    // Player movement
    if (keys['ArrowLeft']) player.x -= 5;
    if (keys['ArrowRight']) player.x += 5;
    if (keys['ArrowUp'] && player.grounded) { player.vy = -12; player.grounded = false; }

    player.vy += 0.5; // Gravity
    player.y += player.vy;
    player.grounded = false;

    // Platform collision
    platforms.forEach(plat => {
        if (player.x + player.width > plat.x && player.x < plat.x + plat.width &&
            player.y + player.height > plat.y && player.y + player.height < plat.y + plat.height + 10 &&
            player.vy >= 0) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.grounded = true;
        }
    });

    // Draw water
    ctx.fillStyle = 'rgba(64, 164, 223, 0.7)';
    ctx.fillRect(0, waterLevel, canvas.width, canvas.height - waterLevel);

    // Draw platforms
    ctx.fillStyle = '#666';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // Draw player
    ctx.fillStyle = player.y + player.height > waterLevel ? '#ff6666' : '#66ff66';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    const inWater = player.y + player.height > waterLevel;
    info.textContent = 'Water Level: ' + Math.floor(waterLevel) + ' | Status: ' + (inWater ? 'DROWNING!' : 'Safe');

    requestAnimationFrame(animate);
}

animate();`,

    sph: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const particles = [];
const GRAVITY = new Vector2D(0, 0.2);
let gravityEnabled = true;
const REST_DENSITY = 3;
const GAS_CONST = 2;
const H = 25; // Smoothing radius
const VISCOSITY = 0.3;

class Particle {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.density = 0;
        this.pressure = 0;
    }
}

function kernel(r, h) {
    if (r >= h) return 0;
    const q = 1 - r / h;
    return q * q;
}

function computeDensityPressure() {
    particles.forEach(p => {
        p.density = 0;
        particles.forEach(other => {
            const r = p.pos.distance(other.pos);
            p.density += kernel(r, H);
        });
        p.pressure = GAS_CONST * (p.density - REST_DENSITY);
    });
}

function computeForces() {
    particles.forEach(p => {
        const force = new Vector2D(0, 0);

        if (gravityEnabled) force.add(GRAVITY);

        particles.forEach(other => {
            if (p === other) return;
            const diff = p.pos.copy().subtract(other.pos);
            const r = diff.length();
            if (r < H && r > 0) {
                // Pressure force
                const pressureForce = diff.normalize().multiply(
                    -(p.pressure + other.pressure) / 2 * kernel(r, H) * 0.1
                );
                force.add(pressureForce);

                // Viscosity
                const velDiff = other.vel.copy().subtract(p.vel);
                force.add(velDiff.multiply(VISCOSITY * kernel(r, H) * 0.01));
            }
        });

        p.vel.add(force);
        p.vel.multiply(0.99);
    });
}

function integrate() {
    particles.forEach(p => {
        p.pos.add(p.vel);

        // Boundary collision
        if (p.pos.x < 5) { p.pos.x = 5; p.vel.x *= -0.5; }
        if (p.pos.x > canvas.width - 5) { p.pos.x = canvas.width - 5; p.vel.x *= -0.5; }
        if (p.pos.y < 5) { p.pos.y = 5; p.vel.y *= -0.5; }
        if (p.pos.y > canvas.height - 5) { p.pos.y = canvas.height - 5; p.vel.y *= -0.5; }
    });
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x + randomFloat(-20, 20), y + randomFloat(-20, 20)));
    }
});

document.getElementById('btnAddWater').addEventListener('click', () => {
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(randomFloat(100, 300), randomFloat(50, 150)));
    }
});

document.getElementById('btnToggleGravity').addEventListener('click', () => gravityEnabled = !gravityEnabled);
document.getElementById('btnResetSPH').addEventListener('click', () => particles.length = 0);

// Initial particles
for (let i = 0; i < 100; i++) {
    particles.push(new Particle(randomFloat(100, 300), randomFloat(50, 200)));
}

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    computeDensityPressure();
    computeForces();
    integrate();

    // Draw particles
    particles.forEach(p => {
        const alpha = Math.min(1, p.density / 5);
        ctx.fillStyle = 'rgba(100, 180, 255, ' + (0.5 + alpha * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });

    info.textContent = 'Particles: ' + particles.length + ' | Gravity: ' + (gravityEnabled ? 'ON' : 'OFF') + ' | Click to add water';
    requestAnimationFrame(animate);
}

animate();`,

    flowPuzzle: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const particles = [];
const platforms = [
    { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
];
const goal = { x: canvas.width - 100, y: canvas.height - 60, width: 60, height: 40 };
let addingPlatform = false;
let score = 0;

class WaterParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = randomFloat(-1, 1);
        this.vy = 0;
    }

    update() {
        this.vy += 0.2; // Gravity
        this.x += this.vx;
        this.y += this.vy;

        // Platform collision
        platforms.forEach(p => {
            if (this.x > p.x && this.x < p.x + p.width &&
                this.y > p.y && this.y < p.y + p.height) {
                this.y = p.y;
                this.vy = -this.vy * 0.3;
                this.vx += randomFloat(-0.5, 0.5);
            }
        });

        // Walls
        if (this.x < 0) { this.x = 0; this.vx = Math.abs(this.vx); }
        if (this.x > canvas.width) { this.x = canvas.width; this.vx = -Math.abs(this.vx); }

        // Check goal
        if (this.x > goal.x && this.x < goal.x + goal.width &&
            this.y > goal.y && this.y < goal.y + goal.height) {
            score++;
            return false; // Remove particle
        }

        return this.y < canvas.height + 10;
    }
}

canvas.addEventListener('click', (e) => {
    if (!addingPlatform) return;
    const rect = canvas.getBoundingClientRect();
    platforms.push({
        x: e.clientX - rect.left - 40,
        y: e.clientY - rect.top,
        width: 80,
        height: 15
    });
});

document.getElementById('btnRelease').addEventListener('click', () => {
    for (let i = 0; i < 30; i++) {
        particles.push(new WaterParticle(100 + randomFloat(-20, 20), 50 + randomFloat(-10, 10)));
    }
});

document.getElementById('btnAddPlatform').addEventListener('click', () => {
    addingPlatform = !addingPlatform;
    document.getElementById('btnAddPlatform').textContent = addingPlatform ? 'Click Canvas!' : 'Add Platform';
});

document.getElementById('btnResetPuzzle').addEventListener('click', () => {
    particles.length = 0;
    platforms.length = 1; // Keep floor
    score = 0;
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
            particles.splice(i, 1);
        } else {
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(particles[i].x, particles[i].y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw platforms
    ctx.fillStyle = '#666';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // Draw goal
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText('GOAL', goal.x + 10, goal.y + 25);

    // Draw source
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(80, 30, 40, 30);
    ctx.fillStyle = '#fff';
    ctx.fillText('SRC', 85, 50);

    info.textContent = 'Score: ' + score + ' | Particles: ' + particles.length;
    requestAnimationFrame(animate);
}

animate();`,

    wind: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const GRID_SIZE = 30;
const cols = Math.ceil(canvas.width / GRID_SIZE);
const rows = Math.ceil(canvas.height / GRID_SIZE);

let windField = [];
for (let i = 0; i < rows; i++) {
    windField[i] = [];
    for (let j = 0; j < cols; j++) {
        windField[i][j] = new Vector2D(1 + Math.random() * 0.5, Math.sin(j * 0.3) * 0.5);
    }
}

const particles = [];
let showVectors = true;
let time = 0;

class WindParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.pos = new Vector2D(-10, randomFloat(0, canvas.height));
        this.life = randomFloat(100, 300);
    }

    update() {
        const gridX = Math.floor(this.pos.x / GRID_SIZE);
        const gridY = Math.floor(this.pos.y / GRID_SIZE);

        if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
            const wind = windField[gridY][gridX];
            this.pos.x += wind.x * 3;
            this.pos.y += wind.y * 3;
        } else {
            this.pos.x += 2;
        }

        this.life--;
        if (this.life <= 0 || this.pos.x > canvas.width + 10) this.reset();
    }
}

// Initialize particles
for (let i = 0; i < 200; i++) {
    const p = new WindParticle();
    p.pos.x = randomFloat(0, canvas.width);
    particles.push(p);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);

    // Create gust
    for (let di = -2; di <= 2; di++) {
        for (let dj = -2; dj <= 2; dj++) {
            const ni = gridY + di, nj = gridX + dj;
            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                const dist = Math.sqrt(di*di + dj*dj) + 1;
                windField[ni][nj].x += 3 / dist;
                windField[ni][nj].y += randomFloat(-1, 1) / dist;
            }
        }
    }
});

document.getElementById('toggleWindVectors').addEventListener('click', () => showVectors = !showVectors);
document.getElementById('resetWindDemo').addEventListener('click', () => {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            windField[i][j] = new Vector2D(1, Math.sin(j * 0.3) * 0.5);
        }
    }
});

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    time += 0.02;

    // Update wind with turbulence
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            windField[i][j].y += Math.sin(time + j * 0.5) * 0.02;
            windField[i][j].x = Math.max(0.5, windField[i][j].x * 0.99 + 0.01);
            windField[i][j].y *= 0.98;
        }
    }

    // Draw wind vectors
    if (showVectors) {
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = j * GRID_SIZE + GRID_SIZE / 2;
                const y = i * GRID_SIZE + GRID_SIZE / 2;
                const wind = windField[i][j];
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + wind.x * 10, y + wind.y * 10);
                ctx.stroke();
            }
        }
    }

    // Update and draw particles
    ctx.fillStyle = 'rgba(200, 230, 255, 0.8)';
    particles.forEach(p => {
        p.update();
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    info.textContent = 'Particles: ' + particles.length + ' | Vectors: ' + (showVectors ? 'ON' : 'OFF') + ' | Click for wind gust';
    requestAnimationFrame(animate);
}

animate();`,

    terrain: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

let imageData = ctx.createImageData(canvas.width, canvas.height);
const balls = [];

function generateTerrain() {
    const data = imageData.data;

    for (let x = 0; x < canvas.width; x++) {
        // Generate height using sine waves
        const height = canvas.height - 100 -
            Math.sin(x * 0.02) * 50 -
            Math.sin(x * 0.05) * 30 -
            Math.sin(x * 0.1) * 15;

        for (let y = 0; y < canvas.height; y++) {
            const idx = (y * canvas.width + x) * 4;
            if (y > height) {
                // Terrain colors based on depth
                const depth = y - height;
                if (depth < 20) {
                    data[idx] = 100; data[idx + 1] = 180; data[idx + 2] = 100; // Grass
                } else if (depth < 60) {
                    data[idx] = 139; data[idx + 1] = 90; data[idx + 2] = 43; // Dirt
                } else {
                    data[idx] = 100; data[idx + 1] = 100; data[idx + 2] = 100; // Rock
                }
                data[idx + 3] = 255;
            } else {
                data[idx] = 26; data[idx + 1] = 26; data[idx + 2] = 46;
                data[idx + 3] = 0; // Transparent (no terrain)
            }
        }
    }
}

function destroyCircle(cx, cy, radius) {
    const data = imageData.data;
    for (let y = cy - radius; y <= cy + radius; y++) {
        for (let x = cx - radius; x <= cx + radius; x++) {
            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist < radius) {
                const idx = (y * canvas.width + x) * 4;
                data[idx + 3] = 0; // Make transparent
            }
        }
    }
}

function isTerrainAt(x, y) {
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return false;
    const idx = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
    return imageData.data[idx + 3] > 0;
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = randomFloat(-2, 2);
        this.vy = 0;
        this.radius = 10;
    }

    update() {
        this.vy += 0.3; // Gravity
        this.x += this.vx;
        this.y += this.vy;

        // Terrain collision
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            const checkX = this.x + Math.cos(angle) * this.radius;
            const checkY = this.y + Math.sin(angle) * this.radius;
            if (isTerrainAt(checkX, checkY)) {
                // Bounce
                this.x -= this.vx;
                this.y -= this.vy;
                this.vx *= -0.5;
                this.vy *= -0.5;
                break;
            }
        }

        // Walls
        if (this.x < this.radius) { this.x = this.radius; this.vx *= -0.8; }
        if (this.x > canvas.width - this.radius) { this.x = canvas.width - this.radius; this.vx *= -0.8; }

        return this.y < canvas.height + 50;
    }
}

let mouseDown = false;
canvas.addEventListener('mousedown', () => mouseDown = true);
canvas.addEventListener('mouseup', () => mouseDown = false);
canvas.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    const rect = canvas.getBoundingClientRect();
    destroyCircle(e.clientX - rect.left, e.clientY - rect.top, 20);
});

document.getElementById('addBall').addEventListener('click', () => {
    balls.push(new Ball(randomFloat(100, canvas.width - 100), 50));
});

document.getElementById('resetTerrain').addEventListener('click', () => {
    generateTerrain();
    balls.length = 0;
});

generateTerrain();

function animate() {
    clearCanvas(ctx, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);

    // Update and draw balls
    for (let i = balls.length - 1; i >= 0; i--) {
        if (!balls[i].update()) {
            balls.splice(i, 1);
        } else {
            ctx.fillStyle = '#ff5722';
            ctx.beginPath();
            ctx.arc(balls[i].x, balls[i].y, balls[i].radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    info.textContent = 'Balls: ' + balls.length + ' | Click and drag to destroy terrain';
    requestAnimationFrame(animate);
}

animate();`,

    thermal: `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

const CELL_SIZE = 8;
const cols = Math.floor(canvas.width / CELL_SIZE);
const rows = Math.floor(canvas.height / CELL_SIZE);

const MATERIALS = {
    EMPTY: { id: 0, color: '#1a1a2e', flammable: false },
    WOOD: { id: 1, color: '#8B4513', flammable: true, burnTime: 200 },
    GRASS: { id: 2, color: '#228B22', flammable: true, burnTime: 50 },
    STONE: { id: 3, color: '#808080', flammable: false },
    FIRE: { id: 4, color: '#ff4500' },
    ASH: { id: 5, color: '#2f2f2f' }
};

let grid = [];
let burnTimers = [];
let currentMaterial = 'WOOD';
let isPlacing = false;

function initGrid() {
    grid = [];
    burnTimers = [];
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols).fill(0);
        burnTimers[i] = new Array(cols).fill(0);
    }

    // Generate some terrain
    for (let x = 0; x < cols; x++) {
        const height = rows - 5 - Math.floor(Math.sin(x * 0.1) * 3);
        for (let y = height; y < rows; y++) {
            grid[y][x] = MATERIALS.GRASS.id;
        }
    }
}

function spreadFire() {
    const newGrid = grid.map(row => [...row]);
    const newTimers = burnTimers.map(row => [...row]);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === MATERIALS.FIRE.id) {
                // Decrease burn timer
                newTimers[i][j]--;
                if (newTimers[i][j] <= 0) {
                    newGrid[i][j] = MATERIALS.ASH.id;
                    continue;
                }

                // Spread to neighbors
                const neighbors = [[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [-1,1], [1,-1], [1,1]];
                neighbors.forEach(([di, dj]) => {
                    const ni = i + di, nj = j + dj;
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                        const material = Object.values(MATERIALS).find(m => m.id === grid[ni][nj]);
                        if (material && material.flammable && Math.random() < 0.1) {
                            newGrid[ni][nj] = MATERIALS.FIRE.id;
                            newTimers[ni][nj] = material.burnTime;
                        }
                    }
                });
            }
        }
    }

    grid = newGrid;
    burnTimers = newTimers;
}

canvas.addEventListener('mousedown', () => isPlacing = true);
canvas.addEventListener('mouseup', () => isPlacing = false);
canvas.addEventListener('mousemove', (e) => {
    if (!isPlacing) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        grid[y][x] = MATERIALS[currentMaterial].id;
        if (currentMaterial === 'FIRE') {
            burnTimers[y][x] = 100;
        }
    }
});

document.getElementById('placeMaterial').addEventListener('click', () => currentMaterial = 'WOOD');
document.getElementById('placeGrass').addEventListener('click', () => currentMaterial = 'GRASS');
document.getElementById('ignite').addEventListener('click', () => currentMaterial = 'FIRE');
document.getElementById('resetThermal').addEventListener('click', initGrid);

initGrid();

function animate() {
    spreadFire();
    clearCanvas(ctx, canvas.width, canvas.height);

    let fireCount = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const material = Object.values(MATERIALS).find(m => m.id === grid[i][j]);
            if (material) {
                if (grid[i][j] === MATERIALS.FIRE.id) {
                    fireCount++;
                    // Animate fire
                    const flicker = Math.random() * 50;
                    ctx.fillStyle = 'rgb(' + (255 - flicker) + ', ' + (100 + flicker) + ', 0)';
                } else {
                    ctx.fillStyle = material.color;
                }
                ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
            }
        }
    }

    info.textContent = 'Material: ' + currentMaterial + ' | Fire cells: ' + fireCount + ' | Click to place, drag to paint';
    requestAnimationFrame(animate);
}

animate();`
};

const DEMO_HTML = {
    // ============ INTERMEDIATE DEMOS ============

    lerp: {
        title: 'Linear Interpolation (Lerp) Demo',
        canvas: { width: 800, height: 400 },
        controls: [
            { id: 'btnSlow', text: 'Slow (t=0.02)' },
            { id: 'btnMedium', text: 'Medium (t=0.1)' },
            { id: 'btnFast', text: 'Fast (t=0.3)' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Click anywhere to set a new target'
    },
    physics: {
        title: 'Physics Simulation Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAdd', text: 'Add Ball' },
            { id: 'btnGravity', text: 'Toggle Gravity' },
            { id: 'btnWind', text: 'Toggle Wind' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Click to apply force to nearby objects'
    },
    spaceship: {
        title: 'Spaceship Controller Demo',
        canvas: { width: 800, height: 600 },
        controls: [
            { id: 'btnThrust', text: '🚀 Thrust (W)' },
            { id: 'btnLeft', text: '← Left (A)' },
            { id: 'btnRight', text: '→ Right (D)' },
            { id: 'btnAddWell', text: 'Add Gravity Well' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Use W/A/D or buttons to control. Click to add gravity wells!'
    },
    spring: {
        title: 'Spring Physics Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnTight', text: 'Tight (k=0.2)' },
            { id: 'btnLoose', text: 'Loose (k=0.08)' },
            { id: 'btnBouncy', text: 'Bouncy (k=0.15)' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Drag and release to launch!'
    },
    verlet: {
        title: 'Verlet Physics Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAddRope', text: 'Add Rope' },
            { id: 'btnWind', text: 'Toggle Wind' },
            { id: 'btnCut', text: 'Cut Mode' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Drag points to interact!'
    },
    procedural: {
        title: 'Procedural Animation Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnButterfly', text: '🦋 Add Butterfly' },
            { id: 'btnFish', text: '🐟 Add Fish' },
            { id: 'btnClear', text: 'Clear All' }
        ],
        info: 'Watch the procedural animation magic!'
    },
    wave: {
        title: 'Wave Simulation Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnPhysical', text: 'Physical' },
            { id: 'btnStanding', text: 'Standing' },
            { id: 'btnTraveling', text: 'Traveling' },
            { id: 'btnInterference', text: 'Interference' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Click to create disturbances!'
    },
    friction: {
        title: 'Friction Demo',
        canvas: { width: 800, height: 400 },
        controls: [
            { id: 'btnNone', text: 'No Friction' },
            { id: 'btnLow', text: 'Low (Ice)' },
            { id: 'btnMedium', text: 'Medium (Grass)' },
            { id: 'btnHigh', text: 'High (Mud)' }
        ],
        info: 'Click to add objects!'
    },
    collision: {
        title: 'Collision Detection Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnCircle', text: 'Add Circle' },
            { id: 'btnRect', text: 'Add Rectangle' },
            { id: 'btnClear', text: 'Clear All' }
        ],
        info: 'Drag objects to move them!'
    },
    reflection: {
        title: 'Bouncing & Reflection Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnPerfect', text: 'Perfect (1.0)' },
            { id: 'btnNormal', text: 'Normal (0.8)' },
            { id: 'btnDead', text: 'Dead (0.3)' },
            { id: 'btnCollide', text: 'Ball Collisions' }
        ],
        info: 'Click to add bouncing balls!'
    },
    particles: {
        title: 'Particle System Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnExplosion', text: 'Explosion' },
            { id: 'btnFountain', text: 'Fountain' },
            { id: 'btnTrail', text: 'Trail Mode' }
        ],
        info: 'Click to emit particles!'
    },
    advancedParticles: {
        title: 'Advanced Particle Effects Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnFire', text: '🔥 Fire' },
            { id: 'btnSmoke', text: '💨 Smoke' },
            { id: 'btnSparkles', text: '✨ Sparkles' },
            { id: 'btnCombined', text: '🎆 Combined' },
            { id: 'btnClear', text: 'Clear' }
        ],
        info: 'Click to add sparkles!'
    },
    raycasting: {
        title: 'Raycasting Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAdd', text: 'Add Obstacle' },
            { id: 'btnClear', text: 'Clear Obstacles' }
        ],
        info: 'Move your mouse. Rays turn red when hitting obstacles!'
    },

    // ============ BEGINNER DEMOS ============

    vectorBasics: {
        title: 'Vector Basics Demo',
        canvas: { width: 800, height: 400 },
        controls: [
            { id: 'btnSimple', text: 'Simple Vector' },
            { id: 'btnPlayer', text: 'Player Movement' },
            { id: 'btnBullet', text: 'Bullet Direction' }
        ],
        info: 'Click buttons to see different vector examples'
    },
    vectorPlayground: {
        title: 'Vector Playground Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAdd', text: 'Add Object' },
            { id: 'btnClear', text: 'Clear All' }
        ],
        info: 'Drag to create vectors, objects bounce off walls!'
    },
    normalize: {
        title: 'Vector Normalization Demo',
        canvas: { width: 800, height: 400 },
        controls: [
            { id: 'btnNormalized', text: 'With Normalization' },
            { id: 'btnRaw', text: 'Without Normalization' }
        ],
        info: 'Use WASD to move. Notice diagonal speed difference!'
    },
    dotProduct: {
        title: 'Dot Product Demo',
        canvas: { width: 800, height: 400 },
        controls: [],
        info: 'Move mouse to see dot product in action!'
    },
    trig: {
        title: 'Trigonometry Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnOrbit', text: 'Orbit' },
            { id: 'btnWave', text: 'Wave Motion' },
            { id: 'btnAim', text: 'Aiming' }
        ],
        info: 'See trigonometry in game mechanics!'
    },
    easing: {
        title: 'Easing Functions Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnLinear', text: 'Linear' },
            { id: 'btnEaseIn', text: 'Ease In' },
            { id: 'btnEaseOut', text: 'Ease Out' },
            { id: 'btnEaseInOut', text: 'Ease In-Out' }
        ],
        info: 'Watch how different easing affects movement!'
    },
    game: {
        title: 'Simple Game Demo',
        canvas: { width: 800, height: 600 },
        controls: [
            { id: 'btnStart', text: 'Start Game' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Use arrow keys or WASD to move, collect coins!'
    },
    homingMissile: {
        title: 'Homing Missile Demo',
        canvas: { width: 800, height: 600 },
        controls: [
            { id: 'btnFire', text: 'Fire Missile' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Click to fire homing missiles at the target!'
    },

    // ============ ADVANCED DEMOS ============

    steering: {
        title: 'Steering Behaviors Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnSeek', text: 'Seek' },
            { id: 'btnFlee', text: 'Flee' },
            { id: 'btnWander', text: 'Wander' }
        ],
        info: 'Move mouse to see steering behaviors in action!'
    },
    quaternion: {
        title: 'Quaternion Rotation Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnRotateX', text: 'Rotate X' },
            { id: 'btnRotateY', text: 'Rotate Y' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Click buttons to rotate the 3D cube!'
    },
    bezier: {
        title: 'Bézier Curves Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnQuadratic', text: 'Quadratic' },
            { id: 'btnCubic', text: 'Cubic' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Drag control points to modify the curve!'
    },
    astar: {
        title: 'A* Pathfinding Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnFindPath', text: 'Find Path' },
            { id: 'btnClear', text: 'Clear Walls' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Click to place walls, then find path!'
    },
    flowField: {
        title: 'Flow Field Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAddAgent', text: 'Add Agent' },
            { id: 'btnClear', text: 'Clear' }
        ],
        info: 'Click to set target, agents follow flow field!'
    },
    state: {
        title: 'State Machine Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnSetTarget', text: 'Set Target' },
            { id: 'btnDamage', text: 'Damage Agent' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Watch the AI change states based on conditions!'
    },
    behaviorTree: {
        title: 'Behavior Tree Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnStep', text: 'Step' },
            { id: 'btnRun', text: 'Run' },
            { id: 'btnReset', text: 'Reset' }
        ],
        info: 'Watch the behavior tree make decisions!'
    },
    ik: {
        title: 'Inverse Kinematics Demo',
        canvas: { width: 800, height: 500 },
        controls: [],
        info: 'Move mouse to control the arm endpoint!'
    },
    shadow: {
        title: 'Raycasting Shadows Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAddWall', text: 'Add Wall' },
            { id: 'btnClear', text: 'Clear' }
        ],
        info: 'Move mouse as light source, see shadows cast!'
    },
    spatialHash: {
        title: 'Spatial Hash Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAdd', text: 'Add Objects' },
            { id: 'btnClear', text: 'Clear' }
        ],
        info: 'See how spatial hashing optimizes collision detection!'
    },

    // ============ EXPERT DEMOS ============

    quadtree: {
        title: 'QuadTree Spatial Partitioning Demo',
        canvas: { width: 800, height: 600 },
        controls: [
            { id: 'btnAddMany', text: 'Add 100 Objects' },
            { id: 'btnToggleTree', text: 'Toggle Tree' },
            { id: 'btnClearQuad', text: 'Clear All' }
        ],
        info: 'Move mouse to query region. Orange points are within query range!'
    },
    pooling: {
        title: 'Object Pooling Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnWithPool', text: 'With Pooling' },
            { id: 'btnWithoutPool', text: 'Without Pooling' },
            { id: 'btnSpawnMany', text: 'Spawn 100' }
        ],
        info: 'Click canvas to spawn. Compare memory allocation patterns!'
    },
    noise: {
        title: 'Noise Functions Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnNewSeed', text: 'New Seed' },
            { id: 'btnTerrain', text: 'Terrain' },
            { id: 'btnClouds', text: 'Clouds' },
            { id: 'btnMarble', text: 'Marble' }
        ],
        info: 'Procedural noise generation for terrain, clouds, and patterns!'
    },
    procgen: {
        title: 'Perlin Noise Terrain Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnNewSeed', text: 'New Seed' },
            { id: 'btnIncreaseScale', text: 'Zoom Out' },
            { id: 'btnDecreaseScale', text: 'Zoom In' },
            { id: 'btnToggleHeight', text: 'Toggle Heightmap' },
            { id: 'btnToggleContours', text: 'Toggle Contours' }
        ],
        info: 'True Perlin noise terrain with biome coloring!'
    },
    tilemap: {
        title: 'Tilemap Editor Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnGrass', text: 'Grass' },
            { id: 'btnWall', text: 'Wall' },
            { id: 'btnWater', text: 'Water' },
            { id: 'btnErase', text: 'Erase' },
            { id: 'btnClearTilemap', text: 'Clear' }
        ],
        info: 'Click and drag to paint tiles!'
    },
    ecs: {
        title: 'Entity Component System Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnSpawnMoving', text: 'Spawn Moving' },
            { id: 'btnSpawnStatic', text: 'Spawn Static' },
            { id: 'btnAddVelocity', text: 'Add Velocity' },
            { id: 'btnRemoveVelocity', text: 'Remove Velocity' },
            { id: 'btnClearECS', text: 'Clear' }
        ],
        info: 'Watch how components affect entity behavior!'
    },
    sound: {
        title: 'Sound Propagation Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAddSoundSource', text: 'Add Source' },
            { id: 'btnAddWall', text: 'Add Wall' },
            { id: 'btnToggleSound', text: 'Enable Sound' },
            { id: 'btnClearSound', text: 'Clear' }
        ],
        info: 'Use WASD to move listener. Walls occlude sound!'
    },
    network: {
        title: 'Network Interpolation Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAddLatency', text: 'Add 100ms Latency' },
            { id: 'btnTogglePrediction', text: 'Toggle Prediction' },
            { id: 'btnPacketLoss', text: 'Packet Loss' },
            { id: 'btnResetNetwork', text: 'Reset' }
        ],
        info: 'Use WASD to move. Green ghost shows server position!'
    },

    // ============ SIMULATION DEMOS ============

    fluid: {
        title: 'Fluid Simulation Demo',
        canvas: { width: 800, height: 600 },
        controls: [
            { id: 'btnWater', text: 'Water' },
            { id: 'btnSmoke', text: 'Smoke' },
            { id: 'btnInk', text: 'Ink' },
            { id: 'btnClearFluid', text: 'Clear' }
        ],
        info: 'Click and drag to add fluid. Watch it flow and diffuse!'
    },
    buoyancy: {
        title: 'Buoyancy Simulation Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAddBox', text: 'Add Box (Floats)' },
            { id: 'btnAddStone', text: 'Add Stone (Sinks)' },
            { id: 'btnDrain', text: 'Drain Water' },
            { id: 'btnFill', text: 'Fill Water' },
            { id: 'btnResetBuoyancy', text: 'Reset' }
        ],
        info: 'Objects float or sink based on density!'
    },
    risingWater: {
        title: 'Rising Water Challenge Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnStartRising', text: 'Start Rising' },
            { id: 'btnStopRising', text: 'Stop' },
            { id: 'btnResetRising', text: 'Reset' }
        ],
        info: 'Use arrow keys to move. Escape the rising water!'
    },
    sph: {
        title: 'SPH Water Particles Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAddWater', text: 'Add Water' },
            { id: 'btnToggleGravity', text: 'Toggle Gravity' },
            { id: 'btnResetSPH', text: 'Reset' }
        ],
        info: 'Click to add water particles. Watch them interact!'
    },
    flowPuzzle: {
        title: 'Water Flow Puzzle Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnRelease', text: 'Release Water' },
            { id: 'btnAddPlatform', text: 'Add Platform' },
            { id: 'btnResetPuzzle', text: 'Reset' }
        ],
        info: 'Guide water to the goal! Click to add platforms.'
    },
    wind: {
        title: 'Wind Field Simulation Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'toggleWindVectors', text: 'Toggle Vectors' },
            { id: 'resetWindDemo', text: 'Reset' }
        ],
        info: 'Click to create wind gusts. Watch particles flow!'
    },
    terrain: {
        title: 'Destructible Terrain Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'addBall', text: 'Drop Ball' },
            { id: 'resetTerrain', text: 'Reset' }
        ],
        info: 'Click and drag to destroy terrain!'
    },
    thermal: {
        title: 'Fire Spread Simulation Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'placeMaterial', text: 'Place Wood' },
            { id: 'placeGrass', text: 'Place Grass' },
            { id: 'ignite', text: 'Ignite Fire' },
            { id: 'resetThermal', text: 'Reset' }
        ],
        info: 'Place materials and start fires. Watch them spread!'
    }
};
