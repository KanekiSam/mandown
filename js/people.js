const status = {
  DOWN: "DOWN",
  UP: "UP",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
};
function People(x, y, img, ctx, update, options) {
  this.options = options;
  this.x = x;
  this.y = y;
  this.img = img;
  this.ctx = ctx;
  this.width = 24;
  this.height = 60;
  this.dir = status.DOWN;
  this.mainUpdate = update;
  this.frameTime = options.frameTime;
  this.speedX = options.speedX;
  this.speedY = options.speedY;
  this.acspeedX = 0;
  this.acspeed = options.speedY;
  this.acspeedY = 1;
  this.isManOn = false;
  this.stop = { x: 16, y: 24, width: 24, height: 60 };
  this.lefts = [
    { x: 160, y: 108, width: 32, height: 60, index: 0 },
    { x: 120, y: 108, width: 16, height: 60, index: 1 },
    { x: 64, y: 108, width: 32, height: 60, index: 2 },
    { x: 16, y: 108, width: 24, height: 60, index: 3 },
  ];
  this.rights = [
    { x: 160, y: 192, width: 32, height: 60, index: 0 },
    { x: 112, y: 192, width: 24, height: 60, index: 1 },
    { x: 60, y: 192, width: 32, height: 60, index: 2 },
    { x: 16, y: 192, width: 16, height: 60, index: 3 },
  ];
  this.downs = [{ x: 60, y: 353, width: 24, height: 60, index: 0 }];
  this.ups = [{ x: 16, y: 353, width: 24, height: 60, index: 0 }];
  this.shearInfo = { x: 16, y: 353 };
  this.timer = null;
  this.moveTimer = null;
  this.currentIndex = 0;
  this.frames = this.ups;
  this.direction;
  this.life = 100;
  this.bleeding = false;
}
People.prototype.init = function () {
  this.life = 100;
  this.changeLife({ life: 100 });
  this.draw();
  this.initEvent();
};
People.prototype.runLeft = function () {
  const that = this;
  if (that.direction != "37") {
    that.direction = "37";
    that.currentIndex = 0;
  }
  // 向左移动
  that.x -= that.speedX;
  if (that.isManOn) {
    Player.play("walk");
    that.frames = that.lefts;
  } else {
    that.currentIndex = 0;
    that.frames = that.ups;
    Player.pause("walk");
  }
};
People.prototype.runRight = function () {
  const that = this;
  if (that.direction != "39") {
    that.direction = "39";
    that.currentIndex = 0;
  }
  // 向右移动
  that.x += that.speedX;
  console.log("that: ", that);
  if (that.isManOn) {
    Player.play("walk");
    that.frames = that.rights;
  } else {
    that.currentIndex = 0;
    that.frames = that.ups;
    Player.pause("walk");
  }
};
People.prototype.runUp = function () {
  const that = this;
  if (that.direction != "38") {
    that.direction = "38";
    that.currentIndex = 0;
  }
  // 向上移动
  if (that.isManOn) {
    Player.play("jump");
    that.speedY = -that.options.speedY * 5;
  }
  that.frames = that.ups;
};
People.prototype.runDown = function () {
  const that = this;
  if (that.direction != "40") {
    that.direction = "40";
    that.currentIndex = 0;
  }
  // 向下移动
  that.frames = that.ups;
  if (that.isManOn) {
    Player.play("jump");
    that.y += 10;
  }
};
People.prototype.runThrottle = Utils.throttle(({ X, Y, that }) => {
  console.log(X, Y);
  if (Math.abs(X) > Math.abs(Y) && X > 0) {
    // alert("right");
    that.runRight();
  } else if (Math.abs(X) > Math.abs(Y) && X < 0) {
    // alert("left");
    that.runLeft();
  } else if (Math.abs(X) < 3 && Y > 0) {
    // alert("bottom");
    that.runDown();
  } else if (Math.abs(X) < 3 && Y < 0) {
    // alert("top");
    that.runUp();
  }
}, 100);
People.prototype.handEvent = function () {
  const that = this;
  that.touching = true;
  $("#game-screen").on("touchstart", function (e) {
    e.preventDefault();
    (startX = e.originalEvent.changedTouches[0].pageX),
      (startY = e.originalEvent.changedTouches[0].pageY);
    $("#controlBar").show();
    $("#controlBar").css({
      left: startX - 32,
      top: startY - 32,
      display: "block",
    });
    $("#directionBoll").css({ left: 16, top: 16 });
  });
  $("#game-screen").on("touchmove", function (e1) {
    that.touching = true;
    e1.preventDefault();
    (moveEndX = e1.originalEvent.changedTouches[0].pageX),
      (moveEndY = e1.originalEvent.changedTouches[0].pageY),
      (X = moveEndX - startX),
      (Y = moveEndY - startY);
    let left = 16 + X > 32 ? 32 : 16 + X;
    left = left < 0 ? 0 : left;
    let top = 16 + Y > 32 ? 32 : 16 + Y;
    top = top < 0 ? 0 : top;
    $("#directionBoll").css({ left, top });
    that.runThrottle({ X, Y, that });
  });
  $("#game-screen").on("touchend", function (e2) {
    $("#controlBar").hide();
    that.touching = false;
    e2.preventDefault();
  });
  $("#game-screen").on("touchcancel", function (e2) {
    console.log("touchcancel");
  });
};
People.prototype.keyEvent = function () {
  const that = this;
  window.onkeydown = (event) => {
    if (event.keyCode == "37") {
      console.log("left");
      // 向左移动
      that.runLeft();
    } else if (event.keyCode == "38") {
      // 向上移动
      that.runUp();
    } else if (event.keyCode == "39") {
      // 向右移动
      that.runRight();
    } else if (event.keyCode == "40") {
      // 向下移动
      that.runDown();
    }
    window.onkeyup = () => {
      that.currentIndex = 0;
      that.frames = that.isManOn ? [that.stop] : that.ups;
      Player.pause("walk");
    };
  };
};
People.prototype.initEvent = function () {
  var that = this;
  if (isPhone) {
    this.handEvent();
  } else {
    this.keyEvent();
  }
};
People.prototype.move = function () {
  this.speedY += this.acspeedY * this.options.speedY;
  this.y += this.speedY;
  this.x += this.acspeedX;
};
People.prototype.draw = function () {
  console.log("draw: ", this.x);
  Utils.drawImage({
    img: this.img,
    x: this.x,
    y: this.y,
    sx: this.shearInfo.x,
    sy: this.shearInfo.y,
    swidth: this.width,
    sheight: this.height,
    width: this.width,
    height: this.height,
    ctx: this.ctx,
  });
};
People.prototype.update = function () {
  if (this.bleeding) {
    this.ctx.globalAlpha = 0.5;
  }
  const that = this;
  this.died();
  const current = this.frames[this.currentIndex];
  this.shearInfo = { x: current.x, y: current.y };
  this.width = current.width;
  this.height = current.height;
  this.currentIndex =
    this.frames.length == this.currentIndex + 1 ? 0 : this.currentIndex + 1;
  // console.log(this.frames);
  this.draw();
  this.move();
  if (isPhone && !this.touching) {
    that.currentIndex = 0;
    that.frames = that.isManOn ? [that.stop] : that.ups;
    Player.pause("walk");
  }
  this.ctx.globalAlpha = 1;
  this.bleeding = false;
};
People.prototype.checkCrash = function ({ x, y, width, height, speedY }) {
  const endx0 =
    this.direction == "37"
      ? this.x - this.speedX
      : this.direction == "38"
      ? this.x + this.speedX
      : this.x;
  const endx1 = endx0 + this.width;
  const endy0 = this.y + this.height;
  if (endx1 < x || endx0 > x + width) {
    return false;
  }
  if (endy0 < y || this.y > y + height) {
    return false;
  }
  return true;
};
People.prototype.checkManOn = function ({ x, y, width, height, speedY }) {
  const endx0 =
    this.direction == "37"
      ? this.x - this.speedX
      : this.direction == "38"
      ? this.x + this.speedX
      : this.x;
  const endx1 = endx0 + this.width;
  const endy0 = this.y + this.height;
  let flag = false;
  if (endx1 >= x && endx0 <= x + width) {
    if (endy0 == y) {
      flag = true;
    } else if (endy0 <= y) {
      const endy = endy0 + this.speedY + this.acspeedY * this.options.speedY;
      if (endy >= y) {
        flag = true;
      }
    }
  }
  return flag;
};
People.prototype.manOn = function (bool, { speedY, y, speedX, acspeedX = 0 }) {
  if (this.isManOn != bool) {
    if (bool) {
      this.acspeedY = 0;
      this.speedY = speedY;
      this.isManOn = true;
      this.currentIndex = 0;
      this.frames = this.downs;
      this.y = y - this.height;
      this.acspeedX = acspeedX + speedX;
    } else {
      this.acspeedY = 1;
      this.isManOn = false;
      this.acspeedX = 0;
    }
  }
};
People.prototype.changeSpeed = function ({ speedY, speedX }) {
  speedX && (this.speedX = speedX);
  speedY && (this.speedY = speedY);
};
People.prototype.restoreSpeed = function () {
  this.speedX = this.options.speedX;
  this.speedY = this.options.speedY;
  this.isManOn = false;
};
People.prototype.onpaused = function () {
  window.onkeyup = () => {};
  window.onkeydown = () => {};
  $("body").on("touchstart", function (e) {});
  $("body").on("touchmove", function (e) {});
  $("body").on("touchend", function (e) {});
  Player.pause("walk");
  Player.pause("jump");
};
People.prototype.died = function () {
  let flag = false;
  if (this.y + this.height >= this.options.screenH) {
    this.y = this.options.screenH - this.height;
    flag = true;
  }
  if (this.y <= 0) {
    this.y = 0;
    flag = true;
  }
  if (flag) {
    this.onpaused();
    this.life = 0;
    changeLife(0);
  }
  if (this.x < 0) {
    this.x = 0;
  }
  if (this.x + this.width > this.options.screenW) {
    this.x = this.options.screenW - this.width;
  }
};
People.prototype.changeLife = function ({ count, life }) {
  if (life) {
    if (this.life > life) {
      this.bleeding = true;
    }
    this.life = life;
  } else {
    if (this.life - count <= 0) {
      this.life = 0;
      this.bleeding = true;
    } else {
      this.life -= count;
      this.bleeding = true;
    }
  }
  changeLife(this.life);
};
