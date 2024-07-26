const express = require('express')
const router = express.Router()
const conn = require('../config/db')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const uploadImage = require('../config/uploadImage') // S3 업로드 함수
const fs = require('fs')

// 모델 예측
router.post('/start', upload.single('image'), async (req, res) => {
    const {idx, plant}= req.body
    let imageUrl = null
    const filePath = req.file ? req.file : null

    try {
        if(filePath) {
            imageUrl = await uploadImage(filePath, 'predict')
        }
        const sql = `INSERT INTO SR_DSS (USER_IDX, DSS_PLANT, DSS_IMG)
                    VALUES (?, ?, ?)`
        const  values = [idx, plant, imageUrl]
        conn.query(sql, values, (e, r) => {
            if(e) {
                console.log("에러 : ", e)
                return res.status(500).json({e : 'DB에러'})
            }
            console.log('예측 요청 처리')
        })    

    } catch (e) {
        res.status(500).json({error : e.message})
    } finally {
        if(filePath) {
            fs.unlinkSync(filePath)
        }
    }   
})

module.exports = router