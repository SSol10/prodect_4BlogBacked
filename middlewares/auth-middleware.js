const jwt = require("jsonwebtoken");
const secretKey = require("../config/secretKey.json");

// 미들웨어 함수는 인증기능을 담당하고 클라이언트로 부터 받은 쿠키(Authorization)의 값을 확인하여 인증
module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;

  // 쿠키(Authorization)가 존재하지 않았을때를 대비하여 authType, authToken를 추출한다
  const [authType, authToken] = (Authorization ?? "").split(" ");

  // authType === Bearer 값인지 확인
  // authToken 검증
  if (authType !== "Bearer" || !authToken) {
    return res
      .status(403)
      .json({ errorMessage: "로그인이 필요한 기능입니다." });
  }

  // JWT 검증
  try {
    // authToken이 만료되었는지 확인
    // authToken이 서버가 발급한 토큰이 맞는지 검증
    const decodedToken = jwt.verify(authToken, secretKey.key);

    const userId = decodedToken.userId;
    res.locals.user = userId;

    // 다음 미들웨어로 넘어가기
    next();
  } catch (error) {
    console.error(error);
    res
      .status(403)
      .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    return;
  }
};
