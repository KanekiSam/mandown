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
}
People.prototype.init = function () {
  this.life = 100;
  this.changeLife({ life: 100 });
  this.draw();
  this.initEvent();
};
People.prototype.initEvent = function () {
  var that = this;
  window.onkeydown = (event) => {
    if (that.direction != event.keyCode) {
      that.direction = event.keyCode;
      that.currentIndex = 0;
    }
    if (event.keyCode == "37") {
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
    } else if (event.keyCode == "38") {
      // 向上移动
      if (that.isManOn) {
        Player.play("jump");
        that.speedY = -that.options.speedY * 5;
      }
      that.frames = that.ups;
    } else if (event.keyCode == "39") {
      // 向右移动
      that.x += that.speedX;
      if (that.isManOn) {
        Player.play("walk");
        that.frames = that.rights;
      } else {
        that.currentIndex = 0;
        that.frames = that.ups;
        Player.pause("walk");
      }
    } else if (event.keyCode == "40") {
      // 向下移动
      that.frames = that.ups;
      if (that.isManOn) {
        Player.play("jump");
        that.y += 10;
      }
    }
    console.log(this.frames);
    window.onkeyup = () => {
      that.currentIndex = 0;
      that.frames = that.isManOn ? [that.stop] : that.ups;
      Player.pause("walk");
    };
  };
};
People.prototype.move = function () {
  this.speedY += this.acspeedY * this.options.speedY;
  this.y += this.speedY;
  this.x += this.acspeedX;
};
People.prototype.draw = function () {
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
    this.life = life;
  } else {
    if (this.life - count <= 0) {
      this.life = 0;
    } else {
      this.life -= count;
    }
  }
  changeLife(this.life);
};
