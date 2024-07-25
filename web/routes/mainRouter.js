const express = require('express')
const router = express.Router()
const path = require('path')
const file_Path = path.join(__dirname, "") 

// 페이지 이동 관련 기능

// 메인
router.get('/', (req,res) => {
    if(req.session){
        console.log(req.session.user)
        res.render('main', {user : req.session.user})
    } else {
        res.render('main')
    }
})

// 글쓰기 페이지 이동
router.get('/plusPost', (req, res) => {
    res.render('plusPost',  { user: req.session.user })
 })
 
// 다이어리 페이지 이동
router.get('/diary', (req, res) => {
    res.render('diary', {user: req.session.user})
})



module.exports = router