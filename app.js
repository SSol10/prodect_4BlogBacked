const express = require("express");
// cookie-parser를 모듈로 가져온다.
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

const usersRouter = require("./routes/users.js");
const postsRouter = require("./routes/posts.js");
const commentsRouter = require("./routes/comments.js");
const likesRouter = require("./routes/likes.js");

// express.json()를 사용하여 json 형식으로 변환
app.use(express.json());
// cookieParser()를 미들웨어로 등록
app.use(cookieParser());

app.use("/api", [usersRouter, postsRouter, commentsRouter, likesRouter]);
// port를 서버로 만들고 port가 열렸을 시 콘솔에 메세지 출력하게 한다.
app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
