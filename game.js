// キャンバスとコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲームの設定
const ballRadius = 5;
const paddleHeight = 10;
const paddleWidth = 75;
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 50;
const brickHeight = 20;
const brickPadding = 5;
let brickOffsetTop = 30;
const brickOffsetLeft = 30;

// スコア
let score = 0;
let lives = 3;

// ボールの初期位置と速度
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = 3;
let ballDY = -3;

// パドルの初期位置
let paddleX = (canvas.width - paddleWidth) / 2;
let paddle2X = (canvas.width - paddleWidth) / 2; // 2つ目のパドル

// キー入力の状態
let rightPressed = false;
let leftPressed = false;
let rightPressed2 = false; // プレイヤー2の右キー
let leftPressed2 = false;  // プレイヤー2の左キー

// ブロックの初期化
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// ブロックの移動関連の設定
let blockMoveInterval = 5000; // ブロックが下に移動する間隔（ミリ秒）
let lastBlockMove = 0; // 最後にブロックが移動した時間
let blockMoveSpeed = 10; // ブロックが下に移動する距離

// パーティクルシステムの設定
const particles = [];
const particleCount = 8;

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 1.0; // パーティクルの寿命（1.0から0.0）
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02; // 徐々に消えていく
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 149, 221, ${this.life})`;
        ctx.fill();
        ctx.closePath();
    }
}

// キーボードイベントの設定
function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === 'd' || e.key === 'D') {
        rightPressed2 = true;
    } else if (e.key === 'a' || e.key === 'A') {
        leftPressed2 = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === 'd' || e.key === 'D') {
        rightPressed2 = false;
    } else if (e.key === 'a' || e.key === 'A') {
        leftPressed2 = false;
    }
}

// 衝突検出
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    ballDY = -ballDY;
                    b.status = 0;
                    score++;

                    // パーティクルエフェクトの追加
                    for (let i = 0; i < particleCount; i++) {
                        particles.push(new Particle(
                            b.x + brickWidth / 2,
                            b.y + brickHeight / 2,
                            '#0095DD'
                        ));
                    }

                    if (score === brickRowCount * brickColumnCount) {
                        alert('おめでとうございます！クリアしました！');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// ボールの描画
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.closePath();
}

// パドルの描画
function drawPaddle() {
    // 下のパドル（プレイヤー1）
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();

    // 上のパドル（プレイヤー2）
    ctx.beginPath();
    ctx.rect(paddle2X, 0, paddleWidth, paddleHeight);
    ctx.fillStyle = '#FF6B6B';
    ctx.fill();
    ctx.closePath();
}

// ブロックの描画
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// スコアの描画
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('スコア: ' + score, 8, 20);
}

// ライフの描画
function drawLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('ライフ: ' + lives, canvas.width - 65, 20);
}

// メインの描画関数
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // ブロックの移動処理
    const currentTime = Date.now();
    if (currentTime - lastBlockMove > blockMoveInterval) {
        brickOffsetTop += blockMoveSpeed;
        lastBlockMove = currentTime;

        if (brickOffsetTop + (brickRowCount * (brickHeight + brickPadding)) > canvas.height - paddleHeight - 20) {
            alert('ゲームオーバー！ブロックが下まで来てしまいました！');
            document.location.reload();
        }
    }

    // パーティクルの更新と描画
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // ボールの壁との衝突判定
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX;
    }
    if (ballY + ballDY < ballRadius) {
        // 上のパドルとの衝突判定
        if (ballX > paddle2X && ballX < paddle2X + paddleWidth) {
            ballDY = -ballDY;
        } else {
            lives--;
            if (!lives) {
                alert('ゲームオーバー');
                document.location.reload();
            } else {
                ballX = canvas.width / 2;
                ballY = canvas.height - 30;
                ballDX = 3;
                ballDY = -3;
            }
        }
    } else if (ballY + ballDY > canvas.height - ballRadius) {
        // 下のパドルとの衝突判定
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballDY = -ballDY;
        } else {
            lives--;
            if (!lives) {
                alert('ゲームオーバー');
                document.location.reload();
            } else {
                ballX = canvas.width / 2;
                ballY = canvas.height - 30;
                ballDX = 3;
                ballDY = -3;
            }
        }
    }

    // パドルの移動
    // プレイヤー1（下のパドル）
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // プレイヤー2（上のパドル）
    if (rightPressed2 && paddle2X < canvas.width - paddleWidth) {
        paddle2X += 7;
    } else if (leftPressed2 && paddle2X > 0) {
        paddle2X -= 7;
    }

    ballX += ballDX;
    ballY += ballDY;
}

// イベントリスナーの設定
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

// ゲームの開始
setInterval(draw, 10);