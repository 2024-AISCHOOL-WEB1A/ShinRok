const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');
const session = require('express-session');
const fileStore = require('session-file-store')(session);
require('dotenv').config();

const mainRouter = require('./routes/mainRouter');
const userRouter = require('./routes/userRouter');
const boardRouter = require('./routes/boardRouter');

const app = express();
const PORT = process.env.PORT || 3000;


// 세션 미들웨어
app.use(session({
    httpOnly: true, 
    resave: false, 
    secret: 'secret', 
    store: new fileStore(), 
    saveUninitialized: false,
    cookie : { maxAge : 1000} // 1000 = 1 sec, 60000 = 1min
}));

// 넌적스 세팅
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app, 
    watch: true
});

// body-parser 미들웨어 설정(POST허용)
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/config', express.static(path.join(__dirname, 'config')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 라우터 설정
app.use('/', mainRouter);
app.use('/user', userRouter);
app.use('/board', boardRouter);

// 에러 핸들링 미들웨어 추가
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
