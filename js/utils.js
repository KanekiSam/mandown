const Utils = {
  loadImages: function (urlInfo, cb) {
    const imgs = [];
    for (var i in urlInfo) {
      const info = urlInfo[i];
      const url = info.url;
      const img = new Image();
      img.src = url;
      img.onload = function () {
        imgs.push({ img, info });
        if (imgs.length == urlInfo.length) {
          cb && cb(imgs);
        }
      };
    }
  },
  drawImage: function (options) {
    // console.log(options);
    var { img, sx, sy, swidth, sheight, x, y, width, height, ctx } = options;
    // console.log(typeof img);
    ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
  },
  addAnimation: function () {},
  getSign: function () {
    const n = parseInt(Math.random() * 2);
    return n == 1 ? 1 : -1;
  },
  throttle:function(actionFunc, timer){
    let flag = false;
    return function(...args){
      if (flag) {
        return;
      }
      flag = true;
      setTimeout(() => {
        flag = false;
      }, timer);
      actionFunc(args[0]);
    }
  }
};
