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
// DEMO 2.5: Spaceship Controller with Gravity Wells
// ===================================
const spaceshipCanvas = document.getElementById('spaceshipDemo');
if (spaceshipCanvas) {
    const ctx = spaceshipCanvas.getContext('2d');
    const info = document.getElementById('spaceshipInfo');

    class Spaceship {
        constructor(x, y) {
            this.position = new Vector2D(x, y);
            this.velocity = new Vector2D(0, 0);
            this.acceleration = new Vector2D(0, 0);
            this.angle = -Math.PI / 2; // Start pointing up
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

        rotateLeft() {
            this.rotation = -this.rotationSpeed;
        }

        rotateRight() {
            this.rotation = this.rotationSpeed;
        }

        update() {
            // Update rotation
            this.angle += this.rotation;
            this.rotation *= 0.85; // Damping

            // Update physics
            this.velocity.add(this.acceleration);

            // Speed limit
            const speed = this.velocity.length();
            if (speed > 10) {
                this.velocity.normalize().multiply(10);
            }

            this.position.add(this.velocity);

            // Reset acceleration
            this.acceleration.multiply(0);

            // Wrap around screen edges
            if (this.position.x < 0) this.position.x = spaceshipCanvas.width;
            if (this.position.x > spaceshipCanvas.width) this.position.x = 0;
            if (this.position.y < 0) this.position.y = spaceshipCanvas.height;
            if (this.position.y > spaceshipCanvas.height) this.position.y = 0;

            this.thrusting = false;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.angle);

            // Draw spaceship as triangle
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

            // Draw thrust flame when thrusting
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

            // Draw velocity vector
            const velEnd = new Vector2D(
                this.position.x + this.velocity.x * 10,
                this.position.y + this.velocity.y * 10
            );
            if (this.velocity.length() > 0.5) {
                drawVector(ctx, this.position, velEnd, '#66bb6a', 2);
            }
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

            // Newton's law of gravitation
            const G = 1;
            const strength = (G * this.mass * entity.mass) / (distance * distance);

            force.normalize().multiply(strength);
            entity.applyForce(force);
        }

        draw(ctx) {
            // Draw gravity well
            ctx.fillStyle = '#9c27b0';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw gravity field rings
            ctx.strokeStyle = 'rgba(156, 39, 176, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius + i * 30, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Draw center
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let spaceship = new Spaceship(400, 300);
    const gravityWells = [
        new GravityWell(400, 450, 150)
    ];

    // Keyboard controls
    const keys = {};
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Button controls
    document.getElementById('btnSpaceshipThrust').addEventListener('mousedown', () => {
        keys['w'] = true;
    });
    document.getElementById('btnSpaceshipThrust').addEventListener('mouseup', () => {
        keys['w'] = false;
    });

    document.getElementById('btnSpaceshipLeft').addEventListener('mousedown', () => {
        keys['a'] = true;
    });
    document.getElementById('btnSpaceshipLeft').addEventListener('mouseup', () => {
        keys['a'] = false;
    });

    document.getElementById('btnSpaceshipRight').addEventListener('mousedown', () => {
        keys['d'] = true;
    });
    document.getElementById('btnSpaceshipRight').addEventListener('mouseup', () => {
        keys['d'] = false;
    });

    document.getElementById('btnAddGravityWell').addEventListener('click', () => {
        const x = randomFloat(100, spaceshipCanvas.width - 100);
        const y = randomFloat(100, spaceshipCanvas.height - 100);
        gravityWells.push(new GravityWell(x, y, randomFloat(80, 150)));
    });

    document.getElementById('btnRemoveGravityWell').addEventListener('click', () => {
        if (gravityWells.length > 0) {
            gravityWells.pop();
        }
    });

    document.getElementById('btnResetSpaceship').addEventListener('click', () => {
        spaceship = new Spaceship(400, 300);
        gravityWells.length = 0;
        gravityWells.push(new GravityWell(400, 450, 150));
    });

    // Click to add gravity well
    spaceshipCanvas.addEventListener('click', (e) => {
        const rect = spaceshipCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gravityWells.push(new GravityWell(x, y, 120));
    });

    function animateSpaceship() {
        clearCanvas(ctx, spaceshipCanvas.width, spaceshipCanvas.height);

        // Draw starfield background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % spaceshipCanvas.width;
            const y = (i * 217.3) % spaceshipCanvas.height;
            ctx.fillRect(x, y, 2, 2);
        }

        // Handle input
        if (keys['w'] || keys['arrowup']) {
            spaceship.thrust();
        }
        if (keys['a'] || keys['arrowleft']) {
            spaceship.rotateLeft();
        }
        if (keys['d'] || keys['arrowright']) {
            spaceship.rotateRight();
        }

        // Apply gravity from all wells
        gravityWells.forEach(well => {
            well.attract(spaceship);
            well.draw(ctx);
        });

        spaceship.update();
        spaceship.draw(ctx);

        const speed = spaceship.velocity.length();
        info.textContent = `Speed: ${speed.toFixed(2)} | Gravity Wells: ${gravityWells.length} | Controls: W=Thrust, A/D=Rotate`;

        requestAnimationFrame(animateSpaceship);
    }

    animateSpaceship();
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

// ===================================
// DEMO: Spring Physics - Interactive Launcher
// ===================================
const springCanvas = document.getElementById('springDemo');
if (springCanvas) {
    const ctx = springCanvas.getContext('2d');
    const info = document.getElementById('springInfo');

    // Launcher anchor point
    const anchorPos = new Vector2D(150, 400);

    // Projectile class
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
            // Apply gravity
            this.velocity.y += 0.3;

            // Update position
            this.position.add(this.velocity);

            // Update trail
            this.trail.push(this.position.copy());
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }

            // Remove if off screen
            if (this.position.x > springCanvas.width + 50 ||
                this.position.y > springCanvas.height + 50) {
                this.alive = false;
            }

            // Bounce off ground
            if (this.position.y > springCanvas.height - this.radius) {
                this.position.y = springCanvas.height - this.radius;
                this.velocity.y *= -0.6; // Bounce with energy loss
                this.velocity.x *= 0.9; // Ground friction
            }

            // Bounce off walls
            if (this.position.x > springCanvas.width - this.radius) {
                this.position.x = springCanvas.width - this.radius;
                this.velocity.x *= -0.6;
            }
        }

        draw(ctx) {
            // Draw trail
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

            // Draw projectile
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Target zones for hitting
    const targets = [
        { x: 500, y: springCanvas.height - 80, width: 60, height: 80, hit: false, color: '#66bb6a' },
        { x: 650, y: springCanvas.height - 120, width: 60, height: 120, hit: false, color: '#ffa726' },
        { x: 720, y: springCanvas.height - 60, width: 50, height: 60, hit: false, color: '#ef5350' }
    ];

    let projectiles = [];
    let isDragging = false;
    let dragPos = anchorPos.copy();
    let stiffness = 0.15; // Spring stiffness constant
    let score = 0;

    // Mouse interaction
    springCanvas.addEventListener('mousedown', (e) => {
        const rect = springCanvas.getBoundingClientRect();
        const mousePos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);

        // Check if near anchor
        if (mousePos.distance(anchorPos) < 100) {
            isDragging = true;
        }
    });

    springCanvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = springCanvas.getBoundingClientRect();
            dragPos.x = e.clientX - rect.left;
            dragPos.y = e.clientY - rect.top;

            // Limit drag distance
            const displacement = dragPos.subtract(anchorPos);
            const maxDistance = 150;
            if (displacement.length() > maxDistance) {
                dragPos = anchorPos.copy().add(displacement.normalize().multiply(maxDistance));
            }
        }
    });

    springCanvas.addEventListener('mouseup', () => {
        if (isDragging) {
            // Calculate spring force and launch projectile
            const displacement = anchorPos.subtract(dragPos);
            const launchForce = displacement.multiply(stiffness);

            // Create projectile at drag position
            projectiles.push(new Projectile(
                dragPos.x,
                dragPos.y,
                launchForce.x,
                launchForce.y
            ));

            isDragging = false;
            dragPos = anchorPos.copy();
        }
    });

    // Button handlers to change spring stiffness
    const btnTight = document.getElementById('btnTightSpring');
    const btnLoose = document.getElementById('btnLooseSpring');
    const btnBouncy = document.getElementById('btnBouncySpring');
    const btnStiff = document.getElementById('btnStiffSpring');

    if (btnTight) btnTight.addEventListener('click', () => {
        stiffness = 0.2;
        targets.forEach(t => t.hit = false);
        projectiles = [];
        score = 0;
    });
    if (btnLoose) btnLoose.addEventListener('click', () => {
        stiffness = 0.08;
        targets.forEach(t => t.hit = false);
        projectiles = [];
        score = 0;
    });
    if (btnBouncy) btnBouncy.addEventListener('click', () => {
        stiffness = 0.15;
        targets.forEach(t => t.hit = false);
        projectiles = [];
        score = 0;
    });
    if (btnStiff) btnStiff.addEventListener('click', () => {
        stiffness = 0.25;
        targets.forEach(t => t.hit = false);
        projectiles = [];
        score = 0;
    });

    function drawSpringBand(ctx, start, end) {
        // Draw elastic band using quadratic curve
        ctx.strokeStyle = '#66bb6a';
        ctx.lineWidth = 4;
        ctx.beginPath();

        // Control point for curve (perpendicular to middle)
        const mid = new Vector2D(
            (start.x + end.x) / 2,
            (start.y + end.y) / 2
        );
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
                if (!target.hit &&
                    proj.position.x > target.x &&
                    proj.position.x < target.x + target.width &&
                    proj.position.y > target.y &&
                    proj.position.y < target.y + target.height) {
                    target.hit = true;
                    score += 10;
                }
            });
        });
    }

    function animateSpring() {
        clearCanvas(ctx, springCanvas.width, springCanvas.height);

        // Draw ground
        ctx.fillStyle = '#424242';
        ctx.fillRect(0, springCanvas.height - 20, springCanvas.width, 20);

        // Draw targets
        targets.forEach(target => {
            ctx.fillStyle = target.hit ? '#424242' : target.color;
            ctx.fillRect(target.x, target.y, target.width, target.height);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(target.x, target.y, target.width, target.height);

            if (!target.hit) {
                // Draw bullseye
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(target.x + target.width / 2, target.y + target.height / 2, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw anchor base
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        ctx.arc(anchorPos.x, anchorPos.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // If dragging, draw the spring and projectile
        if (isDragging) {
            // Draw spring bands (slingshot)
            const bandOffset = 15;
            const anchorLeft = anchorPos.copy().add(new Vector2D(-bandOffset, 0));
            const anchorRight = anchorPos.copy().add(new Vector2D(bandOffset, 0));

            drawSpringBand(ctx, anchorLeft, dragPos);
            drawSpringBand(ctx, anchorRight, dragPos);

            // Draw projectile at drag position
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(dragPos.x, dragPos.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw spring force vector
            const displacement = anchorPos.subtract(dragPos);
            const springForce = displacement.multiply(stiffness);
            const forceScale = 5;

            ctx.strokeStyle = '#ffa726';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(dragPos.x, dragPos.y);
            ctx.lineTo(dragPos.x + springForce.x * forceScale, dragPos.y + springForce.y * forceScale);
            ctx.stroke();

            // Draw arrow head
            const arrowEnd = new Vector2D(
                dragPos.x + springForce.x * forceScale,
                dragPos.y + springForce.y * forceScale
            );
            const angle = Math.atan2(springForce.y, springForce.x);
            ctx.fillStyle = '#ffa726';
            ctx.beginPath();
            ctx.moveTo(arrowEnd.x, arrowEnd.y);
            ctx.lineTo(
                arrowEnd.x - 10 * Math.cos(angle - Math.PI / 6),
                arrowEnd.y - 10 * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                arrowEnd.x - 10 * Math.cos(angle + Math.PI / 6),
                arrowEnd.y - 10 * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();

            // Display spring info
            const pullDistance = displacement.length();
            const force = springForce.length();
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Pull: ${pullDistance.toFixed(0)}px`, dragPos.x + 20, dragPos.y - 20);
            ctx.fillText(`Force: ${force.toFixed(1)}`, dragPos.x + 20, dragPos.y - 5);
        }

        // Update and draw projectiles
        projectiles = projectiles.filter(proj => proj.alive);
        projectiles.forEach(proj => {
            proj.update();
            proj.draw(ctx);
        });

        // Check collisions
        checkTargetCollisions();

        // Info display
        const displacement = anchorPos.subtract(dragPos);
        const springForceCalc = displacement.multiply(stiffness);

        info.textContent = `Spring Stiffness: ${stiffness.toFixed(2)} | ${isDragging ? `Pull Distance: ${displacement.length().toFixed(0)}px | Launch Force: ${springForceCalc.length().toFixed(1)}` : 'Click and drag near the launcher to pull back the spring!'} | Score: ${score}`;

        // Instructions
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Drag the launcher to aim and release to fire!', springCanvas.width / 2, 30);
        ctx.font = '12px Arial';
        ctx.fillText('Hit all targets to win. Try different spring stiffness values!', springCanvas.width / 2, 50);

        requestAnimationFrame(animateSpring);
    }

    animateSpring();
}

// ===================================
// DEMO: Verlet Physics - Rope Simulation
// ===================================
const verletCanvas = document.getElementById('verletDemo');
if (verletCanvas) {
    const ctx = verletCanvas.getContext('2d');
    const info = document.getElementById('verletInfo');

    // VerletPoint class
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

            // Calculate velocity implicitly
            const velocity = this.position.copy().subtract(this.oldPosition);

            // Save current position
            const temp = this.position.copy();

            // Verlet integration
            this.position.add(velocity);
            this.position.add(this.acceleration.copy().multiply(dt * dt));

            // Store old position
            this.oldPosition = temp;

            // Reset acceleration
            this.acceleration.multiply(0);
        }

        applyForce(force) {
            this.acceleration.add(force);
        }

        constrain(bounds) {
            // Keep point within canvas bounds
            if (this.position.x < 0) {
                this.position.x = 0;
                this.oldPosition.x = this.position.x;
            }
            if (this.position.x > bounds.width) {
                this.position.x = bounds.width;
                this.oldPosition.x = this.position.x;
            }
            if (this.position.y < 0) {
                this.position.y = 0;
                this.oldPosition.y = this.position.y;
            }
            if (this.position.y > bounds.height) {
                this.position.y = bounds.height;
                this.oldPosition.y = this.position.y;
            }
        }

        draw(ctx) {
            ctx.fillStyle = this.pinned ? '#ff5252' : '#42a5f5';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Constraint class
    class Constraint {
        constructor(p1, p2, length = null) {
            this.p1 = p1;
            this.p2 = p2;
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

            if (!this.p1.pinned) {
                this.p1.position.add(correctionVector);
            }
            if (!this.p2.pinned) {
                // Subtract by adding negative vector
                this.p2.position.add(correctionVector.copy().multiply(-1));
            }
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

    // Rope class
    class Rope {
        constructor(startX, startY, segments = 10, segmentLength = 20, pinFirst = true, pinLast = false) {
            this.points = [];
            this.constraints = [];

            // Create points
            for (let i = 0; i <= segments; i++) {
                const x = startX;
                const y = startY + i * segmentLength;
                const pinned = (i === 0 && pinFirst) || (i === segments && pinLast);
                this.points.push(new VerletPoint(x, y, pinned));
            }

            // Create constraints
            for (let i = 0; i < segments; i++) {
                this.constraints.push(new Constraint(this.points[i], this.points[i + 1], segmentLength));
            }
        }

        update(gravity, wind = new Vector2D(0, 0)) {
            // Apply forces
            this.points.forEach(point => {
                point.applyForce(gravity);
                point.applyForce(wind);
            });

            // Update positions
            this.points.forEach(point => {
                point.update();
                point.constrain({ width: verletCanvas.width, height: verletCanvas.height });
            });

            // Solve constraints (multiple iterations for stability)
            for (let i = 0; i < 3; i++) {
                this.constraints.forEach(constraint => {
                    constraint.solve();
                });
            }
        }

        draw(ctx) {
            // Draw constraints
            this.constraints.forEach(constraint => constraint.draw(ctx));
            // Draw points
            this.points.forEach(point => point.draw(ctx));
        }
    }

    // Cloth class (2D grid of points)
    class Cloth {
        constructor(startX, startY, cols, rows, spacing) {
            this.points = [];
            this.constraints = [];

            // Create grid of points
            for (let y = 0; y <= rows; y++) {
                this.points[y] = [];
                for (let x = 0; x <= cols; x++) {
                    const pinned = (y === 0); // Pin top row
                    this.points[y][x] = new VerletPoint(
                        startX + x * spacing,
                        startY + y * spacing,
                        pinned
                    );
                }
            }

            // Create constraints (horizontal, vertical, and diagonal for stability)
            for (let y = 0; y <= rows; y++) {
                for (let x = 0; x <= cols; x++) {
                    // Horizontal
                    if (x < cols) {
                        this.constraints.push(new Constraint(this.points[y][x], this.points[y][x + 1]));
                    }
                    // Vertical
                    if (y < rows) {
                        this.constraints.push(new Constraint(this.points[y][x], this.points[y + 1][x]));
                    }
                    // Diagonal (for shear resistance)
                    if (x < cols && y < rows) {
                        this.constraints.push(new Constraint(this.points[y][x], this.points[y + 1][x + 1]));
                        this.constraints.push(new Constraint(this.points[y][x + 1], this.points[y + 1][x]));
                    }
                }
            }
        }

        getAllPoints() {
            return this.points.flat();
        }

        update(gravity, wind = new Vector2D(0, 0)) {
            const allPoints = this.getAllPoints();

            // Apply forces
            allPoints.forEach(point => {
                point.applyForce(gravity);
                point.applyForce(wind);
            });

            // Update positions
            allPoints.forEach(point => {
                point.update();
                point.constrain({ width: verletCanvas.width, height: verletCanvas.height });
            });

            // Solve constraints
            for (let i = 0; i < 3; i++) {
                this.constraints.forEach(constraint => constraint.solve());
            }
        }

        draw(ctx) {
            this.constraints.forEach(constraint => constraint.draw(ctx));
            this.getAllPoints().forEach(point => point.draw(ctx));
        }
    }

    // Ragdoll class (stick figure)
    class Ragdoll {
        constructor(x, y, scale = 1) {
            this.points = {};
            this.constraints = [];

            const s = scale; // Scale factor for size

            // Create body points (from top to bottom)
            this.points.head = new VerletPoint(x, y, false);
            this.points.neck = new VerletPoint(x, y + 20 * s, false);
            this.points.chest = new VerletPoint(x, y + 40 * s, false);
            this.points.waist = new VerletPoint(x, y + 70 * s, false);

            // Arms
            this.points.leftShoulder = new VerletPoint(x - 10 * s, y + 35 * s, false);
            this.points.leftElbow = new VerletPoint(x - 25 * s, y + 55 * s, false);
            this.points.leftHand = new VerletPoint(x - 35 * s, y + 75 * s, false);

            this.points.rightShoulder = new VerletPoint(x + 10 * s, y + 35 * s, false);
            this.points.rightElbow = new VerletPoint(x + 25 * s, y + 55 * s, false);
            this.points.rightHand = new VerletPoint(x + 35 * s, y + 75 * s, false);

            // Legs
            this.points.leftHip = new VerletPoint(x - 8 * s, y + 75 * s, false);
            this.points.leftKnee = new VerletPoint(x - 10 * s, y + 105 * s, false);
            this.points.leftFoot = new VerletPoint(x - 12 * s, y + 135 * s, false);

            this.points.rightHip = new VerletPoint(x + 8 * s, y + 75 * s, false);
            this.points.rightKnee = new VerletPoint(x + 10 * s, y + 105 * s, false);
            this.points.rightFoot = new VerletPoint(x + 12 * s, y + 135 * s, false);

            // Create constraints (skeleton structure)
            // Spine
            this.addConstraint('head', 'neck');
            this.addConstraint('neck', 'chest');
            this.addConstraint('chest', 'waist');

            // Left arm
            this.addConstraint('chest', 'leftShoulder');
            this.addConstraint('leftShoulder', 'leftElbow');
            this.addConstraint('leftElbow', 'leftHand');

            // Right arm
            this.addConstraint('chest', 'rightShoulder');
            this.addConstraint('rightShoulder', 'rightElbow');
            this.addConstraint('rightElbow', 'rightHand');

            // Left leg
            this.addConstraint('waist', 'leftHip');
            this.addConstraint('leftHip', 'leftKnee');
            this.addConstraint('leftKnee', 'leftFoot');

            // Right leg
            this.addConstraint('waist', 'rightHip');
            this.addConstraint('rightHip', 'rightKnee');
            this.addConstraint('rightKnee', 'rightFoot');

            // Cross-body constraints for stability
            this.addConstraint('leftShoulder', 'rightShoulder');
            this.addConstraint('leftHip', 'rightHip');
            this.addConstraint('leftShoulder', 'rightHip');
            this.addConstraint('rightShoulder', 'leftHip');
        }

        addConstraint(name1, name2) {
            this.constraints.push(new Constraint(this.points[name1], this.points[name2]));
        }

        getAllPoints() {
            return Object.values(this.points);
        }

        update(gravity, wind = new Vector2D(0, 0)) {
            const allPoints = this.getAllPoints();

            // Apply forces
            allPoints.forEach(point => {
                point.applyForce(gravity);
                point.applyForce(wind);
            });

            // Update positions
            allPoints.forEach(point => {
                point.update();
                point.constrain({ width: verletCanvas.width, height: verletCanvas.height });
            });

            // Solve constraints (more iterations for ragdoll stability)
            for (let i = 0; i < 5; i++) {
                this.constraints.forEach(constraint => constraint.solve());
            }
        }

        draw(ctx) {
            // Draw constraints (bones)
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 4;
            this.constraints.forEach(constraint => {
                if (constraint.active) {
                    ctx.beginPath();
                    ctx.moveTo(constraint.p1.position.x, constraint.p1.position.y);
                    ctx.lineTo(constraint.p2.position.x, constraint.p2.position.y);
                    ctx.stroke();
                }
            });

            // Draw joints (points) with different sizes
            this.getAllPoints().forEach((point, index) => {
                ctx.fillStyle = point.pinned ? '#ff5252' : '#42a5f5';
                const radius = point === this.points.head ? 8 : 5;
                ctx.beginPath();
                ctx.arc(point.position.x, point.position.y, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Draw head as larger circle
            ctx.fillStyle = '#ffb74d';
            ctx.beginPath();
            ctx.arc(this.points.head.position.x, this.points.head.position.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Simulation state
    let ropes = [];
    let cloths = [];
    let ragdolls = [];
    const gravity = new Vector2D(0, 0.5);
    let wind = new Vector2D(0, 0);
    let windEnabled = false;
    let cutMode = false;
    let draggedPoint = null;

    // Add initial rope
    ropes.push(new Rope(400, 50, 15, 20));

    // Mouse interaction
    let mousePos = new Vector2D(0, 0);

    verletCanvas.addEventListener('mousemove', (e) => {
        const rect = verletCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;

        if (draggedPoint) {
            draggedPoint.position.x = mousePos.x;
            draggedPoint.position.y = mousePos.y;
            draggedPoint.oldPosition.x = mousePos.x;
            draggedPoint.oldPosition.y = mousePos.y;
        }
    });

    verletCanvas.addEventListener('mousedown', (e) => {
        const rect = verletCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;

        if (cutMode) {
            // Cut mode - find and deactivate nearby constraint
            let cutMade = false;
            [...ropes, ...cloths, ...ragdolls].forEach(obj => {
                obj.constraints.forEach(constraint => {
                    const midPoint = new Vector2D(
                        (constraint.p1.position.x + constraint.p2.position.x) / 2,
                        (constraint.p1.position.y + constraint.p2.position.y) / 2
                    );
                    if (mousePos.distance(midPoint) < 10) {
                        constraint.active = false;
                        cutMade = true;
                    }
                });
            });
            if (cutMade) {
                info.textContent = 'Constraint cut! Continue cutting or exit cut mode.';
            }
        } else {
            // Drag mode - find nearest point
            let minDist = Infinity;
            let closest = null;

            [...ropes, ...cloths, ...ragdolls].forEach(obj => {
                const points = obj.points ? (Array.isArray(obj.points[0]) ? obj.getAllPoints() : obj.points) : [];
                points.forEach(point => {
                    const dist = mousePos.distance(point.position);
                    if (dist < minDist && dist < 20) {
                        minDist = dist;
                        closest = point;
                    }
                });
            });

            if (closest && !closest.pinned) {
                draggedPoint = closest;
            }
        }
    });

    verletCanvas.addEventListener('mouseup', () => {
        draggedPoint = null;
    });

    // Button handlers
    document.getElementById('btnAddRope').addEventListener('click', () => {
        const x = randomFloat(100, verletCanvas.width - 100);
        ropes.push(new Rope(x, 50, 12, 25));
        info.textContent = 'New rope added! Drag points to interact.';
    });

    document.getElementById('btnAddCloth').addEventListener('click', () => {
        cloths = []; // Remove old cloth
        ropes = []; // Clear ropes
        ragdolls = []; // Clear ragdolls
        const cols = 12;
        const rows = 10;
        const spacing = 25;
        const startX = (verletCanvas.width - cols * spacing) / 2;
        cloths.push(new Cloth(startX, 50, cols, rows, spacing));
        info.textContent = 'Cloth created! Drag points to see it deform.';
    });

    document.getElementById('btnAddRagdoll').addEventListener('click', () => {
        const x = randomFloat(150, verletCanvas.width - 150);
        ragdolls.push(new Ragdoll(x, 50, 1));
        info.textContent = 'Ragdoll added! Drag limbs and watch it fall naturally.';
    });

    document.getElementById('btnToggleWind').addEventListener('click', () => {
        windEnabled = !windEnabled;
        wind = windEnabled ? new Vector2D(0.3, 0) : new Vector2D(0, 0);
        info.textContent = windEnabled ? 'Wind enabled! Watch the physics objects sway.' : 'Wind disabled.';
    });

    document.getElementById('btnCutRope').addEventListener('click', () => {
        cutMode = !cutMode;
        info.textContent = cutMode ? 'CUT MODE: Click on constraints to cut them!' : 'Cut mode disabled. Drag points to interact.';
    });

    document.getElementById('btnResetVerlet').addEventListener('click', () => {
        ropes = [new Rope(400, 50, 15, 20)];
        cloths = [];
        ragdolls = [];
        windEnabled = false;
        wind = new Vector2D(0, 0);
        cutMode = false;
        draggedPoint = null;
        info.textContent = 'Reset! Drag points to interact with the rope.';
    });

    function animateVerlet() {
        clearCanvas(ctx, verletCanvas.width, verletCanvas.height);
        drawGrid(ctx, verletCanvas.width, verletCanvas.height);

        // Update and draw ropes
        ropes.forEach(rope => {
            rope.update(gravity, wind);
            rope.draw(ctx);
        });

        // Update and draw cloths
        cloths.forEach(cloth => {
            cloth.update(gravity, wind);
            cloth.draw(ctx);
        });

        // Update and draw ragdolls
        ragdolls.forEach(ragdoll => {
            ragdoll.update(gravity, wind);
            ragdoll.draw(ctx);
        });

        // Draw cursor indicator
        if (cutMode) {
            ctx.strokeStyle = '#ff5252';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(mousePos.x, mousePos.y, 15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mousePos.x - 10, mousePos.y);
            ctx.lineTo(mousePos.x + 10, mousePos.y);
            ctx.moveTo(mousePos.x, mousePos.y - 10);
            ctx.lineTo(mousePos.x, mousePos.y + 10);
            ctx.stroke();
        }

        // Display info
        if (!info.textContent || info.textContent.includes('undefined')) {
            info.textContent = cutMode ? 'CUT MODE: Click constraints to cut!' : 'Drag points to interact with the rope!';
        }

        requestAnimationFrame(animateVerlet);
    }

    animateVerlet();
}

// ===================================
// DEMO: Procedural Animation - Living Creatures
// ===================================
const proceduralCanvas = document.getElementById('proceduralDemo');
if (proceduralCanvas) {
    const ctx = proceduralCanvas.getContext('2d');
    const info = document.getElementById('proceduralInfo');

    // Butterfly - Uses figure-8 pattern and wing flapping
    class Butterfly {
        constructor(x, y) {
            this.position = new Vector2D(x, y);
            this.time = Math.random() * Math.PI * 2;
            this.speed = randomFloat(0.8, 1.5);
            this.size = randomFloat(20, 30);
            this.color = `hsl(${Math.random() * 60 + 280}, 70%, 65%)`;
            this.pathScale = randomFloat(80, 120);
            this.wingPhase = 0;
        }

        update(dt) {
            this.time += dt * this.speed;
            this.wingPhase += dt * 12;

            // Figure-8 flight pattern (Lissajous curve)
            this.position.x += Math.sin(this.time * 0.8) * 0.5;
            this.position.y += Math.sin(this.time * 1.6) * 0.3;

            // Wrap around screen
            if (this.position.x > proceduralCanvas.width + 50) this.position.x = -50;
            if (this.position.x < -50) this.position.x = proceduralCanvas.width + 50;
            if (this.position.y > proceduralCanvas.height + 50) this.position.y = -50;
            if (this.position.y < -50) this.position.y = proceduralCanvas.height + 50;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);

            const angle = Math.atan2(Math.sin(this.time * 1.6), Math.sin(this.time * 0.8));
            ctx.rotate(angle);

            // Wing flapping animation
            const wingAngle = Math.sin(this.wingPhase) * 0.5;

            // Left wing
            ctx.save();
            ctx.rotate(-wingAngle);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(-this.size * 0.3, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // Right wing
            ctx.save();
            ctx.rotate(wingAngle);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(this.size * 0.3, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // Body
            ctx.fillStyle = '#212121';
            ctx.fillRect(-this.size * 0.15, -this.size * 0.6, this.size * 0.3, this.size * 1.2);

            ctx.restore();
        }
    }

    // Fish - Swimming motion with tail wagging
    class Fish {
        constructor(x, y) {
            this.position = new Vector2D(x, y);
            this.velocity = new Vector2D(randomFloat(-1, 1), randomFloat(-1, 1));
            this.time = Math.random() * Math.PI * 2;
            this.size = randomFloat(25, 40);
            this.color = `hsl(${Math.random() * 60 + 180}, 70%, 60%)`;
            this.tailPhase = 0;
            this.targetAngle = 0;
            this.currentAngle = 0;
            this.changeDirectionTimer = randomFloat(2, 4);
        }

        update(dt) {
            this.time += dt;
            this.tailPhase += dt * 8;
            this.changeDirectionTimer -= dt;

            // Change direction occasionally
            if (this.changeDirectionTimer <= 0) {
                this.targetAngle = Math.random() * Math.PI * 2;
                this.changeDirectionTimer = randomFloat(2, 4);
            }

            // Smoothly rotate toward target direction
            let angleDiff = this.targetAngle - this.currentAngle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.currentAngle += angleDiff * dt * 2;

            // Move forward in current direction
            const speed = 50;
            this.velocity.x = Math.cos(this.currentAngle) * speed * dt;
            this.velocity.y = Math.sin(this.currentAngle) * speed * dt;

            this.position.add(this.velocity);

            // Wrap around screen
            if (this.position.x > proceduralCanvas.width + 50) this.position.x = -50;
            if (this.position.x < -50) this.position.x = proceduralCanvas.width + 50;
            if (this.position.y > proceduralCanvas.height + 50) this.position.y = -50;
            if (this.position.y < -50) this.position.y = proceduralCanvas.height + 50;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.currentAngle);

            // Body
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tail wagging
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

            // Eye
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

    // Jellyfish - Pulsing body with trailing tentacles
    class Jellyfish {
        constructor(x, y) {
            this.position = new Vector2D(x, y);
            this.velocity = new Vector2D(0, 0);
            this.time = Math.random() * Math.PI * 2;
            this.size = randomFloat(30, 50);
            this.color = `hsl(${Math.random() * 60 + 280}, 60%, 65%)`;
            this.pulsePhase = 0;
            this.tentacles = [];

            // Create tentacle segments
            const tentacleCount = 8;
            for (let i = 0; i < tentacleCount; i++) {
                const segments = [];
                for (let j = 0; j < 6; j++) {
                    segments.push(new Vector2D(x, y + j * 10));
                }
                this.tentacles.push(segments);
            }
        }

        update(dt) {
            this.time += dt;
            this.pulsePhase += dt * 4;

            // Pulsing movement
            const pulse = Math.sin(this.pulsePhase);
            if (pulse > 0) {
                this.velocity.y -= pulse * 0.3;
            }

            // Drift horizontally
            this.velocity.x += Math.sin(this.time * 0.5) * 0.05;

            // Apply velocity
            this.position.add(this.velocity);

            // Damping
            this.velocity.multiply(0.98);

            // Update tentacles (follow with delay)
            this.tentacles.forEach((segments, i) => {
                const angle = (i / this.tentacles.length) * Math.PI * 2;
                const baseX = this.position.x + Math.cos(angle) * this.size * 0.3;
                const baseY = this.position.y + this.size * 0.5;

                segments[0].x += (baseX - segments[0].x) * 0.2;
                segments[0].y += (baseY - segments[0].y) * 0.2;

                for (let j = 1; j < segments.length; j++) {
                    segments[j].x += (segments[j - 1].x - segments[j].x) * 0.15;
                    segments[j].y += (segments[j - 1].y - segments[j].y) * 0.15;

                    // Add wave motion
                    segments[j].x += Math.sin(this.time * 3 + j * 0.5 + i) * 0.5;
                }
            });

            // Wrap around screen
            if (this.position.x > proceduralCanvas.width + 100) this.position.x = -100;
            if (this.position.x < -100) this.position.x = proceduralCanvas.width + 100;
            if (this.position.y > proceduralCanvas.height + 100) this.position.y = -100;
            if (this.position.y < -100) this.position.y = proceduralCanvas.height + 100;
        }

        draw(ctx) {
            // Draw tentacles first
            this.tentacles.forEach(segments => {
                ctx.strokeStyle = this.color.replace('65%', '45%');
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(segments[0].x, segments[0].y);
                for (let i = 1; i < segments.length; i++) {
                    ctx.lineTo(segments[i].x, segments[i].y);
                }
                ctx.stroke();
            });

            // Draw body
            ctx.save();
            ctx.translate(this.position.x, this.position.y);

            const pulse = Math.abs(Math.sin(this.pulsePhase)) * 0.2 + 0.8;
            ctx.scale(pulse, pulse);

            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();

            // Inner circle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    let creatures = [];
    let lastTime = performance.now();

    // Controls
    document.getElementById('btnAddButterfly').addEventListener('click', () => {
        const x = randomFloat(100, proceduralCanvas.width - 100);
        const y = randomFloat(100, proceduralCanvas.height - 100);
        creatures.push(new Butterfly(x, y));
    });

    document.getElementById('btnAddFish').addEventListener('click', () => {
        const x = randomFloat(100, proceduralCanvas.width - 100);
        const y = randomFloat(100, proceduralCanvas.height - 100);
        creatures.push(new Fish(x, y));
    });

    document.getElementById('btnAddJellyfish').addEventListener('click', () => {
        const x = randomFloat(100, proceduralCanvas.width - 100);
        const y = randomFloat(100, proceduralCanvas.height - 100);
        creatures.push(new Jellyfish(x, y));
    });

    document.getElementById('btnClearCreatures').addEventListener('click', () => {
        creatures = [];
    });

    // Add some initial creatures
    for (let i = 0; i < 2; i++) {
        creatures.push(new Butterfly(randomFloat(100, 700), randomFloat(100, 400)));
    }
    creatures.push(new Fish(randomFloat(100, 700), randomFloat(100, 400)));

    function animateProcedural(currentTime) {
        const dt = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        clearCanvas(ctx, proceduralCanvas.width, proceduralCanvas.height);
        drawGrid(ctx, proceduralCanvas.width, proceduralCanvas.height);

        // Update and draw all creatures
        creatures.forEach(creature => {
            creature.update(dt);
            creature.draw(ctx);
        });

        // Draw info
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Watch the procedural animation magic!', proceduralCanvas.width / 2, 30);

        const butterflyCount = creatures.filter(c => c instanceof Butterfly).length;
        const fishCount = creatures.filter(c => c instanceof Fish).length;
        const jellyfishCount = creatures.filter(c => c instanceof Jellyfish).length;

        info.textContent = `Creatures: ${creatures.length} (🦋 ${butterflyCount} | 🐟 ${fishCount} | 🎐 ${jellyfishCount})`;

        requestAnimationFrame(animateProcedural);
    }

    animateProcedural(performance.now());
}

// ===================================
// DEMO: Friction Comparison
// ===================================
const frictionCanvas = document.getElementById('frictionDemo');
if (frictionCanvas) {
    const ctx = frictionCanvas.getContext('2d');
    const info = document.getElementById('frictionInfo');
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
            // Apply friction
            this.velocity.multiply(friction);

            // Stop if very slow
            if (this.velocity.length() < 0.1) {
                this.velocity.multiply(0);
            }

            this.position.add(this.velocity);

            // Bounce off walls
            if (this.position.x - this.radius < 0 || this.position.x + this.radius > frictionCanvas.width) {
                this.velocity.x *= -0.8;
                this.position.x = Math.max(this.radius, Math.min(frictionCanvas.width - this.radius, this.position.x));
            }
            if (this.position.y - this.radius < 0 || this.position.y + this.radius > frictionCanvas.height) {
                this.velocity.y *= -0.8;
                this.position.y = Math.max(this.radius, Math.min(frictionCanvas.height - this.radius, this.position.y));
            }
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw velocity line
            if (this.velocity.length() > 0.5) {
                ctx.strokeStyle = '#66bb6a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(
                    this.position.x + this.velocity.x * 3,
                    this.position.y + this.velocity.y * 3
                );
                ctx.stroke();
            }
        }
    }

    frictionCanvas.addEventListener('click', (e) => {
        const rect = frictionCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const angle = Math.random() * Math.PI * 2;
        const speed = 10;
        objects.push(new FrictionObject(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed));
    });

    // Button handlers
    const btnNo = document.getElementById('btnNoFriction');
    const btnLow = document.getElementById('btnLowFriction');
    const btnMedium = document.getElementById('btnMediumFriction');
    const btnHigh = document.getElementById('btnHighFriction');

    if (btnNo) btnNo.addEventListener('click', () => friction = 1.0);
    if (btnLow) btnLow.addEventListener('click', () => friction = 0.99);
    if (btnMedium) btnMedium.addEventListener('click', () => friction = 0.92);
    if (btnHigh) btnHigh.addEventListener('click', () => friction = 0.80);

    function animateFriction() {
        clearCanvas(ctx, frictionCanvas.width, frictionCanvas.height);

        // Draw surface types
        const surfaceNames = {
            1.0: 'No Friction (Space)',
            0.99: 'Ice',
            0.92: 'Grass',
            0.80: 'Mud'
        };

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(surfaceNames[friction] || 'Custom', frictionCanvas.width / 2, 30);

        // Update and draw objects
        objects.forEach(obj => {
            obj.update();
            obj.draw(ctx);
        });

        // Remove stopped objects after a while
        objects = objects.filter(obj => obj.velocity.length() > 0.01 || Date.now() % 5000 < 100);

        const movingCount = objects.filter(obj => obj.velocity.length() > 0.5).length;
        info.textContent = `Friction: ${friction.toFixed(2)} | Objects: ${objects.length} | Moving: ${movingCount}`;

        requestAnimationFrame(animateFriction);
    }

    animateFriction();
}

// ===================================
// DEMO: Bouncing & Reflection
// ===================================
const reflectionCanvas = document.getElementById('reflectionDemo');
if (reflectionCanvas) {
    const ctx = reflectionCanvas.getContext('2d');
    const info = document.getElementById('reflectionInfo');
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
            this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        }

        update() {
            // Gravity
            this.velocity.y += 0.3;

            this.position.add(this.velocity);

            // Bounce off walls
            if (this.position.x + this.radius > reflectionCanvas.width) {
                this.position.x = reflectionCanvas.width - this.radius;
                this.velocity.x *= -bounciness;
            }
            if (this.position.x - this.radius < 0) {
                this.position.x = this.radius;
                this.velocity.x *= -bounciness;
            }
            if (this.position.y + this.radius > reflectionCanvas.height) {
                this.position.y = reflectionCanvas.height - this.radius;
                this.velocity.y *= -bounciness;
            }
            if (this.position.y - this.radius < 0) {
                this.position.y = this.radius;
                this.velocity.y *= -bounciness;
            }
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        collidesWith(other) {
            const distance = this.position.distance(other.position);
            return distance < this.radius + other.radius;
        }

        bounceOff(other) {
            const normal = this.position.subtract(other.position).normalize();
            const relativeVel = this.velocity.subtract(other.velocity);
            const speed = relativeVel.dot(normal);

            if (speed > 0) return;

            const impulse = (2 * speed) / (this.mass + other.mass);

            this.velocity.subtract(normal.copy().multiply(impulse * other.mass * bounciness));
            other.velocity.add(normal.copy().multiply(impulse * this.mass * bounciness));

            // Separate overlapping balls
            const overlap = (this.radius + other.radius) - this.position.distance(other.position);
            if (overlap > 0) {
                const separation = normal.copy().multiply(overlap / 2);
                this.position.add(separation);
                other.position.subtract(separation);
            }
        }
    }

    reflectionCanvas.addEventListener('click', (e) => {
        const rect = reflectionCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        balls.push(new BouncingBall(x, y));
    });

    // Button handlers
    const btnPerfect = document.getElementById('btnPerfectBounce');
    const btnNormal = document.getElementById('btnNormalBounce');
    const btnDead = document.getElementById('btnDeadBounce');
    const btnCircle = document.getElementById('btnCircleBounce');

    if (btnPerfect) btnPerfect.addEventListener('click', () => { bounciness = 1.0; mode = 'normal'; });
    if (btnNormal) btnNormal.addEventListener('click', () => { bounciness = 0.8; mode = 'normal'; });
    if (btnDead) btnDead.addEventListener('click', () => { bounciness = 0.3; mode = 'normal'; });
    if (btnCircle) btnCircle.addEventListener('click', () => { bounciness = 0.9; mode = 'circle'; });

    function animateReflection() {
        clearCanvas(ctx, reflectionCanvas.width, reflectionCanvas.height);

        // Update balls
        balls.forEach(ball => ball.update());

        // Circle-to-circle collisions
        if (mode === 'circle') {
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    if (balls[i].collidesWith(balls[j])) {
                        balls[i].bounceOff(balls[j]);
                    }
                }
            }
        }

        // Draw balls
        balls.forEach(ball => ball.draw(ctx));

        // Info
        info.textContent = `Bounciness: ${bounciness.toFixed(1)} | Balls: ${balls.length} | Mode: ${mode}`;

        requestAnimationFrame(animateReflection);
    }

    animateReflection();
}

// ===================================
// DEMO: Advanced Particle Effects
// ===================================
const advancedParticlesCanvas = document.getElementById('advancedParticlesDemo');
if (advancedParticlesCanvas) {
    const ctx = advancedParticlesCanvas.getContext('2d');
    const info = document.getElementById('advancedParticlesInfo');
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
            this.velocity.y -= 0.05; // Float upward
            this.size *= 0.98;
            this.position.add(this.velocity);
            return this.life > 0;
        }

        draw(ctx) {
            const colorIndex = Math.floor((1 - this.life) * 2);
            const colors = [
                { r: 255, g: 255, b: 100 },
                { r: 255, g: 150, b: 50 },
                { r: 255, g: 50, b: 50 }
            ];
            const color = colors[Math.min(colorIndex, 2)];

            ctx.globalAlpha = this.life;
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
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
            ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
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
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 90%)`;
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

    class RainParticle {
        constructor(x, y) {
            this.position = new Vector2D(x, y);
            this.velocity = new Vector2D((Math.random() - 0.5) * 2, Math.random() * 5 + 5);
            this.length = Math.random() * 10 + 10;
        }

        update() {
            this.velocity.y += 0.2;
            this.position.add(this.velocity);

            if (this.position.y >= advancedParticlesCanvas.height - 10) {
                // Create splash
                for (let i = 0; i < 3; i++) {
                    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2;
                    const speed = Math.random() * 2 + 1;
                    const splash = new SparkleParticle(this.position.x, this.position.y);
                    splash.velocity = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
                    splash.hue = 200;
                    splash.size = 2;
                    particles.push(splash);
                }
                return false;
            }
            return this.position.y < advancedParticlesCanvas.height;
        }

        draw(ctx) {
            ctx.strokeStyle = 'rgba(150, 150, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x - this.velocity.x * 0.3, this.position.y - this.length);
            ctx.stroke();
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
            if (this.timer >= this.rate) {
                this.timer = 0;
                this.emit();
            }
        }

        emit() {
            let particle;
            switch(this.type) {
                case 'fire':
                    particle = new FireParticle(this.position.x, this.position.y);
                    break;
                case 'smoke':
                    particle = new SmokeParticle(this.position.x, this.position.y);
                    break;
                case 'sparkles':
                    particle = new SparkleParticle(this.position.x, this.position.y);
                    break;
                case 'rain':
                    particle = new RainParticle(this.position.x, this.position.y);
                    break;
            }
            if (particle) particles.push(particle);
        }
    }

    // Button handlers
    const btnFire = document.getElementById('btnFire');
    const btnSmoke = document.getElementById('btnSmoke');
    const btnSparkles = document.getElementById('btnSparkles');
    const btnRain = document.getElementById('btnRain');
    const btnCombined = document.getElementById('btnCombined');
    const btnClear = document.getElementById('btnClearParticles');

    if (btnFire) btnFire.addEventListener('click', () => {
        emitters = [];
        emitters.push(new Emitter(400, 450, 'fire', 2));
    });
    if (btnSmoke) btnSmoke.addEventListener('click', () => {
        emitters = [];
        emitters.push(new Emitter(400, 450, 'smoke', 3));
    });
    if (btnSparkles) btnSparkles.addEventListener('click', () => {
        emitters = [];
        emitters.push(new Emitter(400, 250, 'sparkles', 1));
    });
    if (btnRain) btnRain.addEventListener('click', () => {
        emitters = [];
        for (let i = 0; i < 10; i++) {
            emitters.push(new Emitter(i * 80 + 40, -10, 'rain', 5 + Math.random() * 10));
        }
    });
    if (btnCombined) btnCombined.addEventListener('click', () => {
        emitters = [];
        emitters.push(new Emitter(400, 450, 'fire', 2));
        emitters.push(new Emitter(400, 420, 'smoke', 4));
        emitters.push(new Emitter(400, 450, 'sparkles', 5));
    });
    if (btnClear) btnClear.addEventListener('click', () => {
        particles = [];
        emitters = [];
    });

    advancedParticlesCanvas.addEventListener('click', (e) => {
        const rect = advancedParticlesCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = 0; i < 20; i++) {
            particles.push(new SparkleParticle(x, y));
        }
    });

    function animateAdvancedParticles() {
        clearCanvas(ctx, advancedParticlesCanvas.width, advancedParticlesCanvas.height);

        // Update emitters
        emitters.forEach(emitter => emitter.update());

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            if (!particles[i].update()) {
                particles.splice(i, 1);
            } else {
                particles[i].draw(ctx);
            }
        }

        info.textContent = `Particles: ${particles.length} | Emitters: ${emitters.length}`;

        requestAnimationFrame(animateAdvancedParticles);
    }

    animateAdvancedParticles();
}
