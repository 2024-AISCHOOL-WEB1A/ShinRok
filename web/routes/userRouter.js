require('dotenv').config({ path: '.env' });
const express = require('express');
const router = express.Router();
const axios = require('axios');
const querystring = require('querystring');
const KAKAO_APP_KEY = process.env.KAKAO_APP_KEY;
const REDIRECT_URI = process.env.REDIRECT_URI;

// 카카오 로그인 페이지로 이동
router.get('/login', (req, res) => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_APP_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  res.redirect(kakaoAuthURL);
});

// 카카오 OAuth 콜백 처리
router.get('/oauth', async (req, res) => {
  const code = req.query.code;
  try {
    // 액세스 토큰 요청
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        client_id: KAKAO_APP_KEY,
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;

    // 사용자 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const kakaoId = userResponse.data.id;
    const nickname = userResponse.data.properties.nickname;

    // 사용자 정보 DB에 저장 또는 업데이트 (DB 연동 필요)
    let user = await userModel.findOne({ where: { kakaoId } });
    if (!user) {
      user = await userModel.create({ kakaoId, nickname });
    }

    // 세션에 사용자 정보 저장
    req.session.userId = user.id;

    res.redirect('/'); // 메인 페이지로 이동
  } catch (error) {
    console.error('Error during Kakao login:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// 로그인 여부 확인 미들웨어
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/user/login');
  }
}

// 로그인 후 페이지 (예시)
router.get('/mypage', isLoggedIn, (req, res) => {
  // 사용자 정보를 가져와서 페이지 렌더링
  res.render('mypage', { user: req.session.user });
});

module.exports = router;

