const express = require('express')
const router = express.Router()
const conn = require('../config/db')
const s3 = require('../config/aws')

// 게시판 관련 기능

// 게시글 작성 기능
router.post('/plusPost', (req, res) => {
    let { nick, title, } = req.body
})



// 메인페이지에 자유게시판을 불러옴
router.get('/freePost',(req,res)=> {
    
    let sql = `SELECT * FROM SR_BOARD WHERE BOARD_CATE = 1`
    conn.query(sql, (e, r) => {
        console.log(r)
        res.render('freePost', {boardFree : r})
    })

})

// 메인페이지에 자랑게시판을 불러옴
router.get('/bragPost',(req,res)=> {
    res.render('bragPost')
})
// 게시판 검색기능 

router.get

module.exports = router