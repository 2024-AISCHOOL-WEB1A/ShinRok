const express = require('express')
const router = express.Router()
const conn = require('../config/db')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const uploadImage = require('../config/uploadImage'); // S3 업로드 함수
const fs = require('fs');

// 게시판 관련 기능

// 게시글 작성 기능
router.post('/upload', upload.single('image'), async (req, res) => {
    const { title, content, category, idx } = req.body;
    const filePath = req.file.path;

    try {
        const imageUrl = await uploadImage(filePath, 'board'); // 폴더명을 'board'로 지정

        // 데이터베이스에 게시물 정보와 이미지 URL 저장
        const sql = `INSERT INTO SR_BOARD (USER_IDX, BOARD_TITLE, BOARD_CONTENT, BOARD_COUNT, BOARD_IMG) 
                    VALUES (?, ?, ?, ?, ?)`;
        const values = [idx, title, content, category, imageUrl];
        conn.query(sql, values, (err, result) => {
            if (err) {
                console.error('DB Insert Error: ', err);
                return res.status(500).json({ error: 'DB Insert Error' });
            }
            console.log('게시글 작성 완료')
            res.redirect('/');
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        // 임시 파일 삭제
        fs.unlinkSync(filePath);
    }
});

// 메인페이지에 자유게시판을 불러옴
router.get('/freePost',(req,res)=> {
    
    const sql = `SELECT * FROM SR_BOARD WHERE BOARD_CATE = 1`
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



module.exports = router