// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Track parameters
const trackCenterX = canvas.width / 2;
const trackCenterY = canvas.height / 2;
const trackOuterRadiusX = 250;
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
    // Draw outer ellipse
    ctx.beginPath();
    ctx.ellipse(trackCenterX, trackCenterY, trackOuterRadiusX, trackOuterRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#87CEEB';
    ctx.fill();

    // Draw inner ellipse
    ctx.beginPath();
    ctx.ellipse(trackCenterX, trackCenterY, trackInnerRadiusX, trackInnerRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Draw starting line
    ctx.beginPath();
    ctx.moveTo(trackCenterX, trackCenterY + trackInnerRadiusY);
    ctx.lineTo(trackCenterX, trackCenterY + trackOuterRadiusY);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw track
    drawTrack();

    // Update and draw cars
    car1.update();
    car2.update();
    car1.draw();
    car2.draw();

    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 