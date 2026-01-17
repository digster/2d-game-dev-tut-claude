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

// ===================================
// DEMO 5: Sound Propagation
// ===================================
const soundCanvas = document.getElementById('soundDemo');
if (soundCanvas) {
    const ctx = soundCanvas.getContext('2d');
    const info = document.getElementById('soundInfo');

    const soundSources = [];
    const obstacles = [];
    const listener = {
        position: new Vector2D(soundCanvas.width / 2, soundCanvas.height / 2),
        velocity: new Vector2D(0, 0)
    };

    const soundKeys = {};

    // Web Audio API setup
    let audioContext = null;
    let soundEnabled = false;

    class SoundSource {
        constructor(x, y, frequency = 440) {
            this.position = new Vector2D(x, y);
            this.maxDistance = 300;
            this.baseVolume = 1.0;
            this.frequency = frequency;

            // Audio nodes (created when sound is enabled)
            this.oscillator = null;
            this.gainNode = null;
            this.pannerNode = null;
        }

        initAudio() {
            if (!audioContext || this.oscillator) return;

            // Create oscillator (tone generator)
            this.oscillator = audioContext.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.frequency.value = this.frequency;

            // Create gain node (volume control)
            this.gainNode = audioContext.createGain();
            this.gainNode.gain.value = 0;

            // Create panner node (stereo positioning)
            this.pannerNode = audioContext.createStereoPanner();
            this.pannerNode.pan.value = 0;

            // Connect: oscillator -> gain -> panner -> output
            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.pannerNode);
            this.pannerNode.connect(audioContext.destination);

            // Start the oscillator
            this.oscillator.start();
        }

        stopAudio() {
            if (this.oscillator) {
                this.oscillator.stop();
                this.oscillator.disconnect();
                this.gainNode.disconnect();
                this.pannerNode.disconnect();
                this.oscillator = null;
                this.gainNode = null;
                this.pannerNode = null;
            }
        }

        calculateVolume(listenerPos) {
            const distance = this.position.distance(listenerPos);
            if (distance >= this.maxDistance) return 0;
            return this.baseVolume * (1 - (distance / this.maxDistance));
        }

        calculateOcclusion(listenerPos, obstacles) {
            let occlusionFactor = 1.0;
            for (const obstacle of obstacles) {
                if (lineIntersectsRect(listenerPos, this.position, obstacle)) {
                    occlusionFactor *= 0.3;
                }
            }
            return occlusionFactor;
        }

        calculatePan(listenerPos) {
            const dx = this.position.x - listenerPos.x;
            const distance = Math.max(1, this.position.distance(listenerPos));
            return clamp(dx / 200, -1, 1); // Pan based on horizontal offset
        }

        updateAudio(listenerPos) {
            if (!this.gainNode || !this.pannerNode) return;

            const volume = this.calculateVolume(listenerPos);
            const occlusion = this.calculateOcclusion(listenerPos, obstacles);
            const finalVolume = volume * occlusion;
            const pan = this.calculatePan(listenerPos);

            // Smooth volume transitions
            this.gainNode.gain.setTargetAtTime(finalVolume * 0.3, audioContext.currentTime, 0.05);
            this.pannerNode.pan.setTargetAtTime(pan, audioContext.currentTime, 0.05);
        }

        draw(ctx, listenerPos) {
            const volume = this.calculateVolume(listenerPos);
            const occlusion = this.calculateOcclusion(listenerPos, obstacles);
            const finalVolume = volume * occlusion;

            // Draw volume circle
            ctx.strokeStyle = `rgba(100, 255, 100, ${finalVolume * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.maxDistance, 0, Math.PI * 2);
            ctx.stroke();

            // Draw sound source (pulsate if sound is enabled)
            const pulseSize = soundEnabled ? 12 + Math.sin(Date.now() * 0.005) * 3 : 12;
            ctx.fillStyle = occlusion < 1 ? '#ff9800' : '#4caf50';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, pulseSize, 0, Math.PI * 2);
            ctx.fill();

            // Draw volume text
            ctx.fillStyle = '#fff';
            ctx.font = '12px monospace';
            ctx.fillText(`${Math.floor(finalVolume * 100)}%`, this.position.x - 15, this.position.y - 20);
        }
    }

    // Add initial sources with different frequencies
    soundSources.push(new SoundSource(200, 200, 440)); // A4 note
    soundSources.push(new SoundSource(600, 300, 523.25)); // C5 note

    // Key event listeners for sound demo
    window.addEventListener('keydown', (e) => {
        soundKeys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
        soundKeys[e.key.toLowerCase()] = false;
    });

    // Button event listeners
    const btnAddSoundSource = document.getElementById('btnAddSoundSource');
    const btnAddWall = document.getElementById('btnAddWall');
    const btnToggleSound = document.getElementById('btnToggleSound');
    const btnClearSound = document.getElementById('btnClearSound');

    // Musical notes for variety
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

    if (btnAddSoundSource) {
        btnAddSoundSource.addEventListener('click', () => {
            const x = randomFloat(100, soundCanvas.width - 100);
            const y = randomFloat(100, soundCanvas.height - 100);
            const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
            const source = new SoundSource(x, y, freq);

            // If sound is enabled, initialize audio for new source
            if (soundEnabled) {
                source.initAudio();
            }

            soundSources.push(source);
        });
    }

    if (btnAddWall) {
        btnAddWall.addEventListener('click', () => {
            const x = randomFloat(100, soundCanvas.width - 150);
            const y = randomFloat(100, soundCanvas.height - 150);
            const width = randomFloat(50, 150);
            const height = randomFloat(50, 150);
            obstacles.push({x, y, width, height});
        });
    }

    if (btnToggleSound) {
        btnToggleSound.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            btnToggleSound.textContent = soundEnabled ? 'Disable Sound' : 'Enable Sound';

            if (soundEnabled) {
                // Create audio context (requires user interaction)
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                // Initialize audio for all sources
                soundSources.forEach(source => source.initAudio());
            } else {
                // Stop all audio
                soundSources.forEach(source => source.stopAudio());
                if (audioContext) {
                    audioContext.close();
                    audioContext = null;
                }
            }
        });
    }

    if (btnClearSound) {
        btnClearSound.addEventListener('click', () => {
            // Stop audio for all sources before clearing
            soundSources.forEach(source => source.stopAudio());
            soundSources.length = 0;
            obstacles.length = 0;
        });
    }

    function animateSound() {
        clearCanvas(ctx, soundCanvas.width, soundCanvas.height);

        // Update listener position
        const dir = new Vector2D(
            (soundKeys.d ? 1 : 0) - (soundKeys.a ? 1 : 0),
            (soundKeys.s ? 1 : 0) - (soundKeys.w ? 1 : 0)
        );

        if (dir.length() > 0) {
            listener.position.add(dir.normalize().multiply(4));
        }

        listener.position.x = clamp(listener.position.x, 20, soundCanvas.width - 20);
        listener.position.y = clamp(listener.position.y, 20, soundCanvas.height - 20);

        // Update and draw sound sources
        soundSources.forEach(source => {
            // Update audio volume and panning based on listener position
            if (soundEnabled) {
                source.updateAudio(listener.position);
            }
            source.draw(ctx, listener.position);
        });

        // Draw obstacles
        obstacles.forEach(obstacle => {
            ctx.fillStyle = '#666';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 2;
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Draw listener
        ctx.fillStyle = '#42a5f5';
        ctx.beginPath();
        ctx.arc(listener.position.x, listener.position.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Add sound indicator if enabled
        if (soundEnabled) {
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(listener.position.x, listener.position.y, 20 + Math.sin(Date.now() * 0.01) * 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        info.textContent = `Sources: ${soundSources.length} | Obstacles: ${obstacles.length} | Sound: ${soundEnabled ? 'ON' : 'OFF'} | Listener: (${Math.floor(listener.position.x)}, ${Math.floor(listener.position.y)})`;

        requestAnimationFrame(animateSound);
    }

    animateSound();
}

// ===================================
// DEMO 6: Network Interpolation
// ===================================
const networkCanvas = document.getElementById('networkDemo');
if (networkCanvas) {
    const ctx = networkCanvas.getContext('2d');
    const info = document.getElementById('networkInfo');

    // Create cached grid canvas (drawn once, reused every frame)
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = networkCanvas.width;
    gridCanvas.height = networkCanvas.height;
    const gridCtx = gridCanvas.getContext('2d');
    gridCtx.strokeStyle = '#222';
    gridCtx.lineWidth = 1;
    for (let x = 0; x < gridCanvas.width; x += 50) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridCanvas.height);
        gridCtx.stroke();
    }
    for (let y = 0; y < gridCanvas.height; y += 50) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridCanvas.width, y);
        gridCtx.stroke();
    }

    let latency = 0;
    let packetLoss = 0;
    let usePrediction = true;

    const networkKeys = {};

    // Player with client-side prediction
    const player = {
        position: new Vector2D(networkCanvas.width / 2, networkCanvas.height / 2),
        serverPosition: new Vector2D(networkCanvas.width / 2, networkCanvas.height / 2),
        renderPosition: new Vector2D(networkCanvas.width / 2, networkCanvas.height / 2),
        inputSequence: 0,
        pendingInputs: [],
        speed: 4
    };

    // Simulated server updates
    const serverUpdateBuffer = [];
    let lastServerUpdate = Date.now();

    // Key event listeners for network demo
    window.addEventListener('keydown', (e) => {
        networkKeys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
        networkKeys[e.key.toLowerCase()] = false;
    });

    // Button event listeners
    const btnAddLatency = document.getElementById('btnAddLatency');
    const btnTogglePrediction = document.getElementById('btnTogglePrediction');
    const btnPacketLoss = document.getElementById('btnPacketLoss');
    const btnResetNetwork = document.getElementById('btnResetNetwork');

    if (btnAddLatency) {
        btnAddLatency.addEventListener('click', () => {
            latency += 100;
        });
    }

    if (btnTogglePrediction) {
        btnTogglePrediction.addEventListener('click', () => {
            usePrediction = !usePrediction;
        });
    }

    if (btnPacketLoss) {
        btnPacketLoss.addEventListener('click', () => {
            packetLoss = packetLoss > 0 ? 0 : 0.2;
        });
    }

    if (btnResetNetwork) {
        btnResetNetwork.addEventListener('click', () => {
            latency = 0;
            packetLoss = 0;
            player.position.set(networkCanvas.width / 2, networkCanvas.height / 2);
            player.serverPosition.set(networkCanvas.width / 2, networkCanvas.height / 2);
            player.renderPosition.set(networkCanvas.width / 2, networkCanvas.height / 2);
        });
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
                // Client-side prediction
                player.pendingInputs.push({
                    input: input.copy(),
                    sequence: player.inputSequence
                });

                // Apply immediately
                player.position.add(input);

                // Simulate sending to server
                simulateSendToServer(input.copy(), player.inputSequence);
            } else {
                // No prediction - wait for server
                simulateSendToServer(input.copy(), player.inputSequence);
            }
        }
    }

    function simulateSendToServer(input, sequence) {
        // Simulate packet loss
        if (Math.random() < packetLoss) return;

        // Simulate server processing after latency
        setTimeout(() => {
            // Server applies input
            player.serverPosition.add(input);

            // Server sends back confirmation
            setTimeout(() => {
                receiveServerUpdate(player.serverPosition.copy(), sequence);
            }, latency / 2);
        }, latency / 2);
    }

    function receiveServerUpdate(serverPos, lastProcessedInput) {
        if (usePrediction) {
            // Server reconciliation
            player.pendingInputs = player.pendingInputs.filter(
                i => i.sequence > lastProcessedInput
            );

            // Rewind to server position
            player.position = serverPos.copy();

            // Replay unprocessed inputs
            for (const input of player.pendingInputs) {
                player.position.add(input.input);
            }
        } else {
            // Just use server position
            player.position = serverPos.copy();
        }

        player.renderPosition = player.position.copy();
    }

    function animateNetwork() {
        clearCanvas(ctx, networkCanvas.width, networkCanvas.height);

        applyInput();

        // Smooth interpolation for rendering
        if (!usePrediction) {
            player.renderPosition.x += (player.position.x - player.renderPosition.x) * 0.2;
            player.renderPosition.y += (player.position.y - player.renderPosition.y) * 0.2;
        } else {
            player.renderPosition = player.position.copy();
        }

        player.renderPosition.x = clamp(player.renderPosition.x, 20, networkCanvas.width - 20);
        player.renderPosition.y = clamp(player.renderPosition.y, 20, networkCanvas.height - 20);

        // Draw cached grid (pre-rendered for performance)
        ctx.drawImage(gridCanvas, 0, 0);

        // Draw server position (ghost)
        ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(player.serverPosition.x, player.serverPosition.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw player
        ctx.fillStyle = usePrediction ? '#42a5f5' : '#ff5722';
        ctx.beginPath();
        ctx.arc(player.renderPosition.x, player.renderPosition.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw connection info
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText(`Latency: ${latency}ms`, 10, 20);
        ctx.fillText(`Packet Loss: ${Math.floor(packetLoss * 100)}%`, 10, 40);
        ctx.fillText(`Prediction: ${usePrediction ? 'ON' : 'OFF'}`, 10, 60);

        info.textContent = `Pending Inputs: ${player.pendingInputs.length} | Prediction: ${usePrediction ? 'Enabled' : 'Disabled'}`;

        requestAnimationFrame(animateNetwork);
    }

    animateNetwork();
}

// ===================================
// DEMO: Perlin Noise Terrain
// ===================================
const noiseCanvas = document.getElementById('noiseDemo');
if (noiseCanvas) {
    const ctx = noiseCanvas.getContext('2d');
    const info = document.getElementById('noiseInfo');

    let scale = 0.05;
    let showHeightmap = false;
    let showContours = false;

    class PerlinNoise {
        constructor() {
            this.p = [];
            for (let i = 0; i < 256; i++) {
                this.p[i] = Math.floor(Math.random() * 256);
            }
            this.p = this.p.concat(this.p);
        }

        fade(t) {
            return t * t * t * (t * (t * 6 - 15) + 10);
        }

        lerp(a, b, t) {
            return a + t * (b - a);
        }

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
            const aa = this.p[a];
            const ab = this.p[a + 1];
            const b = this.p[X + 1] + Y;
            const ba = this.p[b];
            const bb = this.p[b + 1];

            return this.lerp(
                this.lerp(this.grad(aa, x, y), this.grad(ba, x - 1, y), u),
                this.lerp(this.grad(ab, x, y - 1), this.grad(bb, x - 1, y - 1), u),
                v
            );
        }

        octaveNoise(x, y, octaves = 4, persistence = 0.5) {
            let total = 0;
            let frequency = 1;
            let amplitude = 1;
            let maxValue = 0;

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
        if (height < 0.3) return '#4A90E2';  // Water
        if (height < 0.4) return '#F5DEB3';  // Sand
        if (height < 0.7) return '#7EC850';  // Grass
        if (height < 0.9) return '#8B7355';  // Mountain
        return '#FFFFFF';  // Snow
    }

    function generateTerrain() {
        const imageData = ctx.createImageData(noiseCanvas.width, noiseCanvas.height);
        const data = imageData.data;

        for (let y = 0; y < noiseCanvas.height; y++) {
            for (let x = 0; x < noiseCanvas.width; x++) {
                const value = perlin.octaveNoise(x * scale, y * scale, 4, 0.5);
                const height = (value + 1) / 2;  // Normalize to 0-1

                const index = (y * noiseCanvas.width + x) * 4;

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

                data[index + 3] = 255;  // Alpha
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Draw contour lines
        if (showContours) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;

            const levels = [0.3, 0.4, 0.7, 0.9];
            levels.forEach(level => {
                ctx.beginPath();
                for (let y = 0; y < noiseCanvas.height - 1; y++) {
                    for (let x = 0; x < noiseCanvas.width - 1; x++) {
                        const value = perlin.octaveNoise(x * scale, y * scale, 4, 0.5);
                        const height = (value + 1) / 2;

                        if (Math.abs(height - level) < 0.02) {
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + 1, y);
                        }
                    }
                }
                ctx.stroke();
            });
        }
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }

    // Button handlers
    const btnNewSeed = document.getElementById('btnNewSeed');
    const btnIncreaseScale = document.getElementById('btnIncreaseScale');
    const btnDecreaseScale = document.getElementById('btnDecreaseScale');
    const btnToggleHeight = document.getElementById('btnToggleHeight');
    const btnToggleContours = document.getElementById('btnToggleContours');

    if (btnNewSeed) btnNewSeed.addEventListener('click', () => {
        perlin = new PerlinNoise();
        generateTerrain();
    });
    if (btnIncreaseScale) btnIncreaseScale.addEventListener('click', () => {
        scale *= 0.8;
        generateTerrain();
    });
    if (btnDecreaseScale) btnDecreaseScale.addEventListener('click', () => {
        scale *= 1.2;
        generateTerrain();
    });
    if (btnToggleHeight) btnToggleHeight.addEventListener('click', () => {
        showHeightmap = !showHeightmap;
        generateTerrain();
    });
    if (btnToggleContours) btnToggleContours.addEventListener('click', () => {
        showContours = !showContours;
        generateTerrain();
    });

    generateTerrain();

    function animateNoise() {
        info.textContent = `Scale: ${scale.toFixed(3)} | Heightmap: ${showHeightmap ? 'ON' : 'OFF'} | Contours: ${showContours ? 'ON' : 'OFF'}`;
        requestAnimationFrame(animateNoise);
    }

    animateNoise();
}

// ===================================
// DEMO: Entity Component System
// ===================================
const ecsCanvas = document.getElementById('ecsDemo');
if (ecsCanvas) {
    const ctx = ecsCanvas.getContext('2d');
    const info = document.getElementById('ecsInfo');

    // Components
    class Position {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Velocity {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Renderable {
        constructor(color) {
            this.color = color;
        }
    }

    // Entity
    class Entity {
        static nextId = 0;

        constructor() {
            this.id = Entity.nextId++;
            this.components = new Map();
        }

        addComponent(component) {
            this.components.set(component.constructor, component);
            return this;
        }

        getComponent(componentClass) {
            return this.components.get(componentClass);
        }

        hasComponent(componentClass) {
            return this.components.has(componentClass);
        }

        removeComponent(componentClass) {
            this.components.delete(componentClass);
            return this;
        }
    }

    // World
    class World {
        constructor() {
            this.entities = [];
            this.systems = [];
        }

        createEntity() {
            const entity = new Entity();
            this.entities.push(entity);
            return entity;
        }

        removeEntity(entity) {
            const index = this.entities.indexOf(entity);
            if (index !== -1) {
                this.entities.splice(index, 1);
            }
        }

        addSystem(system) {
            this.systems.push(system);
        }

        update(deltaTime) {
            for (const system of this.systems) {
                system.update(this.entities, deltaTime);
            }
        }

        query(...componentClasses) {
            return this.entities.filter(entity =>
                componentClasses.every(comp => entity.hasComponent(comp))
            );
        }
    }

    // Systems
    class MovementSystem {
        update(entities) {
            for (const entity of entities) {
                if (!entity.hasComponent(Position) || !entity.hasComponent(Velocity)) {
                    continue;
                }

                const pos = entity.getComponent(Position);
                const vel = entity.getComponent(Velocity);

                pos.x += vel.x;
                pos.y += vel.y;

                // Bounce off walls
                if (pos.x < 10 || pos.x > ecsCanvas.width - 10) {
                    vel.x *= -1;
                    pos.x = Math.max(10, Math.min(ecsCanvas.width - 10, pos.x));
                }
                if (pos.y < 10 || pos.y > ecsCanvas.height - 10) {
                    vel.y *= -1;
                    pos.y = Math.max(10, Math.min(ecsCanvas.height - 10, pos.y));
                }
            }
        }
    }

    class RenderSystem {
        update(entities) {
            for (const entity of entities) {
                if (!entity.hasComponent(Position) || !entity.hasComponent(Renderable)) {
                    continue;
                }

                const pos = entity.getComponent(Position);
                const rend = entity.getComponent(Renderable);

                ctx.fillStyle = rend.color;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
                ctx.fill();

                // Draw velocity indicator if present
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

    // Create world and systems
    const world = new World();
    world.addSystem(new MovementSystem());
    world.addSystem(new RenderSystem());

    // Button handlers
    const btnSpawnMoving = document.getElementById('btnSpawnMoving');
    const btnSpawnStatic = document.getElementById('btnSpawnStatic');
    const btnAddVelocity = document.getElementById('btnAddVelocity');
    const btnRemoveVelocity = document.getElementById('btnRemoveVelocity');
    const btnClearECS = document.getElementById('btnClearECS');

    if (btnSpawnMoving) btnSpawnMoving.addEventListener('click', () => {
        world.createEntity()
            .addComponent(new Position(Math.random() * ecsCanvas.width, Math.random() * ecsCanvas.height))
            .addComponent(new Velocity((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4))
            .addComponent(new Renderable(`hsl(${Math.random() * 360}, 70%, 60%)`));
    });

    if (btnSpawnStatic) btnSpawnStatic.addEventListener('click', () => {
        world.createEntity()
            .addComponent(new Position(Math.random() * ecsCanvas.width, Math.random() * ecsCanvas.height))
            .addComponent(new Renderable('#999'));
    });

    if (btnAddVelocity) btnAddVelocity.addEventListener('click', () => {
        world.entities.forEach(entity => {
            if (!entity.hasComponent(Velocity)) {
                entity.addComponent(new Velocity((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4));
            }
        });
    });

    if (btnRemoveVelocity) btnRemoveVelocity.addEventListener('click', () => {
        world.entities.forEach(entity => {
            entity.removeComponent(Velocity);
        });
    });

    if (btnClearECS) btnClearECS.addEventListener('click', () => {
        world.entities = [];
        Entity.nextId = 0;
    });

    // Spawn initial entities
    for (let i = 0; i < 5; i++) {
        world.createEntity()
            .addComponent(new Position(Math.random() * ecsCanvas.width, Math.random() * ecsCanvas.height))
            .addComponent(new Velocity((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4))
            .addComponent(new Renderable(`hsl(${Math.random() * 360}, 70%, 60%)`));
    }

    for (let i = 0; i < 3; i++) {
        world.createEntity()
            .addComponent(new Position(Math.random() * ecsCanvas.width, Math.random() * ecsCanvas.height))
            .addComponent(new Renderable('#999'));
    }

    function animateECS() {
        clearCanvas(ctx, ecsCanvas.width, ecsCanvas.height);

        world.update(1);

        const movingEntities = world.query(Position, Velocity).length;
        const staticEntities = world.entities.filter(e => e.hasComponent(Position) && !e.hasComponent(Velocity)).length;

        info.textContent = `Total Entities: ${world.entities.length} | Moving: ${movingEntities} | Static: ${staticEntities}`;

        requestAnimationFrame(animateECS);
    }

    animateECS();
}
