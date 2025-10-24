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
