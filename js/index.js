function Main(config) {
  this.width = config.screenW || 0;
  this.height = config.screenH || 0;
  this.id = config.id;
  this.people = null;
  this.frameTime = 1000 / 10;
}
Main.prototype.initPeople = function () {
  const imags = this.imags;
  const that = this;
  const peopleImg = imags.find(function (item) {
    return item.info.type == "people";
  }).img;
  that.people = new People(
    that.width / 2,
    1,
    peopleImg,
    that.ctx,
    that.update,
    {
      speedX: 12,
      speedY: 2,
      frameTime: that.frameTime,
      screenW: that.width,
      screenH: that.height,
    }
  );
  that.people.init();
};
Main.prototype.initBlock = function () {
  const imags = this.imags;
  const that = this;
  const blockImg = imags.find(function (item) {
    return item.info.type == "block";
  }).img;

  that.blockFactory = new BlockFactory(
    blockImg,
    that.ctx,
    that.update,
    that.frameTime,
    { screenH: that.height, screenW: that.width }
  );
  that.blockFactory.start();
};
Main.prototype.init = function () {
  if (!this.id) {
    return;
  }
  const canvas = document.getElementById(this.id);
  canvas.width = this.width;
  canvas.height = this.height;
  this.ctx = canvas.getContext("2d");
  Utils.loadImages(
    [
      { url: "./img/people3.png", type: "people" },
      { url: "./img/障碍物3.png", type: "block" },
    ],
    (imags) => {
      this.imags = imags;
      this.initBlock();
      this.initPeople();
    }
  );
  return this;
};
Main.prototype.update = function () {
  //   console.log(this.people);
  this.ctx.clearRect(0, 0, this.width, this.height);
  if (this.blockFactory) {
    this.blockFactory.updateblock();
    const blocks = this.blockFactory.validBlocks;
    let flag = false;
    let block = {};
    for (var i in blocks) {
      const item = blocks[i];
      if (!item.destroy) {
        item.update();
        item.manOn(this.people);
        if (item.isManOn) {
          flag = true;
          block = item;
        }
      }
    }
    if (this.people) {
      this.people.manOn(flag, block);
      if (!this.people.life) {
        const time = new Date().Format("yyyy-MM-dd HH:mm:ss");
        Player.play("gameover");
        clearInterval(this.timer);
        this.blockFactory && this.blockFactory.end();
        $("#modal").show();
        const score = getScore();
        $("#modal .content").html(
          `<div>
            <div>你已死亡，游戏结束!</div>
            <div>得分：${score}</div>
          </div>`
        );
        Player.pause("bg");
        const history = parseInt($("#higher-score").text());
        if (score > history) {
          $("#higher-score").text(score);
        }
      }
      this.people.update();
    }
  }
};
Main.prototype.setTimer = function () {
  this.timer = setInterval(() => {
    this.update();
  }, this.frameTime);
};
Main.prototype.start = function () {
  Player.bg.volume = 0.1;
  Player.play("bg");
  $(".start").hide();
  this.setTimer();
  return this;
};
Main.prototype.restart = function () {
  this.ctx.clearRect(0, 0, this.width, this.height);
  this.initBlock();
  this.initPeople();
  this.start();
};
Main.prototype.pause = function () {
  this.blockFactory.end();
  this.people.onpaused();
  clearInterval(this.timer);
  Player.pause("bg");
};
Main.prototype.pausePlay = function () {
  this.people.init();
  this.blockFactory.setTimer();
  this.setTimer();
  Player.play("bg");
};
