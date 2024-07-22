const express = require('express')
const router = express.Router()
const conn = require('../config/db')

// // 회원 관련 기능


router.get('/login',(req,res)=> {
    res.render('login')
})



module.exports = router;