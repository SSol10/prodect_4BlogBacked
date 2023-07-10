// express module을 express 변수에 할당
const express = require("express");
// express.Router()로 라우터 객체 생성
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware.js");
const { Users, Posts, Likes } = require("../models");

// 좋아요 API
router.post("/posts/:postId/like", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const userId = res.locals.user;

  const post = await Posts.findOne({ where: { postId } });

  if (!post) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 게시글입니다." });
  }

  const like = await Likes.findOne({
    where: { UserId: userId, PostId: post.postId },
  });

  if (!like) {
    await Posts.update(
      { likes: post.likes + 1 },
      { where: { postId: post.postId } }
    );
    await Likes.create({ UserId: userId, PostId: post.postId });
    return res.status(200).json({ message: "게시물에 좋아요를 눌렀습니다." });
  }

  await Posts.update(
    { likes: post.likes - 1 },
    { where: { postId: post.postId } }
  );
  await Likes.destroy({ where: { UserId: userId, PostId: post.postId } });
  return res.status(200).json({ message: "좋아요를 취소했습니다." });
});

// 좋아요 조회 API
router.get("/likes/posts", authMiddleware, async (req, res) => {
  const userId = res.locals.user;

  const likes = await Likes.findAll({
    where: { UserId: userId },
    attributes: ["PostId"],
    include: [
      {
        model: Posts,
        attributes: ["title", "content"],
        order: [["likes", "DESC"]],
        include: [{ model: Users, attributes: ["nickname"] }],
      },
    ],
  });

  if (likes.length === 0) {
    return res.status(200).json({ message: "좋아요한 게시글이 없습니다." });
  }

  return res.status(200).json({ likes });
});

module.exports = router;
