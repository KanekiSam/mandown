function Animation() {
  this.picframeLists = {}; // 帧动画数组
  this.currentIndex = 0; // 当前图像
}
Animation.prototype.setFrame = function (name, pics, oneframe) {
  this.picframeLists = pics;
  this.currentIndex = 0;
};
