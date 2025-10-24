// ===================================
// INTERMEDIATE DEMOS - INTERACTIVE EXAMPLES
// ===================================

// Scroll to top functionality
const scrollToTopBtn = document.getElementById('scrollToTop');
if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        scrollToTopBtn.style.opacity = window.pageYOffset > 300 ? '1' : '0';
    });

    scrollToTopBtn.style.opacity = '0';
    scrollToTopBtn.style.transition = 'opacity 0.3s';
}

// ===================================
// DEMO 1: Linear Interpolation (Lerp)
// ===================================
const lerpCanvas = document.getElementById('lerpDemo');
if (lerpCanvas) {
    const ctx = lerpCanvas.getContext('2d');
    const info = document.getElementById('lerpInfo');

    const follower = new Vector2D(400, 200);
    let target = new Vector2D(600, 200);
    let lerpSpeed = 0.1;

    lerpCanvas.addEventListener('click', (e) => {
        const rect = lerpCanvas.getBoundingClientRect();
        target.x = e.clientX - rect.left;
        target.y = e.clientY - rect.top;
    });

    document.getElementById('btnSlowLerp').addEventListener('click', () => lerpSpeed = 0.02);
    document.getElementById('btnMediumLerp').addEventListener('click', () => lerpSpeed = 0.1);
    document.getElementById('btnFastLerp').addEventListener('click', () => lerpSpeed = 0.3);
    document.getElementById('btnResetLerp').addEventListener('click', () => {
        follower.set(400, 200);
        target.set(600, 200);
    });

    function animateLerp() {
        clearCanvas(ctx, lerpCanvas.width, lerpCanvas.height);
        drawGrid(ctx, lerpCanvas.width, lerpCanvas.height);

        // Lerp toward target
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
        info.textContent = `Lerp speed: ${lerpSpeed.toFixed(2)} | Distance to target: ${distance.toFixed(1)}`;

        requestAnimationFrame(animateLerp);
    }

    animateLerp();
}

// ===================================
// DEMO 2: Physics Simulation
// ===================================
const physicsCanvas = document.getElementById('physicsDemo');
if (physicsCanvas) {
    const ctx = physicsCanvas.getContext('2d');
    const info = document.getElementById('physicsInfo');

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
            this.velocity.multiply(0.99); // Air resistance
            this.position.add(this.velocity);
            this.acceleration.multiply(0);

            // Bounce off walls
            if (this.position.x < this.radius || this.position.x > physicsCanvas.width - this.radius) {
                this.velocity.x *= -0.8;
                this.position.x = clamp(this.position.x, this.radius, physicsCanvas.width - this.radius);
            }
            if (this.position.y < this.radius || this.position.y > physicsCanvas.height - this.radius) {
                this.velocity.y *= -0.8;
                this.position.y = clamp(this.position.y, this.radius, physicsCanvas.height - this.radius);
            }
        }

        draw(ctx) {
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw velocity vector
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

    document.getElementById('btnAddBall').addEventListener('click', () => {
        const x = randomFloat(50, physicsCanvas.width - 50);
        const y = randomFloat(50, 200);
        balls.push(new Ball(x, y, randomFloat(10, 20)));
    });

    document.getElementById('btnToggleGravity').addEventListener('click', () => {
        gravityEnabled = !gravityEnabled;
    });

    document.getElementById('btnAddWind').addEventListener('click', () => {
        windEnabled = !windEnabled;
    });

    document.getElementById('btnResetPhysics').addEventListener('click', () => {
        balls.length = 0;
    });

    physicsCanvas.addEventListener('click', (e) => {
        const rect = physicsCanvas.getBoundingClientRect();
        const clickPos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);

        balls.forEach(ball => {
            const dist = ball.position.distance(clickPos);
            if (dist < 150) {
                const force = ball.position.subtract(clickPos).normalize().multiply(10);
                ball.applyForce(force);
            }
        });
    });

    function animatePhysics() {
        clearCanvas(ctx, physicsCanvas.width, physicsCanvas.height);

        balls.forEach(ball => {
            if (gravityEnabled) ball.applyForce(gravity);
            if (windEnabled) ball.applyForce(wind);
            ball.update();
            ball.draw(ctx);
        });

        info.textContent = `Balls: ${balls.length} | Gravity: ${gravityEnabled ? 'ON' : 'OFF'} | Wind: ${windEnabled ? 'ON' : 'OFF'}`;

        requestAnimationFrame(animatePhysics);
    }

    // Add some initial balls
    for (let i = 0; i < 3; i++) {
        balls.push(new Ball(randomFloat(100, physicsCanvas.width - 100), 100, 15));
    }

    animatePhysics();
}

// ===================================
// DEMO 3: Collision Detection
// ===================================
const collisionCanvas = document.getElementById('collisionDemo');
if (collisionCanvas) {
    const ctx = collisionCanvas.getContext('2d');
    const info = document.getElementById('collisionInfo');

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

    document.getElementById('btnAddCircle').addEventListener('click', () => {
        const x = randomFloat(50, collisionCanvas.width - 50);
        const y = randomFloat(50, collisionCanvas.height - 50);
        objects.push(new CollidableCircle(x, y));
    });

    document.getElementById('btnAddRect').addEventListener('click', () => {
        const x = randomFloat(50, collisionCanvas.width - 100);
        const y = randomFloat(50, collisionCanvas.height - 100);
        objects.push(new CollidableRect(x, y));
    });

    document.getElementById('btnClearCollision').addEventListener('click', () => {
        objects.length = 0;
    });

    collisionCanvas.addEventListener('mousedown', (e) => {
        const rect = collisionCanvas.getBoundingClientRect();
        const mousePos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);

        for (let obj of objects) {
            if (obj instanceof CollidableCircle) {
                if (obj.position.distance(mousePos) < obj.radius) {
                    dragging = obj;
                    break;
                }
            } else if (obj instanceof CollidableRect) {
                if (mousePos.x >= obj.position.x && mousePos.x <= obj.position.x + obj.width &&
                    mousePos.y >= obj.position.y && mousePos.y <= obj.position.y + obj.height) {
                    dragging = obj;
                    break;
                }
            }
        }
    });

    collisionCanvas.addEventListener('mousemove', (e) => {
        if (dragging) {
            const rect = collisionCanvas.getBoundingClientRect();
            dragging.position.x = e.clientX - rect.left;
            dragging.position.y = e.clientY - rect.top;
        }
    });

    collisionCanvas.addEventListener('mouseup', () => {
        dragging = null;
    });

    function animateCollision() {
        clearCanvas(ctx, collisionCanvas.width, collisionCanvas.height);

        // Reset collision flags
        objects.forEach(obj => obj.colliding = false);

        // Check all pairs for collisions
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                if (objects[i].checkCollision(objects[j])) {
                    objects[i].colliding = true;
                    objects[j].colliding = true;
                }
            }
        }

        objects.forEach(obj => obj.draw(ctx));

        const collisionCount = objects.filter(obj => obj.colliding).length;
        info.textContent = `Objects: ${objects.length} | Colliding: ${collisionCount}`;

        requestAnimationFrame(animateCollision);
    }

    // Add initial objects
    objects.push(new CollidableCircle(200, 250));
    objects.push(new CollidableCircle(400, 250));
    objects.push(new CollidableRect(300, 200));

    animateCollision();
}

// ===================================
// DEMO 4: Raycasting
// ===================================
const raycastCanvas = document.getElementById('raycastDemo');
if (raycastCanvas) {
    const ctx = raycastCanvas.getContext('2d');
    const info = document.getElementById('raycastInfo');

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

    const obstacles = [];
    const rayOrigin = new Vector2D(400, 250);
    let mousePos = new Vector2D(600, 250);

    document.getElementById('btnAddObstacle').addEventListener('click', () => {
        const x = randomFloat(100, raycastCanvas.width - 100);
        const y = randomFloat(100, raycastCanvas.height - 100);
        obstacles.push(new Obstacle(x, y, randomFloat(20, 40)));
    });

    document.getElementById('btnClearRaycast').addEventListener('click', () => {
        obstacles.length = 0;
    });

    raycastCanvas.addEventListener('mousemove', (e) => {
        const rect = raycastCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    function rayIntersectsCircle(origin, direction, center, radius) {
        const oc = origin.subtract(center);
        const a = direction.dot(direction);
        const b = 2 * oc.dot(direction);
        const c = oc.dot(oc) - radius * radius;
        const discriminant = b * b - 4 * a * c;
        return discriminant >= 0;
    }

    function animateRaycast() {
        clearCanvas(ctx, raycastCanvas.width, raycastCanvas.height);

        // Calculate ray direction
        const direction = mousePos.subtract(rayOrigin).normalize();

        // Check which obstacles are hit
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
        const rayEnd = new Vector2D(
            rayOrigin.x + direction.x * 1000,
            rayOrigin.y + direction.y * 1000
        );
        ctx.strokeStyle = hitCount > 0 ? '#ef5350' : '#ffa726';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rayOrigin.x, rayOrigin.y);
        ctx.lineTo(rayEnd.x, rayEnd.y);
        ctx.stroke();

        info.textContent = `Obstacles hit: ${hitCount} / ${obstacles.length}`;

        requestAnimationFrame(animateRaycast);
    }

    // Add initial obstacles
    for (let i = 0; i < 5; i++) {
        obstacles.push(new Obstacle(
            randomFloat(100, raycastCanvas.width - 100),
            randomFloat(100, raycastCanvas.height - 100),
            randomFloat(20, 40)
        ));
    }

    animateRaycast();
}

// ===================================
// DEMO 5: Particle System
// ===================================
const particleCanvas = document.getElementById('particleDemo');
if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    const info = document.getElementById('particleInfo');

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
            ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    const particles = [];
    let currentMode = 'explosion';
    let trailMode = false;

    function emit(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, currentMode));
        }
    }

    document.getElementById('btnExplosion').addEventListener('click', () => {
        currentMode = 'explosion';
        trailMode = false;
    });

    document.getElementById('btnFountain').addEventListener('click', () => {
        currentMode = 'fountain';
        trailMode = false;
    });

    document.getElementById('btnTrail').addEventListener('click', () => {
        trailMode = !trailMode;
    });

    particleCanvas.addEventListener('click', (e) => {
        if (!trailMode) {
            const rect = particleCanvas.getBoundingClientRect();
            emit(e.clientX - rect.left, e.clientY - rect.top, 50);
        }
    });

    particleCanvas.addEventListener('mousemove', (e) => {
        if (trailMode) {
            const rect = particleCanvas.getBoundingClientRect();
            emit(e.clientX - rect.left, e.clientY - rect.top, 5);
        }
    });

    function animateParticles() {
        clearCanvas(ctx, particleCanvas.width, particleCanvas.height);

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            if (!particles[i].update()) {
                particles.splice(i, 1);
            } else {
                particles[i].draw(ctx);
            }
        }

        info.textContent = `Active particles: ${particles.length} | Mode: ${currentMode} | Trail: ${trailMode ? 'ON' : 'OFF'}`;

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}
