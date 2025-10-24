// ===================================
// ADVANCED DEMOS - INTERACTIVE EXAMPLES
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
// DEMO 1: Steering Behaviors
// ===================================
const steeringCanvas = document.getElementById('steeringDemo');
if (steeringCanvas) {
    const ctx = steeringCanvas.getContext('2d');
    const info = document.getElementById('steeringInfo');

    class SteeringAgent {
        constructor(x, y) {
            this.position = new Vector2D(x, y);
            this.velocity = new Vector2D(0, 0);
            this.acceleration = new Vector2D(0, 0);
            this.maxSpeed = 4;
            this.maxForce = 0.2;
            this.wanderAngle = 0;
        }

        seek(target) {
            const desired = target.subtract(this.position);
            desired.normalize().multiply(this.maxSpeed);
            const steer = desired.subtract(this.velocity);
            steer.limit(this.maxForce);
            return steer;
        }

        arrive(target, slowingRadius = 100) {
            const desired = target.subtract(this.position);
            const distance = desired.length();

            if (distance < slowingRadius) {
                const speed = map(distance, 0, slowingRadius, 0, this.maxSpeed);
                desired.normalize().multiply(speed);
            } else {
                desired.normalize().multiply(this.maxSpeed);
            }

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
            const wanderRadius = 50;
            const wanderDistance = 80;
            const wanderChange = 0.3;

            this.wanderAngle += randomFloat(-wanderChange, wanderChange);

            const circlePos = this.velocity.copy().normalize().multiply(wanderDistance);
            const displacement = Vector2D.fromAngle(this.wanderAngle, wanderRadius);

            return circlePos.add(displacement);
        }

        applyForce(force) {
            this.acceleration.add(force);
        }

        update() {
            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxSpeed);
            this.position.add(this.velocity);
            this.acceleration.multiply(0);

            // Wrap around edges
            if (this.position.x < 0) this.position.x = steeringCanvas.width;
            if (this.position.x > steeringCanvas.width) this.position.x = 0;
            if (this.position.y < 0) this.position.y = steeringCanvas.height;
            if (this.position.y > steeringCanvas.height) this.position.y = 0;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.velocity.angle());

            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(-10, 8);
            ctx.lineTo(-10, -8);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }

    const agents = [];
    let mousePos = new Vector2D(400, 250);
    let currentMode = 'seek';

    for (let i = 0; i < 5; i++) {
        agents.push(new SteeringAgent(
            randomFloat(50, steeringCanvas.width - 50),
            randomFloat(50, steeringCanvas.height - 50)
        ));
    }

    steeringCanvas.addEventListener('mousemove', (e) => {
        const rect = steeringCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    document.getElementById('btnSeek').addEventListener('click', () => currentMode = 'seek');
    document.getElementById('btnArrive').addEventListener('click', () => currentMode = 'arrive');
    document.getElementById('btnFlee').addEventListener('click', () => currentMode = 'flee');
    document.getElementById('btnWander').addEventListener('click', () => currentMode = 'wander');

    function animateSteering() {
        clearCanvas(ctx, steeringCanvas.width, steeringCanvas.height);

        // Draw target
        ctx.strokeStyle = '#66bb6a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 20, 0, Math.PI * 2);
        ctx.stroke();

        agents.forEach(agent => {
            let force;
            if (currentMode === 'seek') {
                force = agent.seek(mousePos);
            } else if (currentMode === 'arrive') {
                force = agent.arrive(mousePos);
            } else if (currentMode === 'flee') {
                force = agent.flee(mousePos);
            } else if (currentMode === 'wander') {
                force = agent.wander();
            }

            agent.applyForce(force);
            agent.update();
            agent.draw(ctx);
        });

        info.textContent = `Mode: ${currentMode.toUpperCase()}`;

        requestAnimationFrame(animateSteering);
    }

    animateSteering();
}

// ===================================
// DEMO 2: Bézier Curves
// ===================================
const bezierCanvas = document.getElementById('bezierDemo');
if (bezierCanvas) {
    const ctx = bezierCanvas.getContext('2d');
    const info = document.getElementById('bezierInfo');

    let points = [
        new Vector2D(100, 250),
        new Vector2D(300, 100),
        new Vector2D(500, 400),
        new Vector2D(700, 250)
    ];

    let curveType = 'cubic';
    let animating = false;
    let animationT = 0;
    let draggingPoint = null;

    function quadraticBezier(p0, p1, p2, t) {
        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        return new Vector2D(x, y);
    }

    function cubicBezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
        const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

        return new Vector2D(x, y);
    }

    function drawBezier() {
        clearCanvas(ctx, bezierCanvas.width, bezierCanvas.height);
        drawGrid(ctx, bezierCanvas.width, bezierCanvas.height);

        // Draw curve
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let t = 0; t <= 1; t += 0.01) {
            let point;
            if (curveType === 'quadratic') {
                point = quadraticBezier(points[0], points[1], points[2], t);
            } else {
                point = cubicBezier(points[0], points[1], points[2], points[3], t);
            }

            if (t === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();

        // Draw control points
        ctx.strokeStyle = '#ffa726';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < (curveType === 'quadratic' ? 3 : 4); i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw control point circles
        for (let i = 0; i < (curveType === 'quadratic' ? 3 : 4); i++) {
            ctx.fillStyle = i === 0 || i === (curveType === 'quadratic' ? 2 : 3) ? '#66bb6a' : '#ffa726';
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw animated point
        if (animating) {
            let animPoint;
            if (curveType === 'quadratic') {
                animPoint = quadraticBezier(points[0], points[1], points[2], animationT);
            } else {
                animPoint = cubicBezier(points[0], points[1], points[2], points[3], animationT);
            }

            ctx.fillStyle = '#ef5350';
            ctx.beginPath();
            ctx.arc(animPoint.x, animPoint.y, 8, 0, Math.PI * 2);
            ctx.fill();

            animationT += 0.01;
            if (animationT > 1) animationT = 0;
        }
    }

    bezierCanvas.addEventListener('mousedown', (e) => {
        const rect = bezierCanvas.getBoundingClientRect();
        const mousePos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);

        for (let i = 0; i < (curveType === 'quadratic' ? 3 : 4); i++) {
            if (points[i].distance(mousePos) < 15) {
                draggingPoint = i;
                break;
            }
        }
    });

    bezierCanvas.addEventListener('mousemove', (e) => {
        if (draggingPoint !== null) {
            const rect = bezierCanvas.getBoundingClientRect();
            points[draggingPoint].x = e.clientX - rect.left;
            points[draggingPoint].y = e.clientY - rect.top;
        }
    });

    bezierCanvas.addEventListener('mouseup', () => {
        draggingPoint = null;
    });

    document.getElementById('btnQuadratic').addEventListener('click', () => {
        curveType = 'quadratic';
        animating = false;
    });

    document.getElementById('btnCubic').addEventListener('click', () => {
        curveType = 'cubic';
        animating = false;
    });

    document.getElementById('btnAnimate').addEventListener('click', () => {
        animating = !animating;
        animationT = 0;
    });

    function animateBezier() {
        drawBezier();
        requestAnimationFrame(animateBezier);
    }

    animateBezier();
}

// ===================================
// DEMO 3: A* Pathfinding
// ===================================
const astarCanvas = document.getElementById('astarDemo');
if (astarCanvas) {
    const ctx = astarCanvas.getContext('2d');
    const info = document.getElementById('astarInfo');

    const gridSize = 25;
    const cols = Math.floor(astarCanvas.width / gridSize);
    const rows = Math.floor(astarCanvas.height / gridSize);

    let grid = [];
    let start = null;
    let goal = null;
    let path = [];
    let currentMode = 'start';

    class Node {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.g = 0;
            this.h = 0;
            this.f = 0;
            this.parent = null;
            this.wall = false;
        }
    }

    // Initialize grid
    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = new Node(i, j);
        }
    }

    start = grid[2][2];
    goal = grid[cols - 3][rows - 3];

    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    function getNeighbors(node) {
        const neighbors = [];
        const { x, y } = node;

        if (x > 0) neighbors.push(grid[x - 1][y]);
        if (x < cols - 1) neighbors.push(grid[x + 1][y]);
        if (y > 0) neighbors.push(grid[x][y - 1]);
        if (y < rows - 1) neighbors.push(grid[x][y + 1]);

        return neighbors.filter(n => !n.wall);
    }

    function findPath() {
        if (!start || !goal) return;

        // Reset
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].g = 0;
                grid[i][j].h = 0;
                grid[i][j].f = 0;
                grid[i][j].parent = null;
            }
        }

        const openSet = [start];
        const closedSet = [];

        while (openSet.length > 0) {
            let current = openSet[0];
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < current.f) {
                    current = openSet[i];
                }
            }

            if (current === goal) {
                path = [];
                let temp = current;
                while (temp) {
                    path.push(temp);
                    temp = temp.parent;
                }
                return;
            }

            openSet.splice(openSet.indexOf(current), 1);
            closedSet.push(current);

            const neighbors = getNeighbors(current);
            for (const neighbor of neighbors) {
                if (closedSet.includes(neighbor)) continue;

                const tempG = current.g + 1;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tempG >= neighbor.g) {
                    continue;
                }

                neighbor.g = tempG;
                neighbor.h = heuristic(neighbor, goal);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        }

        path = [];
    }

    function drawGrid() {
        clearCanvas(ctx, astarCanvas.width, astarCanvas.height);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const node = grid[i][j];
                const x = i * gridSize;
                const y = j * gridSize;

                if (node.wall) {
                    ctx.fillStyle = '#2a2f4a';
                } else if (node === start) {
                    ctx.fillStyle = '#66bb6a';
                } else if (node === goal) {
                    ctx.fillStyle = '#ef5350';
                } else if (path.includes(node)) {
                    ctx.fillStyle = '#ffa726';
                } else {
                    ctx.fillStyle = '#1a1f3a';
                }

                ctx.fillRect(x, y, gridSize - 1, gridSize - 1);
            }
        }
    }

    astarCanvas.addEventListener('click', (e) => {
        const rect = astarCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / gridSize);
        const y = Math.floor((e.clientY - rect.top) / gridSize);

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            if (currentMode === 'start') {
                start = grid[x][y];
                start.wall = false;
            } else if (currentMode === 'goal') {
                goal = grid[x][y];
                goal.wall = false;
            }
        }
    });

    let isDrawingWalls = false;
    astarCanvas.addEventListener('mousedown', (e) => {
        if (currentMode === 'walls') {
            isDrawingWalls = true;
            const rect = astarCanvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / gridSize);
            const y = Math.floor((e.clientY - rect.top) / gridSize);

            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                const node = grid[x][y];
                if (node !== start && node !== goal) {
                    node.wall = !node.wall;
                }
            }
        }
    });

    astarCanvas.addEventListener('mousemove', (e) => {
        if (isDrawingWalls && currentMode === 'walls') {
            const rect = astarCanvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / gridSize);
            const y = Math.floor((e.clientY - rect.top) / gridSize);

            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                const node = grid[x][y];
                if (node !== start && node !== goal) {
                    node.wall = true;
                }
            }
        }
    });

    astarCanvas.addEventListener('mouseup', () => {
        isDrawingWalls = false;
    });

    document.getElementById('btnSetStart').addEventListener('click', () => currentMode = 'start');
    document.getElementById('btnSetGoal').addEventListener('click', () => currentMode = 'goal');
    document.getElementById('btnAddWalls').addEventListener('click', () => currentMode = 'walls');
    document.getElementById('btnFindPath').addEventListener('click', () => findPath());
    document.getElementById('btnClearGrid').addEventListener('click', () => {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].wall = false;
            }
        }
        path = [];
    });

    function animateAstar() {
        drawGrid();
        info.textContent = `Mode: ${currentMode.toUpperCase()} | Path length: ${path.length}`;
        requestAnimationFrame(animateAstar);
    }

    animateAstar();
}

// ===================================
// DEMO 4: State Machines
// ===================================
const stateCanvas = document.getElementById('stateDemo');
if (stateCanvas) {
    const ctx = stateCanvas.getContext('2d');
    const info = document.getElementById('stateInfo');

    class State {
        enter(entity) {}
        update(entity) {}
        exit(entity) {}
    }

    class PatrolState extends State {
        enter(entity) {
            entity.speed = 2;
            entity.color = '#66bb6a';
            entity.stateName = 'PATROL';
        }

        update(entity) {
            if (Math.random() < 0.02) {
                entity.direction = Vector2D.random(1);
            }

            const distToPlayer = entity.position.distance(player.position);
            if (distToPlayer < 150) {
                entity.setState(new ChaseState());
            }
        }
    }

    class ChaseState extends State {
        enter(entity) {
            entity.speed = 4;
            entity.color = '#ffa726';
            entity.stateName = 'CHASE';
        }

        update(entity) {
            entity.direction = player.position.subtract(entity.position).normalize();

            const distToPlayer = entity.position.distance(player.position);

            if (distToPlayer < 40) {
                entity.setState(new AttackState());
            } else if (distToPlayer > 300) {
                entity.setState(new PatrolState());
            }
        }
    }

    class AttackState extends State {
        constructor() {
            super();
            this.attackTime = 0;
        }

        enter(entity) {
            entity.speed = 0;
            entity.color = '#ef5350';
            entity.stateName = 'ATTACK';
        }

        update(entity) {
            this.attackTime++;

            if (this.attackTime > 60) {
                entity.setState(new ChaseState());
            }
        }
    }

    class Enemy {
        constructor(x, y) {
            this.position = new Vector2D(x, y);
            this.direction = Vector2D.random(1);
            this.speed = 2;
            this.color = '#66bb6a';
            this.currentState = new PatrolState();
            this.currentState.enter(this);
            this.stateName = 'PATROL';
        }

        setState(newState) {
            this.currentState.exit(this);
            this.currentState = newState;
            this.currentState.enter(this);
        }

        update() {
            this.currentState.update(this);

            this.position.add(this.direction.copy().multiply(this.speed));

            // Wrap around
            if (this.position.x < 0) this.position.x = stateCanvas.width;
            if (this.position.x > stateCanvas.width) this.position.x = 0;
            if (this.position.y < 0) this.position.y = stateCanvas.height;
            if (this.position.y > stateCanvas.height) this.position.y = 0;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.stateName, this.position.x, this.position.y - 25);
        }
    }

    const player = {
        position: new Vector2D(400, 250),
        speed: 5
    };

    const enemies = [];
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

    document.getElementById('btnAddEnemy').addEventListener('click', () => {
        enemies.push(new Enemy(
            randomFloat(50, stateCanvas.width - 50),
            randomFloat(50, stateCanvas.height - 50)
        ));
    });

    document.getElementById('btnResetStates').addEventListener('click', () => {
        enemies.length = 0;
        player.position.set(400, 250);
    });

    // Add initial enemies
    for (let i = 0; i < 3; i++) {
        enemies.push(new Enemy(
            randomFloat(50, stateCanvas.width - 50),
            randomFloat(50, stateCanvas.height - 50)
        ));
    }

    function animateStates() {
        clearCanvas(ctx, stateCanvas.width, stateCanvas.height);

        // Update player
        const dir = new Vector2D(
            (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
            (keys.s ? 1 : 0) - (keys.w ? 1 : 0)
        );

        if (dir.length() > 0) {
            dir.normalize().multiply(player.speed);
            player.position.add(dir);
        }

        player.position.x = clamp(player.position.x, 20, stateCanvas.width - 20);
        player.position.y = clamp(player.position.y, 20, stateCanvas.height - 20);

        // Draw player
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Update and draw enemies
        enemies.forEach(enemy => {
            enemy.update();
            enemy.draw(ctx);
        });

        const stateCount = {};
        enemies.forEach(e => {
            stateCount[e.stateName] = (stateCount[e.stateName] || 0) + 1;
        });

        info.textContent = `Enemies: ${enemies.length} | ${Object.entries(stateCount).map(([state, count]) => `${state}: ${count}`).join(' | ')}`;

        requestAnimationFrame(animateStates);
    }

    animateStates();
}
