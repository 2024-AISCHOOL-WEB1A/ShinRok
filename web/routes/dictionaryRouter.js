// routes/dictionary.js

const express = require('express');
const router = express.Router();
const conn = require('../config/db'); // 데이터베이스 연결 설정 파일

// /dictionary 엔드포인트에 대한 GET 요청 처리
router.get('/home', (req, res) => {
    console.log("식물도감");
    
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 12; // 페이지당 표시할 항목 수
    const offset = (page - 1) * itemsPerPage;

    // 전체 항목 수를 가져오는 쿼리
    const countSql = 'SELECT COUNT(*) as total FROM SR_PLANT';
    
    // 페이지에 해당하는 항목을 가져오는 쿼리
    const sql = 'SELECT * FROM SR_PLANT LIMIT ? OFFSET ?';

    conn.query(countSql, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).send('서버 오류');
        }

        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        conn.query(sql, [itemsPerPage, offset], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('서버 오류');
            }

            res.render('dictionary', {
                specificPlant: results,
                current_page: page,
                total_pages: totalPages
            });
        });
    });
});


router.get('/detail', async (req, res) => {

});

module.exports = router;