// ===================================
// BEGINNER DEMOS - INTERACTIVE EXAMPLES
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
// DEMO 1: Vector Basics
// ===================================
const vectorBasicsCanvas = document.getElementById('vectorBasics');
if (vectorBasicsCanvas) {
    const ctx = vectorBasicsCanvas.getContext('2d');
    const info = document.getElementById('vectorInfo');
    let currentExample = 'simple';

    function drawVectorBasics(type) {
        currentExample = type;
        clearCanvas(ctx, vectorBasicsCanvas.width, vectorBasicsCanvas.height);
        drawGrid(ctx, vectorBasicsCanvas.width, vectorBasicsCanvas.height);

        if (type === 'simple') {
            const start = new Vector2D(100, 200);
            const end = new Vector2D(400, 100);
            drawVector(ctx, start, end, '#4fc3f7', 3);

            ctx.fillStyle = '#4fc3f7';
            ctx.font = '16px Arial';
            ctx.fillText(`Vector: (${end.x - start.x}, ${end.y - start.y})`, 250, 140);
            ctx.fillText('Start', start.x - 30, start.y + 30);
            ctx.fillText('End', end.x + 20, end.y);

            info.textContent = `Simple vector from (${start.x}, ${start.y}) to (${end.x}, ${end.y})`;
        }
        else if (type === 'player') {
            const player = new Vector2D(200, 300);
            const movement = new Vector2D(150, -100);
            const newPos = new Vector2D(player.x + movement.x, player.y + movement.y);

            // Draw player
            ctx.fillStyle = '#66bb6a';
            ctx.beginPath();
            ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText('Player', player.x - 20, player.y - 30);

            // Draw movement vector
            drawVector(ctx, player, newPos, '#ffa726', 3);

            // Draw new position
            ctx.fillStyle = '#66bb6a';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(newPos.x, newPos.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            info.textContent = `Player moves by vector (${movement.x}, ${movement.y})`;
        }
        else if (type === 'bullet') {
            const gun = new Vector2D(100, 300);
            const target = new Vector2D(600, 150);
            const direction = target.subtract(gun);

            // Draw gun
            ctx.fillStyle = '#4fc3f7';
            ctx.fillRect(gun.x - 15, gun.y - 10, 30, 20);
            ctx.fillText('Gun', gun.x - 15, gun.y + 35);

            // Draw target
            ctx.strokeStyle = '#ef5350';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(target.x, target.y, 25, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.fillText('Target', target.x - 20, target.y + 45);

            // Draw direction vector
            drawVector(ctx, gun, target, '#ffa726', 3);

            const length = direction.length();
            info.textContent = `Bullet direction: (${direction.x.toFixed(1)}, ${direction.y.toFixed(1)}), Distance: ${length.toFixed(1)}`;
        }
    }

    document.getElementById('btnSimpleVector').addEventListener('click', () => drawVectorBasics('simple'));
    document.getElementById('btnPlayerVector').addEventListener('click', () => drawVectorBasics('player'));
    document.getElementById('btnBulletVector').addEventListener('click', () => drawVectorBasics('bullet'));

    drawVectorBasics('simple');
}

// ===================================
// DEMO 2: Vector Playground
// ===================================
const playgroundCanvas = document.getElementById('vectorPlayground');
if (playgroundCanvas) {
    const ctx = playgroundCanvas.getContext('2d');
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

            // Bounce off walls
            if (this.position.x < this.radius || this.position.x > playgroundCanvas.width - this.radius) {
                this.velocity.x *= -1;
                this.position.x = clamp(this.position.x, this.radius, playgroundCanvas.width - this.radius);
            }
            if (this.position.y < this.radius || this.position.y > playgroundCanvas.height - this.radius) {
                this.velocity.y *= -1;
                this.position.y = clamp(this.position.y, this.radius, playgroundCanvas.height - this.radius);
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

    function animate() {
        clearCanvas(ctx, playgroundCanvas.width, playgroundCanvas.height);
        drawGrid(ctx, playgroundCanvas.width, playgroundCanvas.height);

        objects.forEach(obj => {
            obj.update();
            obj.draw(ctx);
        });

        if (isDragging && dragStart) {
            const mousePos = new Vector2D(dragStart.currentX, dragStart.currentY);
            ctx.strokeStyle = '#66bb6a';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(dragStart.x, dragStart.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw preview circle
            ctx.fillStyle = 'rgba(79, 195, 247, 0.5)';
            ctx.beginPath();
            ctx.arc(dragStart.x, dragStart.y, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    playgroundCanvas.addEventListener('mousedown', (e) => {
        const rect = playgroundCanvas.getBoundingClientRect();
        dragStart = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            currentX: e.clientX - rect.left,
            currentY: e.clientY - rect.top
        };
        isDragging = true;
    });

    playgroundCanvas.addEventListener('mousemove', (e) => {
        if (isDragging && dragStart) {
            const rect = playgroundCanvas.getBoundingClientRect();
            dragStart.currentX = e.clientX - rect.left;
            dragStart.currentY = e.clientY - rect.top;
        }
    });

    playgroundCanvas.addEventListener('mouseup', (e) => {
        if (isDragging && dragStart) {
            const rect = playgroundCanvas.getBoundingClientRect();
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;

            const vx = (endX - dragStart.x) * 0.1;
            const vy = (endY - dragStart.y) * 0.1;

            objects.push(new MovingObject(dragStart.x, dragStart.y, vx, vy));
        }
        isDragging = false;
        dragStart = null;
    });

    document.getElementById('btnAddObject').addEventListener('click', () => {
        const x = randomFloat(50, playgroundCanvas.width - 50);
        const y = randomFloat(50, playgroundCanvas.height - 50);
        const vx = randomFloat(-3, 3);
        const vy = randomFloat(-3, 3);
        objects.push(new MovingObject(x, y, vx, vy));
    });

    document.getElementById('btnClearObjects').addEventListener('click', () => {
        objects.length = 0;
    });

    animate();
}

// ===================================
// DEMO 3: Normalization
// ===================================
const normalizeCanvas = document.getElementById('normalizeDemo');
if (normalizeCanvas) {
    const ctx = normalizeCanvas.getContext('2d');
    const info = document.getElementById('normalizeInfo');
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

    document.getElementById('btnToggleNormalize').addEventListener('click', () => {
        useNormalization = !useNormalization;
        info.textContent = `Normalization: ${useNormalization ? 'ON' : 'OFF'} - Use WASD to move`;
    });

    function animateNormalize() {
        clearCanvas(ctx, normalizeCanvas.width, normalizeCanvas.height);
        drawGrid(ctx, normalizeCanvas.width, normalizeCanvas.height);

        // Get input direction
        const dir = new Vector2D(
            (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
            (keys.s ? 1 : 0) - (keys.w ? 1 : 0)
        );

        if (dir.length() > 0) {
            const speed = 3;
            const lengthBefore = dir.length();

            if (useNormalization) {
                dir.normalize().multiply(speed);
            } else {
                dir.multiply(speed);
            }

            player.add(dir);

            // Keep in bounds
            player.x = clamp(player.x, 30, normalizeCanvas.width - 30);
            player.y = clamp(player.y, 30, normalizeCanvas.height - 30);

            info.textContent = `${useNormalization ? 'Normalized' : 'Not normalized'} | Speed: ${dir.length().toFixed(2)} px/frame`;
        }

        // Draw player
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw speed indicator
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText('Player', player.x - 20, player.y - 30);

        requestAnimationFrame(animateNormalize);
    }

    animateNormalize();
}

// ===================================
// DEMO 4: Dot Product
// ===================================
const dotCanvas = document.getElementById('dotProductDemo');
if (dotCanvas) {
    const ctx = dotCanvas.getContext('2d');
    const info = document.getElementById('dotInfo');
    const center = new Vector2D(400, 200);
    const forward = new Vector2D(1, 0);
    let mousePos = new Vector2D(600, 200);

    dotCanvas.addEventListener('mousemove', (e) => {
        const rect = dotCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    function animateDot() {
        clearCanvas(ctx, dotCanvas.width, dotCanvas.height);
        drawGrid(ctx, dotCanvas.width, dotCanvas.height);

        // Calculate direction to mouse
        const toMouse = mousePos.subtract(center);
        const normalized = toMouse.copy().normalize();

        // Calculate dot product
        const dot = forward.dot(normalized);

        // Draw center point
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(center.x, center.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Draw forward vector
        const forwardEnd = new Vector2D(center.x + forward.x * 100, center.y + forward.y * 100);
        drawVector(ctx, center, forwardEnd, '#66bb6a', 3);
        ctx.fillStyle = '#66bb6a';
        ctx.font = '14px Arial';
        ctx.fillText('Forward', forwardEnd.x + 10, forwardEnd.y);

        // Draw direction to mouse
        const mouseEnd = new Vector2D(center.x + normalized.x * 100, center.y + normalized.y * 100);
        const color = dot > 0 ? '#ffa726' : '#ef5350';
        drawVector(ctx, center, mouseEnd, color, 3);

        // Draw dot product value
        ctx.fillStyle = color;
        ctx.font = '20px Arial';
        ctx.fillText(`Dot Product: ${dot.toFixed(3)}`, 20, 30);

        if (dot > 0.7) {
            info.textContent = 'Target is directly in front!';
        } else if (dot > 0) {
            info.textContent = 'Target is ahead';
        } else if (dot > -0.3) {
            info.textContent = 'Target is to the side';
        } else {
            info.textContent = 'Target is behind';
        }

        requestAnimationFrame(animateDot);
    }

    animateDot();
}

// ===================================
// DEMO 5: Simple Game
// ===================================
const gameCanvas = document.getElementById('gameDemo');
if (gameCanvas) {
    const ctx = gameCanvas.getContext('2d');
    const info = document.getElementById('gameInfo');
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

            this.position.x = clamp(this.position.x, this.radius, gameCanvas.width - this.radius);
            this.position.y = clamp(this.position.y, this.radius, gameCanvas.height - this.radius);
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

            if (this.position.x < 0 || this.position.x > gameCanvas.width ||
                this.position.y < 0 || this.position.y > gameCanvas.height) {
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

    gameCanvas.addEventListener('click', (e) => {
        const rect = gameCanvas.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;

        const direction = new Vector2D(targetX - player.position.x, targetY - player.position.y);
        direction.normalize().multiply(8);

        bullets.push(new Bullet(player.position.x, player.position.y, direction.x, direction.y));
    });

    document.getElementById('btnAddEnemy').addEventListener('click', () => {
        const x = randomFloat(50, gameCanvas.width - 50);
        const y = randomFloat(50, gameCanvas.height - 50);
        enemies.push(new Enemy(x, y));
    });

    document.getElementById('btnResetGame').addEventListener('click', () => {
        enemies.length = 0;
        bullets.length = 0;
        score = 0;
        player.position.set(400, 300);
    });

    function animateGame() {
        clearCanvas(ctx, gameCanvas.width, gameCanvas.height);

        player.update();
        player.draw(ctx);

        bullets.forEach(bullet => {
            bullet.update();
            bullet.draw(ctx);
        });

        enemies.forEach(enemy => {
            enemy.draw(ctx);
        });

        // Collision detection
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

        // Clean up dead objects
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (!bullets[i].alive) bullets.splice(i, 1);
        }
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (!enemies[i].alive) enemies.splice(i, 1);
        }

        // Draw score
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}`, 20, 30);
        ctx.font = '16px Arial';
        ctx.fillText(`Enemies: ${enemies.length}`, 20, 55);

        info.textContent = `Score: ${score} | Use WASD to move, Click to shoot!`;

        requestAnimationFrame(animateGame);
    }

    // Add initial enemies
    for (let i = 0; i < 5; i++) {
        const x = randomFloat(50, gameCanvas.width - 50);
        const y = randomFloat(50, gameCanvas.height - 50);
        enemies.push(new Enemy(x, y));
    }

    animateGame();
}

// ===================================
// DEMO 6: Matrix Transformations
// ===================================
const matrixCanvas = document.getElementById('matrixDemo');
if (matrixCanvas) {
    const ctx = matrixCanvas.getContext('2d');
    const info = document.getElementById('matrixInfo');
    let currentTransform = 'rotate';
    let time = 0;

    const shape = [
        new Vector2D(-50, -30),
        new Vector2D(50, -30),
        new Vector2D(50, 30),
        new Vector2D(-50, 30)
    ];

    function drawShape(ctx, points, matrix, color) {
        const transformed = points.map(p => matrix.transformPoint(p));

        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(transformed[0].x, transformed[0].y);
        for (let i = 1; i < transformed.length; i++) {
            ctx.lineTo(transformed[i].x, transformed[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    function animateMatrix() {
        clearCanvas(ctx, matrixCanvas.width, matrixCanvas.height);
        drawGrid(ctx, matrixCanvas.width, matrixCanvas.height);

        const matrix = new Matrix2D();
        matrix.translate(400, 200);

        time += 0.02;

        if (currentTransform === 'rotate') {
            matrix.rotate(time);
            info.textContent = 'Rotation: Object spins around its center';
        }
        else if (currentTransform === 'scale') {
            const scale = 1 + Math.sin(time) * 0.5;
            matrix.scale(scale, scale);
            info.textContent = 'Scale: Object grows and shrinks';
        }
        else if (currentTransform === 'translate') {
            const offsetX = Math.cos(time) * 100;
            const offsetY = Math.sin(time) * 50;
            matrix.translate(offsetX, offsetY);
            info.textContent = 'Translation: Object moves in a circle';
        }
        else if (currentTransform === 'combined') {
            matrix.rotate(time);
            const scale = 1 + Math.sin(time * 2) * 0.3;
            matrix.scale(scale, scale);
            info.textContent = 'Combined: Rotation + Scale together';
        }

        drawShape(ctx, shape, matrix, '#4fc3f7');

        requestAnimationFrame(animateMatrix);
    }

    document.getElementById('btnRotate').addEventListener('click', () => {
        currentTransform = 'rotate';
        time = 0;
    });

    document.getElementById('btnScale').addEventListener('click', () => {
        currentTransform = 'scale';
        time = 0;
    });

    document.getElementById('btnTranslate').addEventListener('click', () => {
        currentTransform = 'translate';
        time = 0;
    });

    document.getElementById('btnCombined').addEventListener('click', () => {
        currentTransform = 'combined';
        time = 0;
    });

    animateMatrix();
}

// ===================================
// DEMO: Health System
// ===================================
const healthCanvas = document.getElementById('healthDemo');
if (healthCanvas) {
    const ctx = healthCanvas.getContext('2d');
    const info = document.getElementById('healthInfo');

    class Character {
        constructor(x, y, maxHealth) {
            this.position = new Vector2D(x, y);
            this.maxHealth = maxHealth;
            this.currentHealth = maxHealth;
            this.isAlive = true;
            this.isInvulnerable = false;
            this.invulTimer = 0;
            this.flashTimer = 0;
        }

        takeDamage(amount) {
            if (this.isInvulnerable || !this.isAlive) return false;

            this.currentHealth -= amount;
            this.currentHealth = Math.max(0, this.currentHealth);
            this.isInvulnerable = true;
            this.invulTimer = 60; // 1 second at 60fps
            this.flashTimer = 30;

            if (this.currentHealth <= 0) {
                this.isAlive = false;
            }
            return true;
        }

        heal(amount) {
            if (!this.isAlive) return;
            this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        }

        update() {
            if (this.invulTimer > 0) {
                this.invulTimer--;
                if (this.invulTimer === 0) this.isInvulnerable = false;
            }
            if (this.flashTimer > 0) this.flashTimer--;
        }

        draw(ctx) {
            const x = this.position.x;
            const y = this.position.y;

            // Draw character
            if (!this.isAlive || (this.flashTimer > 0 && Math.floor(this.flashTimer / 5) % 2 === 0)) {
                ctx.globalAlpha = 0.5;
            }

            ctx.fillStyle = this.isAlive ? '#4fc3f7' : '#666';
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;

            // Draw health bar
            const barWidth = 100;
            const barHeight = 12;
            const healthPercent = this.currentHealth / this.maxHealth;

            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(x - barWidth / 2, y - 70, barWidth, barHeight);

            // Health
            const healthColor = healthPercent > 0.5 ? '#66bb6a' : healthPercent > 0.25 ? '#ffeb3b' : '#f44336';
            ctx.fillStyle = healthColor;
            ctx.fillRect(x - barWidth / 2, y - 70, barWidth * healthPercent, barHeight);

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - barWidth / 2, y - 70, barWidth, barHeight);

            // Text
            ctx.fillStyle = '#fff';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.floor(this.currentHealth)}/${this.maxHealth}`, x, y - 75);
        }
    }

    const character = new Character(400, 200, 100);

    document.getElementById('btnDamage').addEventListener('click', () => {
        character.takeDamage(10);
    });

    document.getElementById('btnHeal').addEventListener('click', () => {
        character.heal(20);
    });

    document.getElementById('btnMaxDamage').addEventListener('click', () => {
        character.takeDamage(999);
    });

    document.getElementById('btnFullHeal').addEventListener('click', () => {
        character.currentHealth = character.maxHealth;
        character.isAlive = true;
    });

    function animateHealth() {
        clearCanvas(ctx, healthCanvas.width, healthCanvas.height);

        character.update();
        character.draw(ctx);

        const status = character.isAlive ? 'Alive' : 'Dead';
        const invuln = character.isInvulnerable ? ' | Invulnerable!' : '';
        info.textContent = `Health: ${Math.floor(character.currentHealth)}/${character.maxHealth} | Status: ${status}${invuln}`;

        requestAnimationFrame(animateHealth);
    }

    animateHealth();
}

// ===================================
// DEMO: Scoring System
// ===================================
const scoringCanvas = document.getElementById('scoringDemo');
if (scoringCanvas) {
    const ctx = scoringCanvas.getContext('2d');
    const info = document.getElementById('scoringInfo');

    let score = 0;
    let combo = 0;
    let comboTimer = 0;
    let highScore = 0;
    let lastTime = Date.now();

    const targets = [];
    for (let i = 0; i < 5; i++) {
        targets.push({
            x: randomFloat(100, scoringCanvas.width - 100),
            y: randomFloat(100, scoringCanvas.height - 100),
            radius: 30,
            hit: false
        });
    }

    document.getElementById('btnScore').addEventListener('click', () => {
        const multiplier = 1 + (combo * 0.1);
        const points = Math.floor(100 * multiplier);
        score += points;
        combo++;
        comboTimer = 2000; // 2 seconds

        if (score > highScore) highScore = score;

        // Visual feedback
        const target = targets[Math.floor(Math.random() * targets.length)];
        target.hit = true;
        setTimeout(() => target.hit = false, 200);
    });

    document.getElementById('btnResetScore').addEventListener('click', () => {
        score = 0;
        combo = 0;
        comboTimer = 0;
    });

    function animateScoring() {
        clearCanvas(ctx, scoringCanvas.width, scoringCanvas.height);

        const now = Date.now();
        const deltaTime = now - lastTime;
        lastTime = now;

        // Update combo timer
        if (comboTimer > 0) {
            comboTimer -= deltaTime;
            if (comboTimer <= 0) {
                combo = 0;
                comboTimer = 0;
            }
        }

        // Draw targets
        targets.forEach(target => {
            ctx.fillStyle = target.hit ? '#ffeb3b' : '#66bb6a';
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw score
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 20, 60);

        // Draw combo
        if (combo > 0) {
            const comboAlpha = Math.min(1, comboTimer / 500);
            ctx.globalAlpha = comboAlpha;
            ctx.fillStyle = '#ffeb3b';
            ctx.font = 'bold 36px monospace';
            ctx.fillText(`Combo x${combo}`, 20, 110);
            ctx.globalAlpha = 1;

            // Combo timer bar
            const barWidth = 200;
            const progress = comboTimer / 2000;
            ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
            ctx.fillRect(20, 120, barWidth, 8);
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(20, 120, barWidth * progress, 8);
        }

        // Draw high score
        ctx.fillStyle = '#999';
        ctx.font = '20px monospace';
        ctx.fillText(`High Score: ${highScore}`, 20, 160);

        info.textContent = `Click "Hit Target" quickly to build combos! Multiplier: ${(1 + combo * 0.1).toFixed(1)}x`;

        requestAnimationFrame(animateScoring);
    }

    animateScoring();
}

// ===================================
// DEMO: Inventory System
// ===================================
const inventoryCanvas = document.getElementById('inventoryDemo');
if (inventoryCanvas) {
    const ctx = inventoryCanvas.getContext('2d');
    const info = document.getElementById('inventoryInfo');

    class Item {
        constructor(id, name, icon, stackable, maxStack) {
            this.id = id;
            this.name = name;
            this.icon = icon;
            this.stackable = stackable;
            this.maxStack = maxStack;
            this.quantity = 1;
        }
    }

    const inventory = {
        items: [],
        capacity: 12,
        selectedIndex: -1
    };

    const itemTypes = {
        potion: { name: 'Health Potion', icon: '🧪', stackable: true, maxStack: 10 },
        sword: { name: 'Iron Sword', icon: '⚔️', stackable: false, maxStack: 1 },
        coin: { name: 'Gold Coin', icon: '💰', stackable: true, maxStack: 99 }
    };

    function addItem(type) {
        const template = itemTypes[type];

        if (template.stackable) {
            const existing = inventory.items.find(i => i.id === type);
            if (existing && existing.quantity < existing.maxStack) {
                existing.quantity++;
                return true;
            }
        }

        if (inventory.items.length < inventory.capacity) {
            inventory.items.push(new Item(type, template.name, template.icon, template.stackable, template.maxStack));
            return true;
        }
        return false;
    }

    document.getElementById('btnPickupPotion').addEventListener('click', () => addItem('potion'));
    document.getElementById('btnPickupSword').addEventListener('click', () => addItem('sword'));
    document.getElementById('btnPickupCoin').addEventListener('click', () => addItem('coin'));

    document.getElementById('btnUseItem').addEventListener('click', () => {
        if (inventory.selectedIndex >= 0 && inventory.selectedIndex < inventory.items.length) {
            const item = inventory.items[inventory.selectedIndex];
            item.quantity--;
            if (item.quantity <= 0) {
                inventory.items.splice(inventory.selectedIndex, 1);
                inventory.selectedIndex = -1;
            }
        }
    });

    document.getElementById('btnClearInventory').addEventListener('click', () => {
        inventory.items = [];
        inventory.selectedIndex = -1;
    });

    inventoryCanvas.addEventListener('click', (e) => {
        const rect = inventoryCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cols = 4;
        const slotSize = 80;
        const padding = 20;
        const startX = (inventoryCanvas.width - (cols * slotSize + (cols - 1) * padding)) / 2;
        const startY = 100;

        for (let i = 0; i < inventory.capacity; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const slotX = startX + col * (slotSize + padding);
            const slotY = startY + row * (slotSize + padding);

            if (x >= slotX && x < slotX + slotSize && y >= slotY && y < slotY + slotSize) {
                inventory.selectedIndex = i < inventory.items.length ? i : -1;
                break;
            }
        }
    });

    function animateInventory() {
        clearCanvas(ctx, inventoryCanvas.width, inventoryCanvas.height);

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Inventory', inventoryCanvas.width / 2, 50);

        // Draw inventory grid
        const cols = 4;
        const slotSize = 80;
        const padding = 20;
        const startX = (inventoryCanvas.width - (cols * slotSize + (cols - 1) * padding)) / 2;
        const startY = 100;

        for (let i = 0; i < inventory.capacity; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (slotSize + padding);
            const y = startY + row * (slotSize + padding);

            // Draw slot
            const isSelected = i === inventory.selectedIndex;
            ctx.fillStyle = isSelected ? '#4fc3f7' : '#333';
            ctx.fillRect(x, y, slotSize, slotSize);

            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, slotSize, slotSize);

            // Draw item if exists
            if (i < inventory.items.length) {
                const item = inventory.items[i];
                ctx.font = '40px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(item.icon, x + slotSize / 2, y + slotSize / 2 - 5);

                // Draw quantity
                if (item.quantity > 1) {
                    ctx.font = 'bold 14px monospace';
                    ctx.fillStyle = '#ffeb3b';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(item.quantity, x + slotSize - 5, y + slotSize - 5);
                }
            }
        }

        const itemName = inventory.selectedIndex >= 0 && inventory.selectedIndex < inventory.items.length
            ? inventory.items[inventory.selectedIndex].name
            : 'None';

        info.textContent = `Slots: ${inventory.items.length}/${inventory.capacity} | Selected: ${itemName}`;

        requestAnimationFrame(animateInventory);
    }

    animateInventory();
}

// ===================================
// DEMO: Timer/Cooldown System
// ===================================
const timerCanvas = document.getElementById('timerDemo');
if (timerCanvas) {
    const ctx = timerCanvas.getContext('2d');
    const info = document.getElementById('timerInfo');

    class Cooldown {
        constructor(name, duration, icon) {
            this.name = name;
            this.duration = duration;
            this.remaining = 0;
            this.icon = icon;
        }

        use() {
            if (this.isReady()) {
                this.remaining = this.duration;
                return true;
            }
            return false;
        }

        update(deltaTime) {
            if (this.remaining > 0) {
                this.remaining -= deltaTime;
                if (this.remaining < 0) this.remaining = 0;
            }
        }

        isReady() {
            return this.remaining === 0;
        }

        getProgress() {
            return 1 - (this.remaining / this.duration);
        }
    }

    const abilities = [
        new Cooldown('Fireball', 2000, '🔥'),
        new Cooldown('Ice Blast', 3000, '❄️'),
        new Cooldown('Lightning', 5000, '⚡'),
        new Cooldown('Ultimate', 10000, '💥')
    ];

    let lastTime = Date.now();

    document.getElementById('btnFireball').addEventListener('click', () => abilities[0].use());
    document.getElementById('btnIceBlast').addEventListener('click', () => abilities[1].use());
    document.getElementById('btnLightning').addEventListener('click', () => abilities[2].use());
    document.getElementById('btnUltimate').addEventListener('click', () => abilities[3].use());

    function animateTimer() {
        clearCanvas(ctx, timerCanvas.width, timerCanvas.height);

        const now = Date.now();
        const deltaTime = now - lastTime;
        lastTime = now;

        abilities.forEach(ability => ability.update(deltaTime));

        // Draw abilities
        const slotSize = 100;
        const padding = 30;
        const totalWidth = abilities.length * slotSize + (abilities.length - 1) * padding;
        const startX = (timerCanvas.width - totalWidth) / 2;
        const y = timerCanvas.height / 2 - slotSize / 2;

        abilities.forEach((ability, i) => {
            const x = startX + i * (slotSize + padding);

            // Draw slot
            ctx.fillStyle = ability.isReady() ? '#66bb6a' : '#333';
            ctx.fillRect(x, y, slotSize, slotSize);

            ctx.strokeStyle = ability.isReady() ? '#fff' : '#666';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, slotSize, slotSize);

            // Draw icon
            ctx.font = '48px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (!ability.isReady()) ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#fff';
            ctx.fillText(ability.icon, x + slotSize / 2, y + slotSize / 2);
            ctx.globalAlpha = 1;

            // Draw cooldown overlay
            if (!ability.isReady()) {
                const progress = ability.getProgress();
                const overlayHeight = slotSize * (1 - progress);

                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(x, y, slotSize, overlayHeight);

                // Draw time remaining
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px monospace';
                ctx.fillText(Math.ceil(ability.remaining / 1000) + 's', x + slotSize / 2, y + slotSize / 2);
            }

            // Draw ability name
            ctx.fillStyle = '#999';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(ability.name, x + slotSize / 2, y + slotSize + 20);
        });

        const readyCount = abilities.filter(a => a.isReady()).length;
        info.textContent = `Ready Abilities: ${readyCount}/${abilities.length}`;

        requestAnimationFrame(animateTimer);
    }

    animateTimer();
}

// ========================================
// POWER-UP SYSTEM DEMO
// ========================================
const powerupCanvas = document.getElementById('powerupDemo');
if (powerupCanvas) {
    const ctx = powerupCanvas.getContext('2d');
    const info = document.getElementById('powerupInfo');

    // Power-up class
    class PowerUp {
        constructor(type, x, y) {
            this.type = type;
            this.position = new Vector2D(x, y);
            this.radius = 15;
            this.rotation = 0;
            this.config = this.getConfig(type);
            this.pulseTime = 0;
        }

        getConfig(type) {
            const configs = {
                'speed': {
                    color: '#4fc3f7',
                    icon: '⚡',
                    name: 'Speed Boost',
                    duration: 5000,
                    effect: { speedMultiplier: 1.5 }
                },
                'shield': {
                    color: '#66bb6a',
                    icon: '🛡️',
                    name: 'Shield',
                    duration: 8000,
                    effect: { invulnerable: true }
                },
                'damage': {
                    color: '#ef5350',
                    icon: '🔥',
                    name: 'Damage Boost',
                    duration: 6000,
                    effect: { damageMultiplier: 2 }
                },
                'health': {
                    color: '#ffa726',
                    icon: '❤️',
                    name: 'Health Pack',
                    duration: 0,
                    effect: { healAmount: 50 }
                }
            };
            return configs[type];
        }

        update(deltaTime) {
            this.rotation += deltaTime * 0.002;
            this.pulseTime += deltaTime * 0.003;
        }

        checkCollision(playerPos, playerRadius) {
            const distance = this.position.distance(playerPos);
            return distance < (this.radius + playerRadius);
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.rotation);

            // Pulsing glow
            const pulse = Math.sin(this.pulseTime) * 0.3 + 0.7;
            const glowSize = this.radius + 5 + pulse * 3;

            ctx.fillStyle = this.config.color;
            ctx.globalAlpha = 0.3 * pulse;
            ctx.beginPath();
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Main circle
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Icon
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.config.icon, 0, 0);

            ctx.restore();
        }
    }

    // Player with power-up effects
    class PowerUpPlayer {
        constructor(x, y) {
            this.position = new Vector2D(x, y);
            this.radius = 20;
            this.baseSpeed = 3;
            this.speed = this.baseSpeed;
            this.activePowerUps = [];
            this.health = 100;
            this.maxHealth = 100;
        }

        update(deltaTime) {
            // Update active power-ups
            this.activePowerUps = this.activePowerUps.filter(powerUp => {
                powerUp.timeRemaining -= deltaTime;
                return powerUp.timeRemaining > 0;
            });

            // Apply speed multiplier
            const speedMultiplier = this.getMultiplier('speedMultiplier');
            this.speed = this.baseSpeed * speedMultiplier;

            // Move based on keys
            const direction = new Vector2D(0, 0);
            if (powerupKeys.w) direction.y -= 1;
            if (powerupKeys.s) direction.y += 1;
            if (powerupKeys.a) direction.x -= 1;
            if (powerupKeys.d) direction.x += 1;

            if (direction.length() > 0) {
                direction.normalize();
                this.position.add(direction.multiply(this.speed));
            }

            // Keep in bounds
            this.position.x = Math.max(this.radius, Math.min(powerupCanvas.width - this.radius, this.position.x));
            this.position.y = Math.max(this.radius, Math.min(powerupCanvas.height - this.radius, this.position.y));
        }

        collectPowerUp(powerUp) {
            if (powerUp.config.duration > 0) {
                // Timed power-up
                this.activePowerUps.push({
                    type: powerUp.type,
                    config: powerUp.config,
                    timeRemaining: powerUp.config.duration
                });
            } else {
                // Instant effect (health)
                if (powerUp.config.effect.healAmount) {
                    this.health = Math.min(this.maxHealth, this.health + powerUp.config.effect.healAmount);
                }
            }
        }

        hasEffect(effectName) {
            return this.activePowerUps.some(p => p.config.effect[effectName] !== undefined);
        }

        getMultiplier(multiplierName) {
            const powerUp = this.activePowerUps.find(p => p.config.effect[multiplierName] !== undefined);
            return powerUp ? powerUp.config.effect[multiplierName] : 1;
        }

        draw(ctx) {
            // Shield effect
            if (this.hasEffect('invulnerable')) {
                ctx.strokeStyle = '#66bb6a';
                ctx.lineWidth = 4;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius + 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Speed effect (trailing)
            if (this.hasEffect('speedMultiplier')) {
                ctx.fillStyle = '#4fc3f7';
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius + 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Damage effect (flames)
            if (this.hasEffect('damageMultiplier')) {
                ctx.fillStyle = '#ef5350';
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius + 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Player body
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Health bar
            const barWidth = 60;
            const barHeight = 6;
            const barX = this.position.x - barWidth / 2;
            const barY = this.position.y - this.radius - 15;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#66bb6a' : healthPercent > 0.25 ? '#ffa726' : '#ef5350';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
    }

    // Game state
    const player = new PowerUpPlayer(powerupCanvas.width / 2, powerupCanvas.height / 2);
    const powerups = [];
    const powerupKeys = { w: false, a: false, s: false, d: false };
    let lastTime = Date.now();

    // Input handling
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key in powerupKeys) powerupKeys[key] = true;
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key in powerupKeys) powerupKeys[key] = false;
    });

    // Button handlers
    const spawnButtons = {
        btnSpawnSpeed: 'speed',
        btnSpawnShield: 'shield',
        btnSpawnDamage: 'damage',
        btnSpawnHealth: 'health'
    };

    Object.entries(spawnButtons).forEach(([btnId, type]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                const x = Math.random() * (powerupCanvas.width - 100) + 50;
                const y = Math.random() * (powerupCanvas.height - 100) + 50;
                powerups.push(new PowerUp(type, x, y));
            });
        }
    });

    const clearBtn = document.getElementById('btnClearPowerups');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            powerups.length = 0;
            player.activePowerUps.length = 0;
        });
    }

    // Animation loop
    function animatePowerup() {
        clearCanvas(ctx, powerupCanvas.width, powerupCanvas.height);

        const now = Date.now();
        const deltaTime = now - lastTime;
        lastTime = now;

        // Update powerups
        powerups.forEach(powerup => powerup.update(deltaTime));

        // Check collisions
        for (let i = powerups.length - 1; i >= 0; i--) {
            if (powerups[i].checkCollision(player.position, player.radius)) {
                player.collectPowerUp(powerups[i]);
                powerups.splice(i, 1);
            }
        }

        // Update player
        player.update(deltaTime);

        // Draw powerups
        powerups.forEach(powerup => powerup.draw(ctx));

        // Draw player
        player.draw(ctx);

        // Draw active power-ups UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Active Power-ups:', 20, 30);

        player.activePowerUps.forEach((powerUp, i) => {
            const y = 60 + i * 30;
            const timeLeft = (powerUp.timeRemaining / 1000).toFixed(1);

            ctx.fillStyle = powerUp.config.color;
            ctx.fillRect(20, y - 15, 200, 20);

            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`${powerUp.config.icon} ${powerUp.config.name}: ${timeLeft}s`, 25, y);

            // Progress bar
            const progress = powerUp.timeRemaining / powerUp.config.duration;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(20, y - 15, 200 * progress, 20);
        });

        // Info text
        const activeCount = player.activePowerUps.length;
        const availableCount = powerups.length;
        info.textContent = `Power-ups: ${availableCount} available, ${activeCount} active | Health: ${player.health}/${player.maxHealth}`;

        requestAnimationFrame(animatePowerup);
    }

    animatePowerup();
}

// ===================================
// DEMO: Trigonometry in Action
// ===================================
const trigCanvas = document.getElementById('trigDemo');
if (trigCanvas) {
    const ctx = trigCanvas.getContext('2d');
    const info = document.getElementById('trigInfo');
    let mode = 'orbit';
    let time = 0;
    let mousePos = new Vector2D(400, 250);

    trigCanvas.addEventListener('mousemove', (e) => {
        const rect = trigCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    // Button handlers
    const btnOrbit = document.getElementById('btnOrbit');
    const btnWave = document.getElementById('btnWave');
    const btnFaceTarget = document.getElementById('btnFaceTarget');
    const btnArc = document.getElementById('btnArc');

    if (btnOrbit) btnOrbit.addEventListener('click', () => mode = 'orbit');
    if (btnWave) btnWave.addEventListener('click', () => mode = 'wave');
    if (btnFaceTarget) btnFaceTarget.addEventListener('click', () => mode = 'face');
    if (btnArc) btnArc.addEventListener('click', () => mode = 'arc');

    // Orbiting objects
    const orbitObjects = [
        { angle: 0, radius: 80, speed: 0.02, color: '#4fc3f7' },
        { angle: Math.PI, radius: 80, speed: 0.02, color: '#66bb6a' },
        { angle: Math.PI / 2, radius: 120, speed: 0.015, color: '#ffa726' }
    ];

    // Wave objects
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

    function animateTrig() {
        clearCanvas(ctx, trigCanvas.width, trigCanvas.height);
        time += 0.05;

        const center = new Vector2D(400, 250);

        if (mode === 'orbit') {
            // Draw center
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(center.x, center.y, 10, 0, Math.PI * 2);
            ctx.fill();

            // Draw orbiting objects
            orbitObjects.forEach(obj => {
                obj.angle += obj.speed;
                const x = center.x + Math.cos(obj.angle) * obj.radius;
                const y = center.y + Math.sin(obj.angle) * obj.radius;

                // Draw orbit path
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(center.x, center.y, obj.radius, 0, Math.PI * 2);
                ctx.stroke();

                // Draw object
                ctx.fillStyle = obj.color;
                ctx.beginPath();
                ctx.arc(x, y, 15, 0, Math.PI * 2);
                ctx.fill();

                // Draw line to center
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
            // Draw wave objects
            waveObjects.forEach(obj => {
                const offset = Math.sin((time + obj.phase) * obj.frequency) * obj.amplitude;
                const y = obj.baseY + offset;

                // Draw baseline
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.moveTo(obj.x, obj.baseY - 5);
                ctx.lineTo(obj.x, obj.baseY + 5);
                ctx.stroke();

                // Draw object
                ctx.fillStyle = '#4fc3f7';
                ctx.beginPath();
                ctx.arc(obj.x, y, 12, 0, Math.PI * 2);
                ctx.fill();

                // Draw vertical line
                ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(obj.x, obj.baseY);
                ctx.lineTo(obj.x, y);
                ctx.stroke();
            });

            info.textContent = 'Wave motion using sin(time * frequency) for smooth up/down movement';
        }
        else if (mode === 'face') {
            // Draw object that faces mouse
            const objPos = new Vector2D(400, 250);
            const direction = mousePos.subtract(objPos);
            const angle = Math.atan2(direction.y, direction.x);

            // Draw object (triangle)
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

            // Draw line to mouse
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(objPos.x, objPos.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw mouse position
            ctx.fillStyle = '#ffa726';
            ctx.beginPath();
            ctx.arc(mousePos.x, mousePos.y, 8, 0, Math.PI * 2);
            ctx.fill();

            const angleDeg = (angle * 180 / Math.PI).toFixed(1);
            info.textContent = `Using atan2(dy, dx) to face target. Angle: ${angleDeg}°`;
        }
        else if (mode === 'arc') {
            // Projectile arc
            const start = new Vector2D(100, 400);
            const end = mousePos;
            const launchAngle = Math.PI / 4; // 45 degrees
            const gravity = 0.5;

            // Calculate arc
            const points = [];
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const v0 = Math.sqrt(Math.abs(dx * gravity / Math.sin(2 * launchAngle)));
            const vx = v0 * Math.cos(launchAngle);
            const vy = -v0 * Math.sin(launchAngle);

            for (let t = 0; t < 100; t += 0.5) {
                const x = start.x + vx * t;
                const y = start.y + vy * t + 0.5 * gravity * t * t;
                if (y > trigCanvas.height) break;
                points.push({ x, y });
            }

            // Draw arc path
            ctx.strokeStyle = '#4fc3f7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();

            // Draw start
            ctx.fillStyle = '#66bb6a';
            ctx.beginPath();
            ctx.arc(start.x, start.y, 10, 0, Math.PI * 2);
            ctx.fill();

            // Draw target
            ctx.fillStyle = '#ef5350';
            ctx.beginPath();
            ctx.arc(end.x, end.y, 10, 0, Math.PI * 2);
            ctx.fill();

            // Draw projectile if animating
            if (points.length > 0) {
                const idx = Math.floor((time * 2) % points.length);
                const proj = points[idx];
                ctx.fillStyle = '#ffa726';
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            info.textContent = 'Parabolic arc using trigonometry and gravity. Move mouse to change target!';
        }

        requestAnimationFrame(animateTrig);
    }

    animateTrig();
}

// ===================================
// DEMO: Easing Functions
// ===================================
const easingCanvas = document.getElementById('easingDemo');
if (easingCanvas) {
    const ctx = easingCanvas.getContext('2d');
    const info = document.getElementById('easingInfo');
    let currentEasing = 'linear';
    let t = 0;
    let comparing = false;

    // Easing functions
    const easingFunctions = {
        linear: t => t,
        easeIn: t => t * t,
        easeOut: t => t * (2 - t),
        easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        elastic: t => {
            const p = 0.3;
            return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
        },
        bounce: t => {
            if (t < 1 / 2.75) {
                return 7.5625 * t * t;
            } else if (t < 2 / 2.75) {
                return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
            } else if (t < 2.5 / 2.75) {
                return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
            } else {
                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
            }
        }
    };

    // Button handlers
    const buttons = ['Linear', 'EaseIn', 'EaseOut', 'EaseInOut', 'Elastic', 'Bounce'];
    buttons.forEach(btn => {
        const element = document.getElementById(`btn${btn}`);
        if (element) {
            element.addEventListener('click', () => {
                currentEasing = btn.toLowerCase();
                comparing = false;
                t = 0;
            });
        }
    });

    const compareBtn = document.getElementById('btnCompareAll');
    if (compareBtn) {
        compareBtn.addEventListener('click', () => {
            comparing = true;
            t = 0;
        });
    }

    function animateEasing() {
        clearCanvas(ctx, easingCanvas.width, easingCanvas.height);

        // Increment time
        t += 0.005;
        if (t > 1) t = 0;

        const startX = 100;
        const endX = 700;
        const y = 250;

        if (comparing) {
            // Show all easing functions
            const colors = ['#4fc3f7', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc', '#ffeb3b'];
            const names = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'elastic', 'bounce'];

            names.forEach((name, i) => {
                const easedT = easingFunctions[name](t);
                const x = startX + (endX - startX) * easedT;
                const yPos = 100 + i * 60;

                // Draw path
                ctx.strokeStyle = colors[i];
                ctx.globalAlpha = 0.2;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(startX, yPos);
                ctx.lineTo(endX, yPos);
                ctx.stroke();
                ctx.globalAlpha = 1;

                // Draw object
                ctx.fillStyle = colors[i];
                ctx.beginPath();
                ctx.arc(x, yPos, 12, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.fillText(name, 10, yPos + 5);
            });

            info.textContent = `Comparing all easing functions. Progress: ${(t * 100).toFixed(0)}%`;
        } else {
            // Show single easing function
            const easedT = easingFunctions[currentEasing](t);
            const x = startX + (endX - startX) * easedT;

            // Draw graph
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

            // Draw path
            ctx.strokeStyle = '#4fc3f7';
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Draw start and end markers
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(startX, y, 8, 0, Math.PI * 2);
            ctx.arc(endX, y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Draw moving object
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();

            // Draw progress bar
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(100, 350, 600, 20);
            ctx.fillStyle = '#66bb6a';
            ctx.fillRect(100, 350, 600 * t, 20);

            // Labels
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(currentEasing.toUpperCase(), 400, 50);
            ctx.font = '12px monospace';
            ctx.fillText(`Progress: ${(t * 100).toFixed(0)}%`, 400, 380);
            ctx.fillText(`Eased: ${(easedT * 100).toFixed(0)}%`, 400, 395);

            info.textContent = `${currentEasing}: See how the movement feels different with easing!`;
        }

        requestAnimationFrame(animateEasing);
    }

    animateEasing();
}
