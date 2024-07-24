const express = require('express')
const router = express.Router()
const path = require('path')
const file_Path = path.join(__dirname, "") 

// 페이지 이동 관련 기능

// 메인
router.get('/', (req,res) => {
    res.render('main', { userId: req.session.userId });
    
})

// 글쓰기 페이지 이동
router.get('/plusPost', (req, res) => {
    res.render('plusPost')
 })
 


module.exports = router