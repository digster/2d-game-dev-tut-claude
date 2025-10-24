// ===================================
// CORE MATH CLASSES FOR GAME DEVELOPMENT
// Bug-fixed and optimized
// ===================================

/**
 * 2D Vector Class
 * Used for positions, velocities, directions, and forces
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Addition - modifies this vector
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    // Subtraction - returns new vector (consistent with mathematical convention)
    subtract(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    // Static method for subtraction without creating intermediate objects
    static subtract(a, b) {
        return new Vector2D(a.x - b.x, a.y - b.y);
    }

    // Multiplication by scalar - modifies this vector
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    // Division by scalar - modifies this vector
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        } else {
            console.warn('Vector2D: Division by zero');
        }
        return this;
    }

    // Get the length (magnitude) of the vector
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Get squared length (faster, no sqrt)
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    // Calculate distance to another vector
    distance(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Calculate squared distance (faster, no sqrt)
    distanceSquared(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return dx * dx + dy * dy;
    }

    // Normalize - make length = 1
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    // Create a copy of this vector
    copy() {
        return new Vector2D(this.x, this.y);
    }

    // Dot product
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    // Cross product (returns scalar in 2D)
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }

    // Linear interpolation
    lerp(target, t) {
        this.x += (target.x - this.x) * t;
        this.y += (target.y - this.y) * t;
        return this;
    }

    // Rotate by angle (in radians)
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }

    // Get angle of vector
    angle() {
        return Math.atan2(this.y, this.x);
    }

    // Limit the length to max
    limit(max) {
        const lenSq = this.lengthSquared();
        if (lenSq > max * max) {
            this.normalize();
            this.multiply(max);
        }
        return this;
    }

    // Set length to specific value
    setLength(len) {
        this.normalize();
        this.multiply(len);
        return this;
    }

    // Set the vector values
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    // Get perpendicular vector (rotated 90 degrees)
    perpendicular() {
        return new Vector2D(-this.y, this.x);
    }

    // Static method to create from angle and length
    static fromAngle(angle, length = 1) {
        return new Vector2D(
            Math.cos(angle) * length,
            Math.sin(angle) * length
        );
    }

    // Static method to get random vector
    static random(length = 1) {
        const angle = Math.random() * Math.PI * 2;
        return Vector2D.fromAngle(angle, length);
    }
}

/**
 * 2D Matrix Class
 * Used for transformations (rotation, scale, translation)
 * FIXED: scale() method now correctly applies scaling
 */
class Matrix2D {
    constructor() {
        // Matrix format:
        // | a  b  tx |
        // | c  d  ty |
        // | 0  0  1  |
        this.a = 1; this.b = 0; this.tx = 0;
        this.c = 0; this.d = 1; this.ty = 0;
    }

    // Rotate by angle (in radians)
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const a = this.a * cos - this.c * sin;
        const c = this.a * sin + this.c * cos;
        const b = this.b * cos - this.d * sin;
        const d = this.b * sin + this.d * cos;
        this.a = a; this.b = b;
        this.c = c; this.d = d;
        return this;
    }

    // Scale by sx and sy
    // FIXED: Previously had bug where b and c were scaled incorrectly
    scale(sx, sy) {
        this.a *= sx;
        this.b *= sx;
        this.c *= sy;
        this.d *= sy;
        return this;
    }

    // Translate by tx and ty
    translate(tx, ty) {
        this.tx += tx;
        this.ty += ty;
        return this;
    }

    // Transform a point using this matrix
    transformPoint(point) {
        return new Vector2D(
            point.x * this.a + point.y * this.b + this.tx,
            point.x * this.c + point.y * this.d + this.ty
        );
    }

    // Reset to identity matrix
    identity() {
        this.a = 1; this.b = 0; this.tx = 0;
        this.c = 0; this.d = 1; this.ty = 0;
        return this;
    }

    // Create a copy of this matrix
    copy() {
        const m = new Matrix2D();
        m.a = this.a; m.b = this.b; m.tx = this.tx;
        m.c = this.c; m.d = this.d; m.ty = this.ty;
        return m;
    }
}

/**
 * Helper function to draw a vector arrow on canvas
 */
function drawVector(ctx, start, end, color = '#4fc3f7', width = 2) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headLength = 10;

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
        end.x - headLength * Math.cos(angle - Math.PI / 6),
        end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        end.x - headLength * Math.cos(angle + Math.PI / 6),
        end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
}

/**
 * Helper function to draw a grid on canvas
 */
function drawGrid(ctx, width, height, gridSize = 50, color = '#2a2f4a') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

/**
 * Helper function to clear canvas
 */
function clearCanvas(ctx, width, height, bgColor = '#0d1117') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
}

/**
 * Linear interpolation between two values
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Map value from one range to another
 */
function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
