//Enemy constructor
function enemy(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = 50;
    this.show = function() {
        screen.fillStyle = "#d11717";
        screen.fillRect(this.x, this.y, this.w, this.h);
    }
    this.move = function(speed) {
        this.clear();
        this.y += speed;
        this.show();
    }
    this.clear = function() {
        screen.clearRect(this.x, this.y, this.w, this.h);
    }
}

//Bullet constructor
function bullet(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.show = function() {
        screen.fillStyle = "#17d161";
        screen.fillRect(this.x, this.y, this.w, this.h);
    }

    this.move = function() {
        this.clear();
        this.y -= 5;
        this.show();
    }
    this.clear = function() {
        screen.clearRect(this.x, this.y, this.w, this.h);
    }

    this.hits = function(bullet, enemy) {
        if (bullet.y < enemy.y + enemy.h + 10 && bullet.x < enemy.x + enemy.w && bullet.x > enemy.x - 3) {
            return (true);
        }
    }

}
//Player constructure
function player(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.show = function() {
        screen.fillStyle = "#fff";
        screen.fillRect(this.x, this.y, this.w, this.h);
        if (this.x <= 0) this.x = 0;
        if (this.x >= canvas.width - this.w) this.x = canvas.width - this.w;
    }

    this.move = function(dir) {
        this.clear();
        this.x += dir;
        this.show();
    }

    this.clear = function() {
        screen.clearRect(this.x, this.y, this.w, this.h);

    }
}

var gameStartTime = 0;
var gameEndTime = 0;

function gameTimeMilliseconds() {
    return new Date().getTime() - gameStartTime;
}

function gameTime(ms) {
    var t = ms || gameTimeMilliseconds();
    t = new Date(t);
    return t.getMinutes() + ':' + t.getSeconds();
}

function finalTime() {
    return gameTime(gameEndTime - gameStartTime);
}
var canvas = document.getElementById("mainCanvas");
var screen = canvas.getContext("2d");

//Username
var username = location.href.split("?username=").pop();

function game() {
    document.getElementById("play").style.visibility = "hidden";
    document.getElementById("play2").style.visibility = "hidden";

    gameStartTime = new Date().getTime();
    var playerOne = new player(canvas.width / 2, canvas.height - 20, 20, 20);
    var bullets = [];
    var enemies = [];
    var enemySpeed = 1;
    var score = 0;
    var level = 0;
    //Draws enemies
    function drawEnemies(yPos) {
        for (var i = 0; i < 30; i++) {
            var x = 45 + (i % 6) * 30;
            var y = 45 + (i % 5) * 30;
            var enemyOne = new enemy(x * 2, -y, 25, 25);
            enemies.push(enemyOne);
            enemies[i].show();
        }
    }

    var gameRunning = true;
    //Main game loop
    function update() {
        playerOne.show();

        document.getElementById("scoreText").innerHTML = score;
        document.getElementById("level").innerHTML = level;

        //Shoot the bullets and checks if they hit an enemy
        for (var i = 0; i < bullets.length; i++) {
            bullets[i].move();
            for (var j = 0; j < enemies.length; j++) {
                if (bullets[i].hits(bullets[i], enemies[j])) {
                    enemies[j].clear();
                    bullets[i].clear();
                    enemies.splice(j, 1);
                    score += 10;
                }
            }
            if (bullets[i].y <= 0) {
                bullets[i].clear();
                bullets.splice(i, 1);
            }
        }
        if (enemies.length <= 0) {
            drawEnemies(50);
            enemySpeed += 1;
            level += 1;
            score += 0;
        }

        if (gameRunning) {
            window.requestAnimationFrame(update);
        }
    }

    var enemyMove = setInterval(function() {
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].move(enemySpeed);
            if (enemies[i].y > 400) {
                gameRunning = false;
                lost();
                clearInterval(enemyMove);
                break;
            }
        }

    }, 100);

    function lost() {
        gameEndTime = new Date().getTime();
        var run = setInterval(function() {
            screen.fillStyle = "#8B0000";
            screen.font = "80px Arial";
            screen.fillText("GAME OVER", 0, 100);
            screen.font = "24px Arial";
            screen.fillText("Your Score Was: " + score, 0, 150);
            screen.font = "18px";
            screen.fillText('Time Elapsed: ' + finalTime(), 0, 170);
            document.getElementById("time").innerHTML = finalTime();

            //Post score
            console.log("test user: " + username);

            $.post("/sendscore", {
                score: score,
                username: username
            }, (data) => {
                console.log("sent score");
            }, "json");

            clearInterval(run);
        }, 50);
    }

    //Key Press functions
    window.addEventListener("keydown", function(event) {
        if (event.keyCode == 37) {
            playerOne.move(-10);
        }
        if (event.keyCode == 39) {
            playerOne.move(10);
        }
        if (event.keyCode == 32) {
            var bulletOne = new bullet(playerOne.x + 7, playerOne.y, 5, 5);
            bullets.push(bulletOne);
        }
    });

    if (gameRunning) {
        update();
    }

}


function game2() {
    document.getElementById("play").style.visibility = "hidden";
    document.getElementById("play2").style.visibility = "hidden";
    gameStartTime = new Date().getTime();
    var playerOne = new player(canvas.width / 2, canvas.height - 20, 20, 20);
    var bullets = [];
    var enemies = [];
    var enemySpeed = 1;
    var score = 0;
    var level = 0;
    //Draws enemies
    function drawEnemies(yPos) {
        for (var i = 0; i < 30; i++) {
            var x = 45 + (i % 6) * 30;
            var y = 45 + (i % 5) * 30;
            var enemyOne = new enemy(x * 2, -y, 25, 25);
            enemies.push(enemyOne);
            enemies[i].show();
        }
    }

    var gameRunning = true;
    //Main game loop
    function update() {
        playerOne.show();

        document.getElementById("scoreText").innerHTML = score;
        document.getElementById("level").innerHTML = level;

        //Shoot the bullets and checks if they hit an enemy
        for (var i = 0; i < bullets.length; i++) {
            bullets[i].move();
            for (var j = 0; j < enemies.length; j++) {
                if (bullets[i].hits(bullets[i], enemies[j])) {
                    enemies[j].clear();
                    bullets[i].clear();
                    enemies.splice(j, 1);
                    score += 10;
                }
            }
            if (bullets[i].y <= 0) {
                bullets[i].clear();
                bullets.splice(i, 1);
            }
        }
        if (enemies.length <= 0) {
            drawEnemies(50);
            enemySpeed += 4;
            level += 1;
            score += 0;
        }

        if (gameRunning) {
            window.requestAnimationFrame(update);
        }
    }

    var enemyMove = setInterval(function() {
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].move(enemySpeed);
            if (enemies[i].y > 400) {
                gameRunning = false;
                lost();
                clearInterval(enemyMove);
                break;
            }
        }

    }, 100);

    function lost() {
        gameEndTime = new Date().getTime();
        var run = setInterval(function() {
            screen.fillStyle = "#8B0000";
            screen.font = "80px Arial";
            screen.fillText("GAME OVER", 0, 100);
            screen.font = "24px Arial";
            screen.fillText("Your Score Was: " + score, 0, 150);
            screen.font = "18px";
            screen.fillText('Time Elapsed: ' + finalTime(), 0, 170);
            document.getElementById("time").innerHTML = finalTime();

            //Post score
            console.log("test user: " + username);

            $.post("/sendscore", {
                score: score,
                username: username
            }, (data) => {
                console.log("sent score");
            }, "json");

            clearInterval(run);
        }, 50);
    }

    //Key Press functions
    window.addEventListener("keydown", function(event) {
        if (event.keyCode == 37) {
            playerOne.move(-15);
        }
        if (event.keyCode == 39) {
            playerOne.move(15);
        }
        if (event.keyCode == 32) {
            var bulletOne = new bullet(playerOne.x + 7, playerOne.y, 5, 5);
            bullets.push(bulletOne);
        }
    });

    if (gameRunning) {
        update();
    }

}