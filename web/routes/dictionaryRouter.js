// routes/dictionary.js

const express = require('express');
const router = express.Router();
const conn = require('../config/db'); // 데이터베이스 연결 설정 파일

// /dictionary 엔드포인트에 대한 GET 요청 처리
router.get('/home', (req, res) => {

    console.log("식물도감")
        // 데이터베이스에서 식물 정보를 가져오는 로직을 작성     
        const sql = 'SELECT * FROM SR_PLANT'
        // 가져온 데이터를 프론트엔드에 전달
        conn.query(sql, (e, r) => {
            // console.log(r)
            res.render('dictionary', {specificPlant : r})
        })
});


router.get('/detail', async (req, res) => {
    try {
        // 데이터베이스에서 식물 정보를 가져오는 로직을 작성
        // 예시: const plants = await conn.query('SELECT * FROM SR_PLANT');
        const plants = await conn.query('select * from SR_PLANT');
        // 가져온 데이터를 프론트엔드에 전달
        res.render('dictionary', { plants }); // 예시: dictionary.ejs 파일에 데이터 전달
    } catch (error) {
        console.error('Error fetching plant data:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;