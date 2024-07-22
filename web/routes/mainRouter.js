const express = require('express')
const router = express.Router()
const path = require('path')
const file_Path = path.join(__dirname, "") 

// 페이지 이동 관련 기능

// 메인
router.get('/', (req,res) => {
    res.render('main')
})

// 메인페이지에 자유게시판을 불러옴
router.get('/freePost',(req,res)=> {
    res.render('freePost')
})

// 메인페이지에 자랑게시판을 불러옴
router.get('/bragPost',(req,res)=> {
    res.render('bragPost')
})

module.exports = router