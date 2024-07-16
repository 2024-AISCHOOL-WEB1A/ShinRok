const express = require('express')
const app = express()
const path = require('path')
const nunjucks = require('nunjucks')
const PORT = process.env.PORT || 3000;

// 라우터 설정
const mainRouter = require('./routes/mainRouter')
const userRouter = require('./routes/userRouter')
const boardRouter = require('./routes/boardRouter')

// body-parser 미들웨어 설정(POST허용)
app.use(express.urlencoded({extended:true}))
// app.use(bodyParser.json())

// 메인라우터 설정
app.use('/', mainRouter)

// 넌적스 세팅
app.set('view engine', 'html')
nunjucks.configure('views', {
    express : app, 
    watch : true
})


// 라우터 설정
app.use('/user', userRouter)
app.use('/board', boardRouter)

    
// 서버 시작
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})