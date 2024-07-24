const express = require('express')
const router = express.Router()
const path = require('path')
const file_Path = path.join(__dirname, "") 

// 페이지 이동 관련 기능

// 메인
router.get('/', (req,res) => {
    res.render('main', { userId: req.session.userId });
    
})


module.exports = router