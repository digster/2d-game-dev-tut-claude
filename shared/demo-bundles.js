// ===================================
// DEMO BUNDLES FOR EXPORT FEATURE
// Stores demo-specific code and HTML configurations
// ===================================

const DEMO_CODE = {
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

animate();`
};

const DEMO_HTML = {
    raycasting: {
        title: 'Raycasting Demo',
        canvas: { width: 800, height: 500 },
        controls: [
            { id: 'btnAdd', text: 'Add Obstacle' },
            { id: 'btnClear', text: 'Clear Obstacles' }
        ],
        info: 'Move your mouse. Rays turn red when hitting obstacles!'
    }
};
