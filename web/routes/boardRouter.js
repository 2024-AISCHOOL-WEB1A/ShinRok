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
    let imageUrl = null;
    const filePath = req.file ? req.file.path : null

    try {
        if (filePath) {
            imageUrl = await uploadImage(filePath, 'board'); // 폴더명을 'board'로 지정
        }

        // 데이터베이스에 게시물 정보와 이미지 URL 저장
        const sql = `INSERT INTO SR_BOARD (USER_IDX, BOARD_TITLE, BOARD_CONTENT, BOARD_CATE, BOARD_IMG) 
                    VALUES (?, ?, ?, ?, ?)`
        const values = [idx, title, content, category, imageUrl]
        conn.query(sql, values, (err, result) => {
            if (err) {
                console.error('DB Insert Error: ', err);
                return res.status(500).json({ error: 'DB Insert Error' })
            }
            console.log('게시글 작성 완료')
            res.redirect('/')
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    } finally {
        // 임시 파일 삭제
        if (filePath) {
            fs.unlinkSync(filePath)
        }
    }
})


// 메인페이지에 자유게시판을 불러옴
router.get('/freePost',(req,res)=> {
    
    const sql = `SELECT 
                    U.USER_IDX,
                    U.USER_NICK,
                    U.USER_PICTURE,
                    B.BOARD_IDX,
                    B.BOARD_TITLE,
                    B.BOARD_CONTENT,
                    B.BOARD_COUNT,
                    B.BOARD_DATE,
                    B.BOARD_IMG,
                    B.BOARD_CATE,
                    COUNT(C.CMNT_CONTENT) AS COMMENT_COUNT
                 FROM 
                    SR_USER U
                    JOIN SR_BOARD B ON U.USER_IDX = B.USER_IDX
                    LEFT JOIN SR_CMNT C ON B.BOARD_IDX = C.BOARD_IDX
                WHERE 
                    B.BOARD_CATE = '자유'
                GROUP BY 
                    B.BOARD_IDX, 
                    U.USER_IDX, 
                    U.USER_NICK, 
                    U.USER_PICTURE, 
                    B.BOARD_TITLE, 
                    B.BOARD_CONTENT, 
                    B.BOARD_COUNT, 
                    B.BOARD_DATE, 
                    B.BOARD_IMG`
    conn.query(sql, (e, r) => {
        console.log(r)
        res.render('freePost', {boardFree : r})
    })
})

// 메인페이지에 자랑게시판을 불러옴
router.get('/bragPost',(req,res)=> {
    const sql = `SELECT 
                    U.USER_IDX,
                    U.USER_NICK,
                    U.USER_PICTURE,
                    B.BOARD_IDX,
                    B.BOARD_TITLE,
                    B.BOARD_CONTENT,
                    B.BOARD_COUNT,
                    B.BOARD_DATE,
                    B.BOARD_IMG,
                    B.BOARD_CATE,
                    COUNT(C.CMNT_CONTENT) AS COMMENT_COUNT
                FROM 
                    SR_USER U
                    JOIN SR_BOARD B ON U.USER_IDX = B.USER_IDX
                    LEFT JOIN SR_CMNT C ON B.BOARD_IDX = C.BOARD_IDX
                WHERE 
                    B.BOARD_CATE = '자랑'
                GROUP BY 
                    B.BOARD_IDX, 
                    U.USER_IDX, 
                    U.USER_NICK, 
                    U.USER_PICTURE, 
                    B.BOARD_TITLE, 
                    B.BOARD_CONTENT, 
                    B.BOARD_COUNT, 
                    B.BOARD_DATE, 
                    B.BOARD_IMG`

    conn.query(sql, (e, r) => {
        console.log(r)
        res.render('bragPost', {bragePost : r})
    })
})

// // 질문 게시판
// router.get('', (req, res) => {
//     const sql = `SELECT 
//                     U.USER_IDX,
//                     U.USER_NICK,
//                     U.USER_PICTURE,
//                     B.BOARD_IDX,
//                     B.BOARD_TITLE,
//                     B.BOARD_CONTENT,
//                     B.BOARD_COUNT,
//                     B.BOARD_DATE,
//                     B.BOARD_IMG,
//                     B.BOARD_CATE,
//                     COUNT(C.CMNT_CONTENT) AS COMMENT_COUNT
//                 FROM 
//                     SR_USER U
//                     JOIN SR_BOARD B ON U.USER_IDX = B.USER_IDX
//                     LEFT JOIN SR_CMNT C ON B.BOARD_IDX = C.BOARD_IDX
//                 WHERE 
//                     B.BOARD_CATE = '질문'
//                 GROUP BY 
//                     B.BOARD_IDX, 
//                     U.USER_IDX, 
//                     U.USER_NICK, 
//                     U.USER_PICTURE, 
//                     B.BOARD_TITLE, 
//                     B.BOARD_CONTENT, 
//                     B.BOARD_COUNT, 
//                     B.BOARD_DATE, 
//                     B.BOARD_IMG`

//     conn.query(sql, (e, r) => {
//         console.log(r)
//         res.render('', { : r})
//     })
// })

module.exports = router