const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 16;
const PADDLE_MARGIN = 24;

let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let playerScore = 0;
let aiScore = 0;

let ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    vx: 5 * (Math.random() > 0.5 ? 1 : -1),
    vy: 3 * (Math.random() > 0.5 ? 1 : -1),
    speed: 5
};

function resetBall() {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.vx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1);
}

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp player paddle to canvas
    if (playerY < 0) playerY = 0;
    if (playerY + PADDLE_HEIGHT > canvas.height)
        playerY = canvas.height - PADDLE_HEIGHT;
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall() {
    ctx.fillStyle = "#FFD600";
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
}

function drawCenterLine() {
    ctx.strokeStyle = "#444";
    ctx.setLineDash([10, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawScore() {
    ctx.font = "36px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(playerScore, canvas.width / 2 - 60, 50);
    ctx.fillText(aiScore, canvas.width / 2 + 30, 50);
}

function collision(paddleX, paddleY) {
    return (
        ball.x < paddleX + PADDLE_WIDTH &&
        ball.x + BALL_SIZE > paddleX &&
        ball.y < paddleY + PADDLE_HEIGHT &&
        ball.y + BALL_SIZE > paddleY
    );
}

function updateAI() {
    // Simple AI: move towards the ball but not perfectly
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ball.y + BALL_SIZE / 2 - 10) {
        aiY += 4;
    } else if (aiCenter > ball.y + BALL_SIZE / 2 + 10) {
        aiY -= 4;
    }
    // Clamp AI paddle
    if (aiY < 0) aiY = 0;
    if (aiY + PADDLE_HEIGHT > canvas.height)
        aiY = canvas.height - PADDLE_HEIGHT;
}

function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall collision (top/bottom)
    if (ball.y < 0) {
        ball.y = 0;
        ball.vy = -ball.vy;
    }
    if (ball.y + BALL_SIZE > canvas.height) {
        ball.y = canvas.height - BALL_SIZE;
        ball.vy = -ball.vy;
    }

    // Player paddle collision
    if (collision(PADDLE_MARGIN, playerY)) {
        ball.x = PADDLE_MARGIN + PADDLE_WIDTH;
        ball.vx = -ball.vx;
        // add some "spin"
        let impact = ((ball.y + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.vy += impact * 4;
    }

    // AI paddle collision
    if (collision(canvas.width - PADDLE_MARGIN - PADDLE_WIDTH, aiY)) {
        ball.x = canvas.width - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
        ball.vx = -ball.vx;
        let impact = ((ball.y + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.vy += impact * 4;
    }

    // Left/right wall: Score
    if (ball.x < 0) {
        aiScore++;
        resetBall();
    }
    if (ball.x + BALL_SIZE > canvas.width) {
        playerScore++;
        resetBall();
    }
}

function draw() {
    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCenterLine();

    // Draw paddles
    drawRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#4CAF50");
    drawRect(canvas.width - PADDLE_MARGIN - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#F44336");

    // Draw ball
    drawBall();

    // Draw score
    drawScore();
}

function gameLoop() {
    updateAI();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

resetBall();
gameLoop();