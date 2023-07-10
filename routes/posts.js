const express = require("express");
const router = express.Router();
// ../middlewares/auth-middleware.js 인증 미들웨어를 가져온다.
const authMiddleware = require("../middlewares/auth-middleware.js");
const { Users, Posts } = require("../models");
const { Op } = require("sequelize");

// 게시글 작성 API
router.post("/posts", authMiddleware, async (req, res) => {
  const userId = res.locals.user;
  const { title, content } = req.body;

  if (!title || !content) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 제목 또는 내용이 비어있습니다." });
  }

  await Posts.create({ title, content, UserId: userId });
  return res.status(201).json({ message: "게시글을 생성하였습니다." });
});

// 게시글 수정 API
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const userId = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  const findPostId = await Posts.findOne({ where: { postId } });

  if (!findPostId) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 게시글입니다." });
  } else if (userId !== findPostId.UserId) {
    return res
      .status(403)
      .json({ errorMessage: "게시글의 수정 권한이 존재하지 않습니다." });
  } else if (!title || !content) {
    return res
      .status(412)
      .json({ errorMessage: "게시글 제목 또는 내용이 비어있습니다." });
  }

  await Posts.update({ title, content }, { where: { [Op.and]: [{ postId }] } });
  return res.status(200).json({ message: "게시글을 수정하였습니다." });
});

// 게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const userId = res.locals.user;
  const { postId } = req.params;

  const findPostId = await Posts.findOne({ where: { postId } });

  if (!findPostId) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 게시글입니다." });
  } else if (userId !== findPostId.UserId) {
    return res
      .status(403)
      .json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." });
  }

  await Posts.destroy({
    where: { [Op.and]: [{ postId }] },
  });
  return res.status(200).json({ message: "게시글을 삭제하였습니다." });
});

module.exports = router;

// 게시글 목록 조회 API
router.get("/posts", async (req, res) => {
  const postList = await Posts.findAll({
    attributes: ["postId", "title", "likes", "createdAt", "updatedAt"],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Users,
        attributes: ["nickname"],
      },
    ],
  });

  return res.status(200).json({ posts: postList });
});

// 게시글 상세 조회 API
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;

  const postDetail = await Posts.findOne({
    attributes: [
      "postId",
      "title",
      "content",
      "likes",
      "createdAt",
      "updatedAt",
    ],
    where: { postId },
    include: [
      {
        model: Users,
        attributes: ["nickname"],
      },
    ],
  });

  if (!postDetail) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 게시글입니다." });
  }
  return res.json({ post: postDetail });
});
