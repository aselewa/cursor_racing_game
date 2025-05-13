// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameStarted = false;
let countDown = 3;
let lastCountTime = 0;

// Draw countdown
function drawCountdown() {
    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = '#FF0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countDown, canvas.width/2, canvas.height/2);
}

// Create grass pattern
const grassPattern = document.createElement('canvas');
const patternCtx = grassPattern.getContext('2d');
grassPattern.width = 20;
grassPattern.height = 20;

// Draw grass pattern
patternCtx.fillStyle = '#90EE90';  // Light green base
patternCtx.fillRect(0, 0, 20, 20);
patternCtx.strokeStyle = '#228B22';  // Darker green strokes
patternCtx.lineWidth = 1;
// Add random grass strokes
for (let i = 0; i < 5; i++) {
    patternCtx.beginPath();
    patternCtx.moveTo(Math.random() * 20, Math.random() * 20);
    patternCtx.lineTo(Math.random() * 20, Math.random() * 20);
    patternCtx.stroke();
}

const grassTexture = ctx.createPattern(grassPattern, 'repeat');

// Track parameters
const trackCenterX = canvas.width / 2;
const trackCenterY = canvas.height / 2;
const trackOuterRadiusX = 450;
const trackOuterRadiusY = 200;
const trackWidth = 100;
const trackInnerRadiusX = trackOuterRadiusX - trackWidth;
const trackInnerRadiusY = trackOuterRadiusY - trackWidth;

// Car class
class Car {
    constructor(color, controls) {
        this.x = trackCenterX;
        this.y = trackCenterY + trackInnerRadiusY + trackWidth / 2;
        this.width = 20;
        this.height = 40;
        this.angle = 0;
        this.speed = 0;
        this.acceleration = 0.5;
        this.maxSpeed = 2;
        this.color = color;
        this.controls = controls;
    }

    update() {
        if (!gameStarted) return;  // Don't update if game hasn't started
        
        // Check if car is on track using elliptical bounds
        const normalizedX = (this.x - trackCenterX);
        const normalizedY = (this.y - trackCenterY);
        
        const outerCheck = Math.pow(normalizedX/trackOuterRadiusX, 2) + Math.pow(normalizedY/trackOuterRadiusY, 2);
        const innerCheck = Math.pow(normalizedX/trackInnerRadiusX, 2) + Math.pow(normalizedY/trackInnerRadiusY, 2);
        
        const isOnTrack = outerCheck <= 1 && innerCheck >= 1;
        
        // Apply speed penalty if off track
        const speedMultiplier = isOnTrack ? 1 : 0.2;

        // Update speed based on controls
        if (this.controls.forward) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else {
            this.speed = Math.max(0, this.speed - this.acceleration);
        }

        // Update rotation
        if (this.controls.left) this.angle -= 0.05;
        if (this.controls.right) this.angle += 0.05;

        // Apply speed penalty
        const effectiveSpeed = this.speed * speedMultiplier;

        // Update position
        this.x += Math.sin(this.angle) * effectiveSpeed;
        this.y -= Math.cos(this.angle) * effectiveSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Car body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);

        // Windshield
        ctx.fillStyle = '#808080';
        ctx.fillRect(-this.width/3, -this.height/2, this.width/1.5, this.height/3);

        // Wheels
        ctx.fillStyle = '#000000';
        ctx.fillRect(-this.width/2 - 2, -this.height/2, 4, 10); // Left front
        ctx.fillRect(this.width/2 - 2, -this.height/2, 4, 10);  // Right front
        ctx.fillRect(-this.width/2 - 2, this.height/2 - 10, 4, 10); // Left rear
        ctx.fillRect(this.width/2 - 2, this.height/2 - 10, 4, 10);  // Right rear

        ctx.restore();
    }
}

// Controls setup
const controls1 = {
    forward: false,
    left: false,
    right: false
};

const controls2 = {
    forward: false,
    left: false,
    right: false
};

// Create cars
const car1 = new Car('#FF0000', controls1); // Red car
car1.x = trackCenterX; // Center
car1.y = trackCenterY + trackOuterRadiusY - 20; // Just behind starting line
car1.angle = -Math.PI/2; // Point left

const car2 = new Car('#0000FF', controls2); // Blue car
car2.x = trackCenterX; // Center
car2.y = trackCenterY + trackOuterRadiusY - 70; // Further behind starting line
car2.angle = -Math.PI/2; // Point left

// Key handlers
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        // Player 1 controls (WASD)
        case 'w': controls1.forward = true; break;
        case 'a': controls1.left = true; break;
        case 'd': controls1.right = true; break;

        // Player 2 controls (Arrow keys)
        case 'ArrowUp': controls2.forward = true; break;
        case 'ArrowLeft': controls2.left = true; break;
        case 'ArrowRight': controls2.right = true; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch(event.key) {
        // Player 1 controls
        case 'w': controls1.forward = false; break;
        case 'a': controls1.left = false; break;
        case 'd': controls1.right = false; break;

        // Player 2 controls
        case 'ArrowUp': controls2.forward = false; break;
        case 'ArrowLeft': controls2.left = false; break;
        case 'ArrowRight': controls2.right = false; break;
    }
});

// Reset function to restore cars to starting positions
function resetCars() {
    car1.x = trackCenterX;
    car1.y = trackCenterY + trackOuterRadiusY - 20;
    car1.angle = -Math.PI/2;
    car1.speed = 0;

    car2.x = trackCenterX;
    car2.y = trackCenterY + trackOuterRadiusY - 70;
    car2.angle = -Math.PI/2;
    car2.speed = 0;
}

// Add reset button event listener
document.getElementById('resetBtn').addEventListener('click', resetCars);

// Draw track
function drawTrack() {
    // Draw outer area (grass)
    ctx.fillStyle = grassTexture;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw track (brown)
    ctx.beginPath();
    ctx.ellipse(trackCenterX, trackCenterY, trackOuterRadiusX, trackOuterRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#8B4513';  // Saddle brown
    ctx.fill();

    // Draw inner area (grass)
    ctx.beginPath();
    ctx.ellipse(trackCenterX, trackCenterY, trackInnerRadiusX, trackInnerRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = grassTexture;
    ctx.fill();

    // Draw lane markers
    const midRadiusX = (trackOuterRadiusX + trackInnerRadiusX) / 2;
    const midRadiusY = (trackOuterRadiusY + trackInnerRadiusY) / 2;
    
    ctx.beginPath();
    ctx.setLineDash([20, 20]); // Create dashed line pattern
    ctx.ellipse(trackCenterX, trackCenterY, midRadiusX, midRadiusY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw starting line
    ctx.beginPath();
    ctx.moveTo(trackCenterX, trackCenterY + trackInnerRadiusY);
    ctx.lineTo(trackCenterX, trackCenterY + trackOuterRadiusY);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw track
    drawTrack();

    if (!gameStarted) {
        const currentTime = Date.now();
        if (lastCountTime === 0) {
            lastCountTime = currentTime;
            drawCountdown();
        } else if (currentTime - lastCountTime >= 1000) {
            countDown--;
            lastCountTime = currentTime;
            if (countDown === 0) {
                gameStarted = true;
            }
        }
        if (!gameStarted) {
            drawCountdown();
        }
        // Freeze cars during countdown
        car1.draw();
        car2.draw();
    } else {
        // Update and draw cars once game has started
        car1.update();
        car2.update();
        car1.draw();
        car2.draw();
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
resetCars();
gameLoop(); 