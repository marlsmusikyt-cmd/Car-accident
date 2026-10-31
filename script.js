
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const steering = document.getElementById("steering");

const scoreDisplay = document.getElementById("score");
const bestDisplay = document.getElementById("best");

const gameOverScreen = document.getElementById("gameOver");
const startScreen = document.getElementById("startScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const finalScore = document.getElementById("finalScore");

let gameRunning = false;
let score = 0;
let bestScore = Number(localStorage.getItem("carAccidentBest")) || 0;

let roadSpeed = 4;
let roadLinesOffset = 0;
let spawnTimer = 0;

let lastTime = 0;

bestDisplay.textContent = bestScore;

// Player car
const player = {
    x: 180,
    y: 470,
    width: 40,
    height: 65,
    color: "#ff3333"
};

// Traffic cars
let traffic = [];

// Start game
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

function startGame() {
    score = 0;
    roadSpeed = 4;
    roadLinesOffset = 0;
    spawnTimer = 0;

    player.x = 180;
    traffic = [];

    gameRunning = true;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop(timestamp) {
    if (!gameRunning) return;

    const delta = Math.min((timestamp - lastTime) / 16.67, 2);
    lastTime = timestamp;

    update(delta);
    draw();

    requestAnimationFrame(gameLoop);
}

// Update game
function update(delta) {

    // Steering
    const steeringValue = Number(steering.value) / 100;

    // Player movement
    const targetX = steeringValue * (canvas.width - player.width);

    player.x += (targetX - player.x) * 0.12 * delta;

    // Road boundaries
    const minX = 70;
    const maxX = 290;

player.x = Math.max(minX, Math.min(maxX, player.x));

    // Road animation
    roadLinesOffset += roadSpeed * delta;

    if (roadLinesOffset > 80) {
        roadLinesOffset = 0;
    }

    // Spawn traffic
    spawnTimer += delta;

    if (spawnTimer > 45) {
        spawnTraffic();
        spawnTimer = 0;
    }

    // Move traffic
    traffic.forEach(car => {
        car.y += car.speed * delta;
    });

    // Remove cars outside screen
    traffic = traffic.filter(car => car.y < canvas.height + 100);

    // Collision detection
    traffic.forEach(car => {
        if (checkCollision(player, car)) {
            endGame();
        }
    });

    // Score
    score += delta * 0.1;

    scoreDisplay.textContent = Math.floor(score);

    // Increase difficulty
    roadSpeed = 4 + score / 150;
}

// Create traffic
function spawnTraffic() {

    const lanes = [80, 180, 280];

    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    traffic.push({
        x: lane,
        y: -80,
        width: 40,
        height: 65,
        speed: roadSpeed + Math.random() * 2,
        color: Math.random() > 0.5 ? "#eeeeee" : "#ffaa33"
    });
}

// Draw road
function drawRoad() {

    // Grass
    ctx.fillStyle = "#263b26";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Road
    ctx.fillStyle = "#383838";
    ctx.fillRect(40, 0, 320, canvas.height);

    // Road borders
    ctx.fillStyle = "#dddddd";

    ctx.fillRect(40, 0, 6, canvas.height);
    ctx.fillRect(354, 0, 6, canvas.height);

    // Road lines
    ctx.fillStyle = "#aaaaaa";

    for (let y = -80; y < canvas.height; y += 100) {
        const lineY = y + roadLinesOffset;

        ctx.fillRect(145, lineY, 5, 45);
        ctx.fillRect(245, lineY, 5, 45);
    }
}

// Draw car
function drawCar(car) {

    // Main body
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.width, car.height);

    // Windows
    ctx.fillStyle = "#222222";
    ctx.fillRect(car.x + 7, car.y + 12, 26, 15);
    ctx.fillRect(car.x + 7, car.y + 38, 26, 12);

    // Lights
    ctx.fillStyle = "#ffff88";

    ctx.fillRect(car.x + 3, car.y + 3, 8, 5);
    ctx.fillRect(car.x + 29, car.y + 3, 8, 5);

    // Wheels
    ctx.fillStyle = "#111111";

    ctx.fillRect(car.x - 4, car.y + 10, 5, 15);
    ctx.fillRect(car.x + car.width - 1, car.y + 10, 5, 15);

    ctx.fillRect(car.x - 4, car.y + 42, 5, 15);
    ctx.fillRect(car.x + car.width - 1, car.y + 42, 5, 15);
}

// Draw everything
function draw() {

    drawRoad();

    traffic.forEach(car => {
        drawCar(car);
    });

    drawCar(player);
}

// Collision
function checkCollision(a, b) {

    const padding = 6;

    return (
        a.x + padding < b.x + b.width - padding &&
        a.x + a.width - padding > b.x + padding &&
        a.y + padding < b.y + b.height - padding &&
        a.y + a.height - padding > b.y + padding
    );
}

// Game over
function endGame() {

    gameRunning = false;

    const currentScore = Math.floor(score);

    finalScore.textContent = currentScore;

    if (currentScore > bestScore) {
        bestScore = currentScore;

        localStorage.setItem("carAccidentBest", bestScore);

        bestDisplay.textContent = bestScore;
    }

    gameOverScreen.classList.remove("hidden");
}

// Initial screen
drawRoad();
drawCar(player);
