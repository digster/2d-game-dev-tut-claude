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

// ===================================
// DEMO: Spring Physics
// ===================================
const springCanvas = document.getElementById('springDemo');
if (springCanvas) {
    const ctx = springCanvas.getContext('2d');
    const info = document.getElementById('springInfo');
    let mousePos = new Vector2D(400, 250);
    let mode = 'single'; // 'single' or 'compare'

    // Helper function to draw a spring coil
    function drawSpringCoil(ctx, start, end, color = '#4fc3f7') {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(start.x, start.y);
        ctx.rotate(angle);

        // Draw coiled spring
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const coils = 10;
        const amplitude = 8;
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const x = distance * t;
            const y = Math.sin(t * coils * Math.PI * 2) * amplitude;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.restore();
    }

    // Spring object class
    class SpringObject {
        constructor(x, y, stiffness, damping, color, label) {
            this.position = new Vector2D(x, y);
            this.velocity = new Vector2D(0, 0);
            this.target = new Vector2D(x, y);
            this.stiffness = stiffness;
            this.damping = damping;
            this.color = color;
            this.label = label;
            this.trail = [];
            this.maxTrailLength = 30;
        }

        update() {
            // Hooke's Law: F = -k * x (displacement)
            const displacement = this.target.subtract(this.position);
            const springForce = displacement.multiply(this.stiffness);

            // Add force to velocity
            this.velocity.add(springForce);

            // Apply damping
            this.velocity.multiply(this.damping);

            // Update position
            this.position.add(this.velocity);

            // Update trail
            this.trail.push(this.position.copy());
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }

        draw(ctx, showForces = true) {
            // Draw trail
            if (this.trail.length > 1) {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                this.trail.forEach((pos, i) => {
                    if (i === 0) ctx.moveTo(pos.x, pos.y);
                    else ctx.lineTo(pos.x, pos.y);
                });
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Draw spring coil
            drawSpringCoil(ctx, this.position, this.target, this.color);

            // Draw force vectors if enabled
            if (showForces) {
                const displacement = this.target.subtract(this.position);
                const springForce = displacement.multiply(this.stiffness);
                const forceScale = 50;

                // Draw spring force (blue)
                ctx.strokeStyle = '#4fc3f7';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(
                    this.position.x + springForce.x * forceScale,
                    this.position.y + springForce.y * forceScale
                );
                ctx.stroke();

                // Draw velocity vector (green)
                const velScale = 5;
                ctx.strokeStyle = '#66bb6a';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(
                    this.position.x + this.velocity.x * velScale,
                    this.position.y + this.velocity.y * velScale
                );
                ctx.stroke();
            }

            // Draw spring object
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            if (this.label) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.label, this.position.x, this.position.y - 30);
            }
        }

        drawTarget(ctx) {
            // Draw target anchor point
            ctx.fillStyle = '#ffa726';
            ctx.beginPath();
            ctx.arc(this.target.x, this.target.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw crosshair
            ctx.strokeStyle = '#ffa726';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.target.x - 12, this.target.y);
            ctx.lineTo(this.target.x + 12, this.target.y);
            ctx.moveTo(this.target.x, this.target.y - 12);
            ctx.lineTo(this.target.x, this.target.y + 12);
            ctx.stroke();
        }
    }

    // Single spring for single mode
    let currentSpring = new SpringObject(400, 250, 0.1, 0.8, '#4fc3f7', null);

    // Multiple springs for comparison mode
    const comparisonSprings = [
        new SpringObject(200, 100, 0.2, 0.8, '#4fc3f7', 'Tight'),
        new SpringObject(400, 100, 0.05, 0.9, '#66bb6a', 'Loose'),
        new SpringObject(600, 100, 0.15, 0.6, '#ffa726', 'Bouncy'),
        new SpringObject(400, 300, 0.3, 0.95, '#ef5350', 'Stiff')
    ];

    springCanvas.addEventListener('mousemove', (e) => {
        const rect = springCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;

        if (mode === 'single') {
            currentSpring.target = mousePos.copy();
        } else {
            // In comparison mode, all springs follow the same target
            comparisonSprings.forEach(spring => {
                spring.target = mousePos.copy();
            });
        }
    });

    // Button handlers
    const btnTight = document.getElementById('btnTightSpring');
    const btnLoose = document.getElementById('btnLooseSpring');
    const btnBouncy = document.getElementById('btnBouncySpring');
    const btnStiff = document.getElementById('btnStiffSpring');

    if (btnTight) btnTight.addEventListener('click', () => {
        mode = 'single';
        currentSpring = new SpringObject(400, 250, 0.2, 0.8, '#4fc3f7', 'Tight Spring');
        currentSpring.target = mousePos.copy();
    });
    if (btnLoose) btnLoose.addEventListener('click', () => {
        mode = 'single';
        currentSpring = new SpringObject(400, 250, 0.05, 0.9, '#66bb6a', 'Loose Spring');
        currentSpring.target = mousePos.copy();
    });
    if (btnBouncy) btnBouncy.addEventListener('click', () => {
        mode = 'single';
        currentSpring = new SpringObject(400, 250, 0.15, 0.6, '#ffa726', 'Bouncy Spring');
        currentSpring.target = mousePos.copy();
    });
    if (btnStiff) btnStiff.addEventListener('click', () => {
        mode = 'compare';
        comparisonSprings.forEach(spring => {
            spring.target = mousePos.copy();
            spring.trail = [];
        });
    });

    function animateSpring() {
        clearCanvas(ctx, springCanvas.width, springCanvas.height);

        if (mode === 'single') {
            // Update and draw single spring
            currentSpring.update();
            currentSpring.drawTarget(ctx);
            currentSpring.draw(ctx, true);

            // Info display
            const distance = currentSpring.position.distance(currentSpring.target);
            const speed = currentSpring.velocity.length();
            const energy = speed * speed * 0.5; // Kinetic energy approximation

            info.textContent = `${currentSpring.label || 'Spring'} - Stiffness: ${currentSpring.stiffness.toFixed(2)} | Damping: ${currentSpring.damping.toFixed(2)} | Distance: ${distance.toFixed(1)}px | Speed: ${speed.toFixed(2)} | Energy: ${energy.toFixed(2)}`;

            // Draw legend
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Blue arrow = Spring Force', 10, 20);
            ctx.fillText('Green arrow = Velocity', 10, 40);

        } else {
            // Update and draw all comparison springs
            comparisonSprings.forEach((spring, i) => {
                spring.update();
                if (i === 0) spring.drawTarget(ctx); // Draw target once
                spring.draw(ctx, false); // Don't show individual force vectors in comparison
            });

            // Info display
            info.textContent = 'Comparison Mode - Move mouse to see how different spring settings respond. Notice the different oscillation patterns!';

            // Draw legend
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Tight (k=0.2, d=0.8) - Fast response, stable', 10, 20);
            ctx.fillText('Loose (k=0.05, d=0.9) - Slow, very smooth', 10, 40);
            ctx.fillText('Bouncy (k=0.15, d=0.6) - Oscillates more', 10, 60);
            ctx.fillText('Stiff (k=0.3, d=0.95) - Very fast, no overshoot', 10, 80);
        }

        requestAnimationFrame(animateSpring);
    }

    animateSpring();
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
