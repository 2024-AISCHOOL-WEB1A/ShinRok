const express = require('express');
const router = express.Router();
const conn = require('../config/db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const uploadImage = require('../config/uploadImage'); // S3 업로드 함수
const fs = require('fs');
const { log } = require('console');

// 다이어리 작성 기능
router.post('/submit', upload.single('image'), async (req, res)=>{
    // 내용 가져오기
    const { idx, query, modalText, title, content, file } = req.body;
    console.log(req.body);
    let imageUrl = null;
    //  파일이 있다면 경로를 저장하고, 아니면 null
    const filePath = req.file ? req.file.path : null
    
    try{
        // 파일 경로가 있다면 imageUrl에 'diary'파일의 경로가 저장될때까지 대기 
        if(filePath){
            imageUrl = await uploadImage(filePath, 'diary');
        }

        // DB에 다이어리 정보와 이미지 URL 저장
        const sql = `INSERT INTO SR_DIARY (USER_IDX, DIARY_NAME, DIARY_DATE, DIARY_TITLE, DIARY_CONTENT, DIARY_IMG)
                    VALUES (?, ?, ?, ?, ?, ?)`
        const values = [idx, query, modalText, title, content, imageUrl]
        conn.query(sql, values, (err, result)=>{
            if(err) {
                console.error('DB Insert Error: ', err);
                return res.status(500).json({error: 'DB Insert Error'})
            }
            console.log('게시글 작성 완료');
            res.redirect('/diary')
        })
    } catch (err){
        res.status(500).json({error: err.message})
    } finally{
        if (filePath){
            fs.unlinkSync(filePath)
        }
    }
})

module.exports = router