function BlockBase(x, y, img, ctx, update, frameTime, options) {
  this.x = x;
  this.y = y;
  this.sx = 0;
  this.sy = 0;
  this.ctx = ctx;
  this.img = img;
  this.mainUpdate = update;
  this.speedX = 0;
  this.speedY = -2;
  this.timer = null;
  this.width = 0;
  this.height = 0;
  this.frameTime = frameTime;
  this.options = options;
  this.destroy = false;
  this.isManOn = false;
  this.score = 10;
}
BlockBase.prototype.draw = function () {
  Utils.drawImage({
    img: this.img,
    sx: this.sx,
    sy: this.sy,
    swidth: this.width,
    sheight: this.height,
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    ctx: this.ctx,
  });
};
BlockBase.prototype.move = function () {
  this.y += this.speedY;
  this.x += this.speedX;
};
BlockBase.prototype.checkValid = function () {
  if (this.y + this.height < 0) {
    this.destroy = true;
  }
  if (this.x + this.width < 0 && this.speedX < 0) {
    this.x = this.options.screenW;
  }
  if (this.x - this.options.screenW > 0 && this.speedX > 0) {
    this.x = -this.width;
  }
};
BlockBase.prototype.init = function () {
  // if (this.speedX < 0) {
  //   this.x = this.screenW;
  // } else if (this.speedX > 0) {
  //   this.x = -this.width;
  // }
  this.draw();
  this.move();
};
BlockBase.prototype.updateBeforeEvent = function () {};
BlockBase.prototype.updateEvent = function () {};
BlockBase.prototype.update = function () {
  this.updateBeforeEvent();
  this.draw();
  this.move();
  this.checkValid();
  if (this.isManOn && this.score) {
    addScore(this.score);
    this.score = 0;
  }
  if (this.isCrashed && this.score) {
    addScore(this.score);
    this.score = 0;
  }
  this.updateEvent();
};
BlockBase.prototype.manOnEvent = function () {};
BlockBase.prototype.manOn = function (man) {
  this.isManOn = man.checkManOn({
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    speedY: this.speedY,
    speedX: this.speedX,
  });
  this.man = man;
  this.manOnEvent();
};
/**普通障碍物 */
function NormalBlock() {
  BlockBase.apply(this, arguments);
  this.width = 118;
  this.height = 26;
  this.sx = 0;
  this.sy = 4;
}
NormalBlock.prototype = new BlockBase();

/**弹簧障碍物 */
function SpringBlock() {
  BlockBase.apply(this, arguments);
  this.speedX = 2 * Utils.getSign();
  this.action = [
    { sx: 0, sy: 32, height: 23, width: 118 },
    { sx: 0, sy: 58, width: 118, height: 32 },
  ];
  this.currentIndex = 0;
  this.acspeedY = -80;
  this.originY = this.y;
  const current = this.action[this.currentIndex];
  this.width = current.width;
  this.height = current.height;
  this.sx = current.sx;
  this.sy = current.sy;
  this.score = 15;
}
SpringBlock.prototype = new BlockBase();
SpringBlock.prototype.onAction = function () {
  setTimeout(() => {
    if (this.action.length > 1) {
      this.currentIndex =
        this.currentIndex < this.action.length - 1 ? this.currentIndex + 1 : 0;
      const current = this.action[this.currentIndex];
      const diffY = current.height - this.height;
      this.y -= diffY;
      this.width = current.width;
      this.height = current.height;
      this.sx = current.sx;
      this.sy = current.sy;
      console.log(this.currentIndex != 0);
      if (this.currentIndex != 0) {
        this.onAction();
      }
    }
  }, this.frameTime);
};
SpringBlock.prototype.updateEvent = function () {
  if (this.isManOn) {
    this.onAction();
    this.man.changeSpeed({ speedY: -20 });
    Player.play("duang");
  }
};
/**尖刺障碍物 */
function SpineBlock() {
  BlockBase.apply(this, arguments);
  this.width = 118;
  this.height = 21;
  this.sx = 0;
  this.sy = 90;
  // this.speedX = Utils.getSign();
  this.score = -5;
}
SpineBlock.prototype = new BlockBase();
SpineBlock.prototype.decount = function (man) {
  if (this.isManOn) {
    if (this.isManOn && man.life) {
      man.changeLife({ count: 0.1 });
      Player.play("alarm");
    }
  }
};
SpineBlock.prototype.updateEvent = function () {
  if (this.isManOn) {
    this.decount(this.man);
  }
};
/**左滚动障碍物 */
function RunLeftBlock() {
  BlockBase.apply(this, arguments);
  this.action = [
    { sx: 0, sy: 113, height: 27, width: 118 },
    { sx: 0, sy: 142, width: 118, height: 27 },
  ];
  this.currentIndex = 0;
  this.speedX = Utils.getSign();
  this.acspeedX = -5;
  this.score = 20;
}
RunLeftBlock.prototype = new BlockBase();
RunLeftBlock.prototype.getCurrent = function () {
  const current = this.action[this.currentIndex];
  this.width = current.width;
  this.height = current.height;
  this.sx = current.sx;
  this.sy = current.sy;
  this.currentIndex =
    this.currentIndex == this.action.length - 1 ? 0 : this.currentIndex + 1;
};
RunLeftBlock.prototype.updateBeforeEvent = function () {
  this.getCurrent();
};
RunLeftBlock.prototype.updateEvent = function () {
  if (this.isManOn) {
    Player.play("lvdai");
  }
};
/**右滚动障碍物 */
function RunRightBlock() {
  BlockBase.apply(this, arguments);
  this.action = [
    { sx: 0, sy: 170, height: 27, width: 118 },
    { sx: 0, sy: 198, width: 118, height: 27 },
  ];
  this.currentIndex = 0;
  this.speedX = Utils.getSign();
  this.acspeedX = 5;
  this.score = 20;
}
RunRightBlock.prototype = new BlockBase();
RunRightBlock.prototype.getCurrent = function () {
  const current = this.action[this.currentIndex];
  this.width = current.width;
  this.height = current.height;
  this.sx = current.sx;
  this.sy = current.sy;
  this.currentIndex =
    this.currentIndex == this.action.length - 1 ? 0 : this.currentIndex + 1;
};
RunRightBlock.prototype.updateBeforeEvent = function () {
  this.getCurrent();
};
RunRightBlock.prototype.updateEvent = function () {
  if (this.isManOn) {
    Player.play("lvdai");
  }
};
/**消失障碍物 */
function DisappearBlock() {
  BlockBase.apply(this, arguments);
  this.width = 118;
  this.height = 26;
  this.sx = 0;
  this.sy = 227;
  // this.speedX = Utils.getSign();

  this.score = 30;
  this.timeCount = 20;
  this.startCount = false;
}
DisappearBlock.prototype = new BlockBase();
DisappearBlock.prototype.updateBeforeEvent = function () {
  if (this.timeCount == 0) {
    this.destroy = true;
  }
  if (this.timeCount < 10) {
    this.ctx.globalAlpha = 0.5;
  }
  if (this.startCount) {
    this.timeCount -= 1;
  }
};
DisappearBlock.prototype.updateEvent = function () {
  this.ctx.globalAlpha = 1;
  if (this.isManOn) {
    this.startCount = true;
  }
};
/**小鸟障碍物 */
function RuningBird() {
  BlockBase.apply(this, arguments);
  this.speedX = Utils.getSign() * 2;
  this.speedY = -4;
  this.score = 0;
  this.left = this.options.birdImgs.left;
  this.right = this.options.birdImgs.right;
  this.img = this.speedX > 0 ? this.right : this.left;
  this.destroyImg = this.options.birdImgs.bomb;
  this.destroy = false;
  this.width = 60;
  this.height = 38;
}
RuningBird.prototype = new BlockBase();
RuningBird.prototype.checkValid = function () {
  if (this.y + this.height < 0 || this.isCrashed) {
    setTimeout(() => {
      this.destroy = true;
    }, this.frameTime * 2);
    if (this.isCrashed) {
      this.height = 60;
      this.img = this.destroyImg;
      Player.play("bomb");
    }
  }
  if (this.x + this.width < 0 && this.speedX < 0) {
    this.x = this.options.screenW;
  }
  if (this.x - this.options.screenW > 0 && this.speedX > 0) {
    this.x = -this.width;
  }
};
RuningBird.prototype.manOn = function (man) {
  this.isCrashed = man.checkCrash({
    x: this.x + this.speedX,
    y: this.y + this.speedY,
    width: this.width,
    height: this.height,
    speedY: this.speedY,
    speedX: this.speedX,
  });
  this.man = man;
};
RuningBird.prototype.updateEvent = function () {
  if (this.isCrashed && !this.destroy) {
    console.log("life: ", this.man.life);
    this.man.changeLife({ count: 10 });
  }
};

/**障碍物工厂 */
function BlockFactory(img, ctx, update, frameTime, options) {
  this.blocks = [];
  this.validBlocks = [];
  this.img = img;
  this.ctx = ctx;
  this.update = update;
  this.frameTime = frameTime;
  this.options = options;
}
BlockFactory.prototype.createBlock = function (x = 0, y = 0, cName) {
  const blockClass = [
    { name: NormalBlock, code: [1, 0.2] },
    { name: SpringBlock, code: [2, 0.2] },
    { name: SpineBlock, code: [3, 0.1] },
    { name: RunLeftBlock, code: [4, 0.2] },
    { name: RunRightBlock, code: [5, 0.1] },
    { name: DisappearBlock, code: [6, 0.2] },
    // { name: RuningBird, code: [7, 0.3] },
  ];
  let className = cName;
  if (!className) {
    let random = new GLRandom(1, 12);
    random.percentage = new Map(blockClass.map((item) => item.code));
    random.range();
    const count = random.create();
    for (const item of blockClass) {
      if (count == item.code[0]) {
        className = item.name;
        break;
      }
    }
    // className = RuningBird;
  }
  const { img, ctx, update, frameTime, options } = this;
  const x0 = x || Math.random() * (options.screenW - 200);
  console.log("block y: ", y || options.screenH);
  var block = new className(
    x0,
    y || options.screenH,
    img,
    ctx,
    update,
    frameTime,
    options,
  );
  block.init();
  this.blocks.push(block);
};
BlockFactory.prototype.setTimer = function () {
  const diffx = this.options.screenW / 6;
  this.createTimer = setInterval(() => {
    this.createBlock(diffx + diffx * parseInt(Math.random() * 4));
    // const bird = new RuningBird(this);
    setTimeout(() => {
      this.createBlock(
        diffx + diffx * parseInt(Math.random() * 4),
        0,
        RuningBird,
      );
    }, 50);
  }, this.frameTime * 50);
};
BlockFactory.prototype.start = function () {
  const diffx = this.options.screenW / 6;
  const diffy = this.options.screenH / 4;
  for (let i = 1; i <= 4; i++) {
    this.createBlock(
      diffx * parseInt(Math.random() * 6) + Utils.getSign() * 20,
      diffy * i,
      NormalBlock,
    );
  }
  this.setTimer();
};
BlockFactory.prototype.updateblock = function () {
  this.validBlocks = this.blocks.filter((item) => !item.destroy);
};
BlockFactory.prototype.end = function () {
  this.createTimer && clearInterval(this.createTimer);
};
