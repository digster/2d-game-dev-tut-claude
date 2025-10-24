// ===================================
// EXPERT DEMOS - INTERACTIVE EXAMPLES
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
// DEMO 1: QuadTree
// ===================================
const quadtreeCanvas = document.getElementById('quadtreeDemo');
if (quadtreeCanvas) {
    const ctx = quadtreeCanvas.getContext('2d');
    const info = document.getElementById('quadInfo');

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
            if (!this.contains(point)) {
                return false;
            }

            if (this.objects.length < this.capacity) {
                this.objects.push(point);
                return true;
            }

            if (!this.divided) {
                this.subdivide();
            }

            return this.northeast.insert(point) ||
                   this.northwest.insert(point) ||
                   this.southeast.insert(point) ||
                   this.southwest.insert(point);
        }

        contains(point) {
            return point.x >= this.boundary.x &&
                   point.x < this.boundary.x + this.boundary.width &&
                   point.y >= this.boundary.y &&
                   point.y < this.boundary.y + this.boundary.height;
        }

        query(range, found = []) {
            if (!this.intersects(range)) {
                return found;
            }

            for (const point of this.objects) {
                if (this.rangeContains(range, point)) {
                    found.push(point);
                }
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
            return point.x >= range.x &&
                   point.x <= range.x + range.width &&
                   point.y >= range.y &&
                   point.y <= range.y + range.height;
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
            points.push(new Vector2D(
                randomFloat(0, quadtreeCanvas.width),
                randomFloat(0, quadtreeCanvas.height)
            ));
        }
    });

    document.getElementById('btnToggleTree').addEventListener('click', () => {
        showTree = !showTree;
    });

    document.getElementById('btnClearQuad').addEventListener('click', () => {
        points.length = 0;
    });

    quadtreeCanvas.addEventListener('mousemove', (e) => {
        const rect = quadtreeCanvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    function animateQuadtree() {
        clearCanvas(ctx, quadtreeCanvas.width, quadtreeCanvas.height);

        // Build quadtree
        const boundary = {x: 0, y: 0, width: quadtreeCanvas.width, height: quadtreeCanvas.height};
        const quadtree = new QuadTree(boundary);

        points.forEach(point => {
            quadtree.insert(point);
        });

        // Draw tree structure
        if (showTree) {
            quadtree.draw(ctx);
        }

        // Query area around mouse
        const queryRange = {
            x: mousePos.x - 75,
            y: mousePos.y - 75,
            width: 150,
            height: 150
        };

        const found = quadtree.query(queryRange);

        // Draw query range
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(queryRange.x, queryRange.y, queryRange.width, queryRange.height);

        // Draw all points
        points.forEach(point => {
            ctx.fillStyle = found.includes(point) ? '#ffa726' : '#66bb6a';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        info.textContent = `Total points: ${points.length} | Found in range: ${found.length}`;

        requestAnimationFrame(animateQuadtree);
    }

    // Add initial points
    for (let i = 0; i < 50; i++) {
        points.push(new Vector2D(
            randomFloat(0, quadtreeCanvas.width),
            randomFloat(0, quadtreeCanvas.height)
        ));
    }

    animateQuadtree();
}

// ===================================
// DEMO 2: Object Pooling
// ===================================
const poolingCanvas = document.getElementById('poolingDemo');
if (poolingCanvas) {
    const ctx = poolingCanvas.getContext('2d');
    const info = document.getElementById('poolInfo');

    class ObjectPool {
        constructor(createFn, resetFn, initialSize = 50) {
            this.createFn = createFn;
            this.resetFn = resetFn;
            this.pool = [];
            this.active = [];

            for (let i = 0; i < initialSize; i++) {
                this.pool.push(this.createFn());
            }
        }

        get(...args) {
            let object;
            if (this.pool.length > 0) {
                object = this.pool.pop();
            } else {
                object = this.createFn();
            }

            this.resetFn(object, ...args);
            this.active.push(object);
            return object;
        }

        release(object) {
            const index = this.active.indexOf(object);
            if (index !== -1) {
                this.active.splice(index, 1);
            }
            this.pool.push(object);
        }

        update() {
            for (let i = this.active.length - 1; i >= 0; i--) {
                if (!this.active[i].update()) {
                    this.release(this.active[i]);
                }
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
        for (let i = 0; i < 50; i++) {
            pool.pool.push(pool.createFn());
        }
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
        for (let i = 0; i < 100; i++) {
            spawnObject(
                poolingCanvas.width / 2,
                poolingCanvas.height / 2
            );
        }
    });

    poolingCanvas.addEventListener('click', (e) => {
        const rect = poolingCanvas.getBoundingClientRect();
        for (let i = 0; i < 10; i++) {
            spawnObject(e.clientX - rect.left, e.clientY - rect.top);
        }
    });

    function animatePooling() {
        clearCanvas(ctx, poolingCanvas.width, poolingCanvas.height);

        if (usePooling) {
            pool.update();

            pool.active.forEach(obj => {
                ctx.globalAlpha = obj.life;
                ctx.fillStyle = '#4fc3f7';
                ctx.beginPath();
                ctx.arc(obj.position.x, obj.position.y, 6, 0, Math.PI * 2);
                ctx.fill();
            });

            info.textContent = `WITH POOLING | Active: ${pool.active.length} | Pool: ${pool.pool.length} | Created: ${objectsCreated}`;
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

            info.textContent = `WITHOUT POOLING | Active: ${objects.length} | Created: ${objectsCreated} | Destroyed: ${objectsDestroyed}`;
        }

        ctx.globalAlpha = 1;

        requestAnimationFrame(animatePooling);
    }

    animatePooling();
}

// ===================================
// DEMO 3: Procedural Generation
// ===================================
const procgenCanvas = document.getElementById('procgenDemo');
if (procgenCanvas) {
    const ctx = procgenCanvas.getContext('2d');
    const info = document.getElementById('procgenInfo');

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

            const nx0 = lerp(n00, n10, sx);
            const nx1 = lerp(n01, n11, sx);

            return lerp(nx0, nx1, sy);
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
        const imageData = ctx.createImageData(procgenCanvas.width, procgenCanvas.height);
        const data = imageData.data;

        for (let y = 0; y < procgenCanvas.height; y++) {
            for (let x = 0; x < procgenCanvas.width; x++) {
                const value = noise.fractalNoise(x * 0.01, y * 0.01, 5);
                const index = (y * procgenCanvas.width + x) * 4;

                if (mode === 'terrain') {
                    // Terrain colors
                    if (value < 0.3) {
                        // Water
                        data[index] = 50;
                        data[index + 1] = 100;
                        data[index + 2] = 200;
                    } else if (value < 0.5) {
                        // Sand
                        data[index] = 194;
                        data[index + 1] = 178;
                        data[index + 2] = 128;
                    } else if (value < 0.7) {
                        // Grass
                        data[index] = 100;
                        data[index + 1] = 180;
                        data[index + 2] = 100;
                    } else {
                        // Mountain
                        data[index] = 150;
                        data[index + 1] = 150;
                        data[index + 2] = 150;
                    }
                } else if (mode === 'clouds') {
                    // Clouds
                    const cloudValue = Math.floor(value * 255);
                    data[index] = 150 + cloudValue * 0.4;
                    data[index + 1] = 180 + cloudValue * 0.3;
                    data[index + 2] = 255;
                } else if (mode === 'marble') {
                    // Marble pattern
                    const marbleValue = Math.sin(x * 0.05 + value * 20);
                    const color = Math.floor((marbleValue + 1) * 127.5);
                    data[index] = color;
                    data[index + 1] = color;
                    data[index + 2] = color;
                }

                data[index + 3] = 255; // Alpha
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    document.getElementById('btnNewSeed').addEventListener('click', () => {
        noise = new NoiseGenerator(Date.now());
        generateTerrain();
    });

    document.getElementById('btnTerrain').addEventListener('click', () => {
        mode = 'terrain';
        generateTerrain();
    });

    document.getElementById('btnClouds').addEventListener('click', () => {
        mode = 'clouds';
        generateTerrain();
    });

    document.getElementById('btnMarble').addEventListener('click', () => {
        mode = 'marble';
        generateTerrain();
    });

    generateTerrain();
}

// ===================================
// DEMO 4: Tilemap
// ===================================
const tilemapCanvas = document.getElementById('tilemapDemo');
if (tilemapCanvas) {
    const ctx = tilemapCanvas.getContext('2d');
    const info = document.getElementById('tilemapInfo');

    const tileSize = 25;
    const cols = Math.floor(tilemapCanvas.width / tileSize);
    const rows = Math.floor(tilemapCanvas.height / tileSize);
    let tilemap = [];
    let currentTile = 1; // 0 = empty, 1 = grass, 2 = wall, 3 = water

    // Initialize tilemap
    for (let y = 0; y < rows; y++) {
        tilemap[y] = [];
        for (let x = 0; x < cols; x++) {
            tilemap[y][x] = 0;
        }
    }

    const tileColors = {
        0: '#1a1f3a',
        1: '#66bb6a', // Grass
        2: '#9e9e9e', // Wall
        3: '#4fc3f7'  // Water
    };

    let isDrawing = false;

    tilemapCanvas.addEventListener('mousedown', () => {
        isDrawing = true;
    });

    tilemapCanvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    tilemapCanvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            const rect = tilemapCanvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / tileSize);
            const y = Math.floor((e.clientY - rect.top) / tileSize);

            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                tilemap[y][x] = currentTile;
            }
        }
    });

    tilemapCanvas.addEventListener('click', (e) => {
        const rect = tilemapCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / tileSize);
        const y = Math.floor((e.clientY - rect.top) / tileSize);

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            tilemap[y][x] = currentTile;
        }
    });

    document.getElementById('btnGrass').addEventListener('click', () => {
        currentTile = 1;
    });

    document.getElementById('btnWall').addEventListener('click', () => {
        currentTile = 2;
    });

    document.getElementById('btnWater').addEventListener('click', () => {
        currentTile = 3;
    });

    document.getElementById('btnErase').addEventListener('click', () => {
        currentTile = 0;
    });

    document.getElementById('btnClearTilemap').addEventListener('click', () => {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                tilemap[y][x] = 0;
            }
        }
    });

    function animateTilemap() {
        clearCanvas(ctx, tilemapCanvas.width, tilemapCanvas.height);

        // Draw tilemap
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tile = tilemap[y][x];
                ctx.fillStyle = tileColors[tile];
                ctx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
            }
        }

        // Count tiles
        let counts = {0: 0, 1: 0, 2: 0, 3: 0};
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                counts[tilemap[y][x]]++;
            }
        }

        const tileNames = {0: 'Empty', 1: 'Grass', 2: 'Wall', 3: 'Water'};
        info.textContent = `Current: ${tileNames[currentTile]} | Grass: ${counts[1]} | Wall: ${counts[2]} | Water: ${counts[3]}`;

        requestAnimationFrame(animateTilemap);
    }

    animateTilemap();
}
