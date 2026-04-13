const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fireworks = [];
let particles = [];

class Firework {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.distanceToTarget = Math.sqrt((targetX - x) ** 2 + (targetY - y) ** 2);
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = Math.random() * 50 + 50;
        this.targetRadius = 1;
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        if (this.targetRadius < 8) {
            this.targetRadius += 0.3;
        } else {
            this.targetRadius = 1;
        }

        this.speed *= this.acceleration;

        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;

        this.distanceTraveled = Math.sqrt((this.x - this.targetX) ** 2 + (this.y - this.targetY) ** 2);

        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.targetX, this.targetY);
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, ${this.brightness}%)`;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.targetX, this.targetY, this.targetRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 10 + 1;
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = Math.random() * 360;
        this.brightness = Math.random() * 50 + 50;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.01;
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.stroke();
    }
}

function createParticles(x, y) {
    let particleCount = 30;
    while (particleCount--) {
        particles.push(new Particle(x, y));
    }
}

function launchFireworks() {
    let fireworkCount = 3;
    while (fireworkCount--) {
        const startX = Math.random() * canvas.width;
        const startY = canvas.height;
        const targetX = Math.random() * canvas.width;
        const targetY = Math.random() * canvas.height / 2;
        fireworks.push(new Firework(startX, startY, targetX, targetY));
    }
}

function copyShareLink() {
    const shareUrl = window.location.href;
    const messageEl = document.getElementById('share-message');

    if (!navigator.clipboard) {
        messageEl.textContent = 'Trình duyệt của bạn không hỗ trợ sao chép tự động, hãy sao chép link thủ công.';
        return;
    }

    navigator.clipboard.writeText(shareUrl)
        .then(() => {
            messageEl.textContent = 'Link đã được sao chép! Bạn có thể dán và gửi cho bạn bè.';
        })
        .catch(() => {
            messageEl.textContent = 'Không thể sao chép link. Vui lòng thử lại hoặc copy thủ công.';
        });
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let i = fireworks.length;
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    let j = particles.length;
    while (j--) {
        particles[j].draw();
        particles[j].update(j);
    }
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function submitMessage() {
    const name = document.getElementById('sender-name').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (name && message) {
        const fullMessage = `Từ: ${name}\n\n${message}`;
        
        // Send to Telegram
        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: fullMessage,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alert('Lời nhắn đã được gửi thành công!');
                // Clear the form
                document.getElementById('sender-name').value = '';
                document.getElementById('message').value = '';
            } else {
                alert('Có lỗi xảy ra khi gửi lời nhắn. Vui lòng thử lại.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Không thể kết nối đến Telegram. Vui lòng kiểm tra kết nối internet.');
        });
    } else {
        alert('Vui lòng nhập đầy đủ tên và lời nhắn.');
    }
}

// Telegram configuration
const telegramBotToken = '8647706796:AAGyOFhdTkgkWNpPosHeboiS-qLS1Z92JTc';
const telegramChatId = '8177962402';

// Tic-Tac-Toe Game
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    gameBoard[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;

    checkResult();
}

function checkResult() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameBoard[winCondition[0]];
        let b = gameBoard[winCondition[1]];
        let c = gameBoard[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        document.getElementById('game-status').textContent = `Người chơi ${currentPlayer} thắng!`;
        gameActive = false;
        return;
    }

    let roundDraw = !gameBoard.includes('');
    if (roundDraw) {
        document.getElementById('game-status').textContent = 'Hòa!';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('game-status').textContent = `Lượt của ${currentPlayer}`;
}

function resetGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    document.getElementById('game-status').textContent = `Lượt của ${currentPlayer}`;
    document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
}

// Initialize game
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
