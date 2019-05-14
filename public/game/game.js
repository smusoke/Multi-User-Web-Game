;(function() {
  var Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d'); // bunch of canvas functions
    var gameSize = { x: canvas.width, y: canvas.height }; //. width and height


    this.bodies = createInvaders(this).concat([new Player(this, gameSize)]);

    var self = this;

    loadSound('shoot.wav', function(shootSound) {
      var tick = function() {
        self.shootSound = shootSound;
        self.draw(screen, gameSize);
        self.update();
        self.fillText
        requestAnimationFrame(tick); // hey browser run this in the near future
      };

      tick();
    });

  };


// score
var score = 0,
  gameStartTime,
  gameEndTime,
  maxTime = 75000
;
function gameTimeMilliseconds(){
  return new Date().getTime() - gameStartTime;
}
function gameTime(ms){
  var t = ms || gameTimeMilliseconds();
  t = new Date(t);
  return t.getMinutes() + ':' + t.getSeconds();
}
function finalTime(){
  return gameTime(gameEndTime - gameStartTime);
}



    gameStartTime = new Date().getTime();


  var Bullet = function(center, velocity) {
    this.size = {x: 3, y: 3}; // width and height
    this.center = center;
    this.velocity = velocity;
  };

  Bullet.prototype = {
    update: function() {
      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;
    }
  };

  var drawRect = function(screen, body) {
    screen.fillRect(body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2,
                    body.size.x, body.size.y
                    );
  };

  var Keyboarder = function() {
    var keyState = {};

    window.onkeydown = function(e) {
      keyState[e.keyCode] = true;
    };

    window.onkeyup = function(e) {
      keyState[e.keyCode] = false;
    };

    this.isDown = function(keyCode) {
      return !!keyState[keyCode];
    };


    Game.prototype.touchstart = function(s) {
    if(this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, KEY_SPACE);
    }    
};

    this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
  };

  Game.prototype = {
    update: function() {
      var bodies = this.bodies;
      var notCollidingWithAnything = function(b1) {
        return bodies.filter(function(b2) {
          return colliding(b1, b2);
        }).length === 0;
      };

      this.bodies = this.bodies.filter(notCollidingWithAnything);

      for (var i = 0; i < this.bodies.length; i++) {
        this.bodies[i].update();
      }
    },
    draw: function(screen, gameSize) {
    screen.clearRect(0, 0, gameSize.x, gameSize.y);
    screen.fillStyle = '#8B0000';
    screen.textAlign = 'left';
    screen.font = '14px Arial';

    //screen.fillText('Keys: Left / Right / Space to shoot', 20, gameSize.x-10);
    screen.fillText('Time: '+ gameTime(), 10, gameSize.x-20);

    //gameEndTime = new Date().getTime();
      for (var i = 0; i < this.bodies.length; i++) {
        drawRect(screen, this.bodies[i]);
      }
    },
    addBody: function(body) {
      this.bodies.push(body);
    },
    invadersBelow: function(invader) {
      return this.bodies.filter(function(b) {
        return b instanceof Invader &&
          b.center.y > invader.center.y &&
            b.center.x - invader.center.x < invader.size.x;
      }).length > 0;
      if (invaders.invadersLeft()>1){
        gameEndTime = new Date().getTime();
        console.log(gameTime());
      }
    }
  };

  var Invader = function(game, center) {
    this.game = game;

    this.size = {x: 15, y: 15};
    this.center = center;
    this.patrolX = 0;
    this.speedX = 0.3;
  };

  Invader.prototype = {
    update: function() {
      if (this.patrolX < 0 || this.patrolX > 40) {
        this.speedX = -this.speedX;
      }

      this.center.x += this.speedX;
      this.patrolX += this.speedX;

      if (Math.random() > 0.995 && !this.game.invadersBelow(this)) {
        var bullet = new Bullet({x: this.center.x, y: this.center.y + this.size.x / 2}, {x: Math.random() - 0.5, y: 2});

        this.game.addBody(bullet);
       
        
      }

    }
  };
//create number of invadors ro draw
  var createInvaders = function(game) {
    var invaders = [];
    for (var i = 0; i < 30; i++) {
      var x = 40 + (i % 6) * 50;
      var y = 40 + (i % 5) * 50;
      invaders.push(new Invader(game, {x: x, y: y}));
    }
    return invaders;
  };
var axes;
  var Player = function(game, gameSize) {
    this.game = game;
    this.size = {x: 15, y: 15}; // width and height
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.x }
    this.keyboarder = new Keyboarder();
      axes = this.size.x + this.size.y;
     // console.log(axes);

  };
  

  Player.prototype = {
    update: function() {
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.center.x -= 2;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.center.x += 2;
      }

      
      

      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
        var bullet = new Bullet({x: this.center.x, y: this.center.y - this.size.x / 2}, {x: 0, y: -5});
        //console.log("bullet: " + this.size.x);



        this.game.addBody(bullet);
        this.game.shootSound.load();
        this.game.shootSound.play();
      }

    }

  };

  var colliding = function(b1, b2) {

    return !(b1 === b2 ||
            b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
            b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
            b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
            b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);
  };

  var loadSound = function(url, callback) {
    var loaded = function() {
      callback(sound);
      sound.removeEventListener('canplaythrough', loaded);
    };

    var sound = new Audio(url);
    sound.addEventListener('canplaythrough', loaded);
    sound.load();
  };




  window.onload = function() {
    new Game('screen');
  };

})();
