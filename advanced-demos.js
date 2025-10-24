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
// DEMO 1: Steering Behaviors (Enhanced)
// ===================================
const steeringCanvas = document.getElementById('steeringDemo');
if (steeringCanvas) {
    const ctx = steeringCanvas.getContext('2d');
    const info = document.getElementById('steeringInfo');

    class SteeringAgent {
        constructor(x, y, color = '#4fc3f7') {
            this.position = new Vector2D(x, y);
            this.velocity = new Vector2D(randomFloat(-2, 2), randomFloat(-2, 2));
            this.acceleration = new Vector2D(0, 0);
            this.maxSpeed = 4;
            this.maxForce = 0.15;
            this.wanderAngle = randomFloat(0, Math.PI * 2);
            this.radius = 8;
            this.color = color;
        }

        // Basic: Seek toward target
        seek(target) {
            const desired = target.subtract(this.position);
            desired.normalize().multiply(this.maxSpeed);
            const steer = desired.subtract(this.velocity);
            steer.limit(this.maxForce);
            return steer;
        }

        // Advanced: Arrive - slow down as we approach
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

        // Basic: Flee from threat
        flee(threat) {
            const desired = this.position.subtract(threat);
            desired.normalize().multiply(this.maxSpeed);
            const steer = desired.subtract(this.velocity);
            steer.limit(this.maxForce);
            return steer;
        }

        // Advanced: Pursue - seek future predicted position
        pursue(target, targetVelocity) {
            const distance = this.position.distance(target);
            const T = distance / this.maxSpeed; // Prediction time
            const futurePosition = target.copy().add(targetVelocity.copy().multiply(T));
            return this.seek(futurePosition);
        }

        // Advanced: Evade - flee from future predicted position
        evade(threat, threatVelocity) {
            const distance = this.position.distance(threat);
            const T = distance / this.maxSpeed;
            const futurePosition = threat.copy().add(threatVelocity.copy().multiply(T));
            return this.flee(futurePosition);
        }

        // Wander - random smooth movement
        wander() {
            const wanderRadius = 50;
            const wanderDistance = 80;
            const wanderChange = 0.3;

            this.wanderAngle += randomFloat(-wanderChange, wanderChange);

            const circlePos = this.velocity.copy().normalize().multiply(wanderDistance);
            const displacement = Vector2D.fromAngle(this.wanderAngle, wanderRadius);

            return circlePos.add(displacement);
        }

        // Obstacle Avoidance
        avoidObstacles(obstacles) {
            const ahead = this.velocity.copy().normalize().multiply(50);
            const aheadPos = this.position.copy().add(ahead);
            const ahead2Pos = this.position.copy().add(ahead.copy().multiply(0.5));

            let mostThreatening = null;
            let closestDist = Infinity;

            for (const obstacle of obstacles) {
                const dist1 = aheadPos.distance(obstacle.position);
                const dist2 = ahead2Pos.distance(obstacle.position);
                const dist = Math.min(dist1, dist2);

                if (dist < obstacle.radius + this.radius && dist < closestDist) {
                    closestDist = dist;
                    mostThreatening = obstacle;
                }
            }

            if (mostThreatening) {
                const avoidance = aheadPos.subtract(mostThreatening.position);
                avoidance.normalize().multiply(2);
                return avoidance;
            }

            return new Vector2D(0, 0);
        }

        // Separation - avoid crowding neighbors
        separate(neighbors, desiredSeparation = 40) {
            const steer = new Vector2D(0, 0);
            let count = 0;

            for (const other of neighbors) {
                const d = this.position.distance(other.position);
                if (d > 0 && d < desiredSeparation) {
                    const diff = this.position.subtract(other.position);
                    diff.normalize();
                    diff.divide(d); // Weight by distance
                    steer.add(diff);
                    count++;
                }
            }

            if (count > 0) {
                steer.divide(count);
                steer.normalize();
                steer.multiply(this.maxSpeed);
                steer.subtract(this.velocity);
                steer.limit(this.maxForce);
            }

            return steer;
        }

        // Cohesion - steer toward average position of neighbors
        cohesion(neighbors, neighborDist = 80) {
            const sum = new Vector2D(0, 0);
            let count = 0;

            for (const other of neighbors) {
                const d = this.position.distance(other.position);
                if (d > 0 && d < neighborDist) {
                    sum.add(other.position);
                    count++;
                }
            }

            if (count > 0) {
                sum.divide(count);
                return this.seek(sum);
            }

            return new Vector2D(0, 0);
        }

        // Alignment - match velocity with neighbors
        align(neighbors, neighborDist = 80) {
            const sum = new Vector2D(0, 0);
            let count = 0;

            for (const other of neighbors) {
                const d = this.position.distance(other.position);
                if (d > 0 && d < neighborDist) {
                    sum.add(other.velocity);
                    count++;
                }
            }

            if (count > 0) {
                sum.divide(count);
                sum.normalize();
                sum.multiply(this.maxSpeed);
                const steer = sum.subtract(this.velocity);
                steer.limit(this.maxForce);
                return steer;
            }

            return new Vector2D(0, 0);
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

        draw(ctx, showVelocity = false) {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);

            // Draw velocity line if enabled
            if (showVelocity && this.velocity.length() > 0.1) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const velEnd = this.velocity.copy().multiply(5);
                ctx.lineTo(velEnd.x, velEnd.y);
                ctx.stroke();
            }

            ctx.rotate(this.velocity.angle());

            // Draw agent as triangle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(-8, 6);
            ctx.lineTo(-8, -6);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }
    }

    class Obstacle {
        constructor(x, y, radius = 30) {
            this.position = new Vector2D(x, y);
            this.radius = radius;
        }

        draw(ctx) {
            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#b71c1c';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    const agents = [];
    const obstacles = [];
    let mousePos = new Vector2D(400, 250);
    let mouseVel = new Vector2D(0, 0);
    let lastMousePos = mousePos.copy();
    let currentMode = 'seek';

    const modeDescriptions = {
        'seek': 'Move directly toward target',
        'arrive': 'Slow down when approaching target',
        'flee': 'Run away from target',
        'pursue': 'Predict and chase moving target',
        'evade': 'Predict and escape from moving target',
        'wander': 'Random exploration',
        'avoid': 'Steer around obstacles',
        'flock': 'Separation + Cohesion + Alignment'
    };

    // Initialize agents
    for (let i = 0; i < 15; i++) {
        agents.push(new SteeringAgent(
            randomFloat(50, steeringCanvas.width - 50),
            randomFloat(50, steeringCanvas.height - 50),
            `hsl(${i * 24}, 70%, 60%)`
        ));
    }

    // Add some obstacles
    obstacles.push(new Obstacle(300, 150, 35));
    obstacles.push(new Obstacle(500, 350, 40));
    obstacles.push(new Obstacle(650, 200, 30));

    steeringCanvas.addEventListener('mousemove', (e) => {
        const rect = steeringCanvas.getBoundingClientRect();
        lastMousePos = mousePos.copy();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
        mouseVel = mousePos.subtract(lastMousePos);
    });

    // Mode buttons
    const modeButtons = {
        'btnSeek': 'seek',
        'btnArrive': 'arrive',
        'btnFlee': 'flee',
        'btnWander': 'wander',
        'btnPursue': 'pursue',
        'btnEvade': 'evade',
        'btnAvoid': 'avoid',
        'btnFlock': 'flock'
    };

    for (const [btnId, mode] of Object.entries(modeButtons)) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                currentMode = mode;
                // Update button states
                Object.keys(modeButtons).forEach(id => {
                    const b = document.getElementById(id);
                    if (b) b.classList.remove('active');
                });
                btn.classList.add('active');
            });
        }
    }

    // Set initial active button
    const btnSeek = document.getElementById('btnSeek');
    if (btnSeek) btnSeek.classList.add('active');

    function animateSteering() {
        clearCanvas(ctx, steeringCanvas.width, steeringCanvas.height);

        // Draw obstacles
        obstacles.forEach(obs => obs.draw(ctx));

        // Draw target/threat
        if (currentMode !== 'wander' && currentMode !== 'flock') {
            ctx.strokeStyle = currentMode === 'flee' || currentMode === 'evade' ? '#f44336' : '#66bb6a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(mousePos.x, mousePos.y, 25, 0, Math.PI * 2);
            ctx.stroke();

            // Draw predicted position for pursue/evade
            if (currentMode === 'pursue' || currentMode === 'evade') {
                const predictedPos = mousePos.copy().add(mouseVel.copy().multiply(10));
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(predictedPos.x, predictedPos.y, 20, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Update and draw agents
        agents.forEach(agent => {
            let force = new Vector2D(0, 0);

            switch(currentMode) {
                case 'seek':
                    force = agent.seek(mousePos);
                    break;
                case 'arrive':
                    force = agent.arrive(mousePos);
                    break;
                case 'flee':
                    force = agent.flee(mousePos);
                    break;
                case 'pursue':
                    force = agent.pursue(mousePos, mouseVel);
                    break;
                case 'evade':
                    force = agent.evade(mousePos, mouseVel);
                    break;
                case 'wander':
                    force = agent.wander();
                    break;
                case 'avoid':
                    const seekForce = agent.seek(mousePos);
                    const avoidForce = agent.avoidObstacles(obstacles);
                    force = seekForce.add(avoidForce.multiply(3)); // Avoidance is weighted higher
                    break;
                case 'flock':
                    const sep = agent.separate(agents);
                    const coh = agent.cohesion(agents);
                    const ali = agent.align(agents);
                    // Weight the three flocking behaviors
                    force = sep.multiply(1.5).add(coh).add(ali);
                    break;
            }

            agent.applyForce(force);
            agent.update();
            agent.draw(ctx, currentMode === 'flock');
        });

        info.textContent = `Mode: ${currentMode.toUpperCase()} - ${modeDescriptions[currentMode]} | Agents: ${agents.length}`;

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

// ===================================
// DEMO 5: Quaternions
// ===================================
const quaternionCanvas = document.getElementById('quaternionDemo');
if (quaternionCanvas) {
    const ctx = quaternionCanvas.getContext('2d');
    const info = document.getElementById('quaternionInfo');

    // Simple 3D visualization using 2D canvas
    let rotationX = 0, rotationY = 0, rotationZ = 0;
    let targetRotX = 0, targetRotY = 0, targetRotZ = 0;
    let autoRotate = false;

    // Draw a 3D cube projected to 2D
    function drawCube(ctx, rotation) {
        const centerX = quaternionCanvas.width / 2;
        const centerY = quaternionCanvas.height / 2;
        const size = 100;

        // Cube vertices
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ].map(v => v.map(c => c * size));

        // Rotate vertices
        const rotated = vertices.map(v => {
            let [x, y, z] = v;

            // Rotate X
            let temp = y;
            y = temp * Math.cos(rotation.x) - z * Math.sin(rotation.x);
            z = temp * Math.sin(rotation.x) + z * Math.cos(rotation.x);

            // Rotate Y
            temp = x;
            x = temp * Math.cos(rotation.y) + z * Math.sin(rotation.y);
            z = -temp * Math.sin(rotation.y) + z * Math.cos(rotation.y);

            // Rotate Z
            temp = x;
            x = temp * Math.cos(rotation.z) - y * Math.sin(rotation.z);
            y = temp * Math.sin(rotation.z) + y * Math.cos(rotation.z);

            return [x, y, z];
        });

        // Project to 2D
        const projected = rotated.map(v => [
            centerX + v[0],
            centerY + v[1]
        ]);

        // Draw edges
        const edges = [
            [0,1], [1,2], [2,3], [3,0],
            [4,5], [5,6], [6,7], [7,4],
            [0,4], [1,5], [2,6], [3,7]
        ];

        ctx.strokeStyle = '#42a5f5';
        ctx.lineWidth = 3;
        edges.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.moveTo(projected[i][0], projected[i][1]);
            ctx.lineTo(projected[j][0], projected[j][1]);
            ctx.stroke();
        });

        // Draw vertices
        projected.forEach((p, i) => {
            ctx.fillStyle = i < 4 ? '#ff5722' : '#4caf50';
            ctx.beginPath();
            ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    document.getElementById('btnRotateX').addEventListener('click', () => {
        targetRotX += Math.PI / 4;
        autoRotate = false;
    });

    document.getElementById('btnRotateY').addEventListener('click', () => {
        targetRotY += Math.PI / 4;
        autoRotate = false;
    });

    document.getElementById('btnRotateZ').addEventListener('click', () => {
        targetRotZ += Math.PI / 4;
        autoRotate = false;
    });

    document.getElementById('btnSlerp').addEventListener('click', () => {
        autoRotate = !autoRotate;
    });

    function animateQuaternion() {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, quaternionCanvas.width, quaternionCanvas.height);

        // Smooth interpolation (SLERP simulation)
        rotationX += (targetRotX - rotationX) * 0.1;
        rotationY += (targetRotY - rotationY) * 0.1;
        rotationZ += (targetRotZ - rotationZ) * 0.1;

        if (autoRotate) {
            targetRotX += 0.01;
            targetRotY += 0.015;
            targetRotZ += 0.008;
        }

        drawCube(ctx, { x: rotationX, y: rotationY, z: rotationZ });

        info.textContent = `Rotation: X=${(rotationX % (Math.PI * 2)).toFixed(2)}, Y=${(rotationY % (Math.PI * 2)).toFixed(2)}, Z=${(rotationZ % (Math.PI * 2)).toFixed(2)}`;

        requestAnimationFrame(animateQuaternion);
    }

    animateQuaternion();
}

// ===================================
// DEMO 6: Inverse Kinematics
// ===================================
const ikCanvas = document.getElementById('ikDemo');
if (ikCanvas) {
    const ctx = ikCanvas.getContext('2d');
    const info = document.getElementById('ikInfo');

    const arms = [];
    let mousePos = new Vector2D(ikCanvas.width / 2, ikCanvas.height / 2);

    class TwoJointIK {
        constructor(baseX, baseY, length1, length2) {
            this.base = new Vector2D(baseX, baseY);
            this.length1 = length1;
            this.length2 = length2;
            this.joint = new Vector2D(0, 0);
            this.end = new Vector2D(0, 0);
        }

        solve(targetX, targetY) {
            const target = new Vector2D(targetX, targetY);
            const toTarget = target.subtract(this.base);
            const distance = toTarget.length();

            const maxReach = this.length1 + this.length2;

            if (distance >= maxReach) {
                const direction = toTarget.normalize();
                this.joint = this.base.copy().add(direction.copy().multiply(this.length1));
                this.end = this.joint.copy().add(direction.copy().multiply(this.length2));
                return;
            }

            if (distance < Math.abs(this.length1 - this.length2)) {
                const direction = toTarget.normalize();
                this.joint = this.base.copy().add(direction.multiply(this.length1));
                this.end = target.copy();
                return;
            }

            const a = this.length1;
            const b = this.length2;
            const c = distance;

            const angleToTarget = Math.atan2(toTarget.y, toTarget.x);
            const cosAngle1 = (a * a + c * c - b * b) / (2 * a * c);
            const angle1 = Math.acos(clamp(cosAngle1, -1, 1));

            const jointAngle = angleToTarget + angle1;
            this.joint.x = this.base.x + a * Math.cos(jointAngle);
            this.joint.y = this.base.y + a * Math.sin(jointAngle);

            this.end = target.copy();
        }

        draw(ctx) {
            ctx.strokeStyle = '#42a5f5';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(this.base.x, this.base.y);
            ctx.lineTo(this.joint.x, this.joint.y);
            ctx.lineTo(this.end.x, this.end.y);
            ctx.stroke();

            [this.base, this.joint, this.end].forEach((joint, i) => {
                ctx.fillStyle = i === 2 ? '#f44336' : '#66bb6a';
                ctx.beginPath();
                ctx.arc(joint.x, joint.y, 10, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    // Add initial arm
    arms.push(new TwoJointIK(ikCanvas.width / 2, ikCanvas.height - 50, 100, 80));

    ikCanvas.addEventListener('mousemove', (e) => {
        const rect = ikCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    document.getElementById('btnAddArm').addEventListener('click', () => {
        const x = randomFloat(100, ikCanvas.width - 100);
        const y = randomFloat(ikCanvas.height - 100, ikCanvas.height - 50);
        arms.push(new TwoJointIK(x, y, 100, 80));
    });

    document.getElementById('btnResetIK').addEventListener('click', () => {
        arms.length = 0;
        arms.push(new TwoJointIK(ikCanvas.width / 2, ikCanvas.height - 50, 100, 80));
    });

    function animateIK() {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, ikCanvas.width, ikCanvas.height);

        // Draw target
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Update and draw arms
        arms.forEach(arm => {
            arm.solve(mousePos.x, mousePos.y);
            arm.draw(ctx);
        });

        info.textContent = `Arms: ${arms.length} | Target: (${Math.floor(mousePos.x)}, ${Math.floor(mousePos.y)})`;

        requestAnimationFrame(animateIK);
    }

    animateIK();
}

// ===================================
// DEMO 7: Shadow Casting
// ===================================
const shadowCanvas = document.getElementById('shadowDemo');
if (shadowCanvas) {
    const ctx = shadowCanvas.getContext('2d');
    const info = document.getElementById('shadowInfo');

    const walls = [];
    let mousePos = new Vector2D(shadowCanvas.width / 2, shadowCanvas.height / 2);
    let showRays = false;

    class Wall {
        constructor(x1, y1, x2, y2) {
            this.p1 = new Vector2D(x1, y1);
            this.p2 = new Vector2D(x2, y2);
        }

        draw(ctx) {
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
            ctx.stroke();
        }
    }

    // Add border walls
    const margin = 0;
    walls.push(new Wall(margin, margin, shadowCanvas.width - margin, margin));
    walls.push(new Wall(shadowCanvas.width - margin, margin, shadowCanvas.width - margin, shadowCanvas.height - margin));
    walls.push(new Wall(shadowCanvas.width - margin, shadowCanvas.height - margin, margin, shadowCanvas.height - margin));
    walls.push(new Wall(margin, shadowCanvas.height - margin, margin, margin));

    // Add some obstacles
    walls.push(new Wall(200, 150, 350, 150));
    walls.push(new Wall(350, 150, 350, 250));
    walls.push(new Wall(500, 300, 600, 350));

    function getAngles(source) {
        const angles = [];
        for (const wall of walls) {
            const angle1 = Math.atan2(wall.p1.y - source.y, wall.p1.x - source.x);
            const angle2 = Math.atan2(wall.p2.y - source.y, wall.p2.x - source.x);
            angles.push(angle1 - 0.0001, angle1, angle1 + 0.0001);
            angles.push(angle2 - 0.0001, angle2, angle2 + 0.0001);
        }
        return angles;
    }

    function castRay(source, angle) {
        const direction = new Vector2D(Math.cos(angle), Math.sin(angle));
        const rayEnd = source.copy().add(direction.multiply(2000));

        let closestIntersection = rayEnd;
        let closestDistance = 2000;

        for (const wall of walls) {
            const intersection = lineIntersection(source, rayEnd, wall.p1, wall.p2);
            if (intersection) {
                const dist = source.distance(intersection);
                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestIntersection = intersection;
                }
            }
        }

        return closestIntersection;
    }

    function getVisibleArea(source) {
        const angles = getAngles(source);
        const intersections = [];

        for (const angle of angles) {
            const point = castRay(source, angle);
            intersections.push({
                point: point,
                angle: Math.atan2(point.y - source.y, point.x - source.x)
            });
        }

        intersections.sort((a, b) => a.angle - b.angle);
        return intersections.map(i => i.point);
    }

    shadowCanvas.addEventListener('mousemove', (e) => {
        const rect = shadowCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    document.getElementById('btnAddObstacle').addEventListener('click', () => {
        const x = randomFloat(100, shadowCanvas.width - 200);
        const y = randomFloat(100, shadowCanvas.height - 100);
        const length = randomFloat(50, 150);
        const angle = randomFloat(0, Math.PI * 2);
        const x2 = x + Math.cos(angle) * length;
        const y2 = y + Math.sin(angle) * length;
        walls.push(new Wall(x, y, x2, y2));
    });

    document.getElementById('btnClearObstacles').addEventListener('click', () => {
        walls.length = 4; // Keep border walls
    });

    document.getElementById('btnToggleRays').addEventListener('click', () => {
        showRays = !showRays;
    });

    function animateShadow() {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);

        const visibleArea = getVisibleArea(mousePos);

        // Draw visible area
        ctx.fillStyle = 'rgba(255, 255, 150, 0.15)';
        ctx.beginPath();
        ctx.moveTo(mousePos.x, mousePos.y);
        visibleArea.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();

        // Draw rays if enabled
        if (showRays) {
            ctx.strokeStyle = 'rgba(255, 255, 100, 0.3)';
            ctx.lineWidth = 1;
            visibleArea.forEach(p => {
                ctx.beginPath();
                ctx.moveTo(mousePos.x, mousePos.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            });
        }

        // Draw walls
        walls.forEach(wall => wall.draw(ctx));

        // Draw light source
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffeb3b';
        ctx.fill();
        ctx.shadowBlur = 0;

        info.textContent = `Obstacles: ${walls.length - 4} | Rays: ${showRays ? 'Visible' : 'Hidden'}`;

        requestAnimationFrame(animateShadow);
    }

    animateShadow();
}
