const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
require('dotenv').config();
const moment = require('moment');
const app = express();
const PORT = process.env.PORT || 3000;

// 라우터 설정
const mainRouter = require('./routes/mainRouter');
const userRouter = require('./routes/userRouter');
const boardRouter = require('./routes/boardRouter');
const diaryRouter = require('./routes/diaryRouter');
const dictionaryRouter = require('./routes/dictionaryRouter');
const predictRouter = require('./routes/predictRouter')
const searchRouter = require('./routes/searchRouter')
const mypageRouter = require('./routes/mypageRouter');

app.use('/public', express.static('public'));
app.use('/config', express.static('config'));
app.use('/images', express.static('images'));
app.use('/assets', express.static('assets'));


// 세션 미들웨어
app.use(session({
    store: new FileStore({ path: path.join(__dirname, 'sessions') }),
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 36000000 }, // 1000 = 1 sec, 60000 = 1 min
    rolling: true, // 로그인 상태 유지
    touch: false, // 로그아웃 시 세션 파일 갱신 방지
}));

// 넌적스 세팅
app.set('view engine', 'html');
const env = nunjucks.configure('views', {
    express: app,
    watch: true
});

// 날짜 필터 추가
env.addFilter('date', (date, format) => {
  return moment(date).format(format);
});

// 줄바꿈 필터 추가
env.addFilter('nl2br', function(str) {
    return str.replace(/\r\n|\n\r|\r|\n/g, '<br>');
  })

// body-parser 미들웨어 설정(POST 허용)
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// 정적 파일 제공
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/config', express.static(path.join(__dirname, 'config')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 라우터 설정
app.use('/', mainRouter);
app.use('/user', userRouter);
app.use('/board', boardRouter);
app.use('/diary', diaryRouter);
app.use('/dictionary', dictionaryRouter);
app.use('/predict', predictRouter);
app.use('/search', searchRouter);
app.use('/myPage', mypageRouter);
// 에러 핸들링 미들웨어 추가
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
