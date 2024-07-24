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
router.get('/oauth', async (req, res, next) => {
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
    const profileImage = userResponse.data.properties.profile_image;

    // 사용자 정보를 데이터베이스에 저장
    const db = require('../config/db'); // db 모듈을 불러옵니다.

    // 기존 사용자 조회 쿼리
    const findUserQuery = 'SELECT * FROM SR_USER WHERE AUTH_ID = ?';
    db.query(findUserQuery, [kakaoId], (error, results) => {
      if (error) {
        console.error('Error finding user in database:', error);
        return next(error);
      }

      if (results.length > 0) {
        // 사용자가 이미 존재함
        console.log('User already exists:', results[0]);
      } else {
        // 사용자가 존재하지 않음, 새 사용자 추가
        const insertUserQuery = `
          INSERT INTO SR_USER (USER_NICK, USER_NAME, AUTH_ID, SNS_PROVIDER, USER_PICTURE)
          VALUES (?, ?, ?, 'kakao', ?)
          ON DUPLICATE KEY UPDATE
          USER_NICK = VALUES(USER_NICK),
          USER_PICTURE = VALUES(USER_PICTURE)
        `;
        db.query(insertUserQuery, [nickname, nickname, kakaoId, profileImage], (error, results) => {
          if (error) {
            console.error('Error inserting user into database:', error);
            return next(error);
          }
        });
      }

      // 세션에 사용자 ID 및 액세스 토큰 저장
      req.session.userId = kakaoId;
      req.session.accessToken = accessToken;

      res.redirect('/'); // 메인 페이지로 이동
    });

  } catch (error) {
    console.error('Error during Kakao login:', error);
    next(error);  // 에러 핸들링 미들웨어로 전달
  }
});

// 로그아웃
router.get('/logout', async (req, res, next) => {
  try {
    // 카카오 로그아웃 요청
    if (req.session.accessToken) {
      await axios.post(
        'https://kapi.kakao.com/v1/user/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${req.session.accessToken}`, // 액세스 토큰 사용
          },
        }
      );
    }

    // 세션 파기
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return next(err);
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error during Kakao logout:', error);
    next(error);
  }
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
  res.render('mypage', { userId: req.session.user }); // 실제 사용자 정보를 가져오는 로직 필요
});

module.exports = router;
