const { log } = require('console')
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

// 사전 페이지 이동
router.get('/dictionary', (req, res)=>{
    res.render('dictionary', {user: req.session.user})
})

// 자랑게시판 List로 이동
router.get('/bragList', (req, res)=>{
    res.render('bragList', {user: req.session.user})
})


// 병충해 진단 페이지
router.get('/predict', (req, res) => {
    res.render('predict', {user: req.session.user})
})

// 사전 세부 페이지로 이동
router.get('/dictDetail', (req, res)=>{
    res.render('dictDetail', {user: req.session.user})
})

// 수정 페이지로 이동
router.get('/changePost', (req,res)=> {
    log("test")
    res.render('changePost', {user: req.session.user})
})

module.exports = router