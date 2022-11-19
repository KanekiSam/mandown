var express = require("express");
var path = require("path");
var app = express();
console.log(path.join(__dirname, "../"))
app.use(express.static(path.join(__dirname, "../")));
var router = express.Router();
router.get("/", function (req, res, next) {
  res.render(path.join(__dirname, "/index.html"), { title: "游戏" });
});
const hostname = "localhost";
const port = 3000;
app.listen(port, () => {
  console.log(`服务器运行在 http://${hostname}:${port}/`);
});
