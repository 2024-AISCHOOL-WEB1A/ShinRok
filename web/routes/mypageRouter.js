const express = require('express');
const router = express.Router();
const conn = require('../config/db'); // 데이터베이스 연결 설정 파일


// 회원 정보 보기 기능 router
router.post('/info', (req, res) => {
    console.log('myPage', req.body);
    const { userId, boardId, dssId } = req.body;

    const sql = `
        SELECT 
            U.USER_NAME, U.USER_NIC, U.SNS_PROVIDER, U.USER_PICTURE,
            B.BOARD_TITLE, B.BOARD_CONTENT, B.BOARD_DATE, B.BOARD_CATE,
            D.DSS_PLANT, D.DSS_DATE, D.DSS_RES, D.DSS_PREV, D.DSS_DISC
        FROM 
            SR_USER U
        JOIN 
            SR_BOARD B ON U.USER_IDX = B.USER_IDX
        JOIN 
            SR_DSS D ON B.BOARD_IDX = D.BOARD_IDX
        WHERE 
            U.USER_IDX = ? AND B.BOARD_IDX = ? AND D.DSS_IDX = ?
    `;

    conn.query(sql, [userId, boardId, dssId], (err, rows) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        console.log(rows);
        res.render('myPage', {
            myData: rows[0]
        });
    });
});




// 회원 수정 기능 router
router.post('/dkanrjsk',(req,res)=>{
    console.log('changeNick', req.body)
    let { user_nick, user_idx} = req.body;

    let sql = `UPDATE SR_USER SET USER_NICK = ? 
                WHERE USER_IDX=?`
    conn.query(sql, [user_nick, user_idx], (err, rows)=> {
        if(rows.affectedRows > 0){
            // 수정 성공시 새로고침
            res.render('myPage',{
                mypage:rows
            })
        } else{
            // 수정 실패 시
            res.send('<script>alert("다시 한번 시도해주세요.")</script>')
        }
    })
})

// 회원 삭제 기능 router
router.post('/dekfmrpS',(req,res)=>{
    console.log('delete', req.body)
    let {idx} = req.body

    let sql = 'DELETE FROM SR_USER WHERE USER_IDX=?'
    conn.query(sql,[user_idx],(err, rows)=>{
        if(rows.affectedRows > 0){
            // 삭제 성공시 메인으로 이동
            res.redirect('/')
        } else{
            // 삭제 실패 시
            res.send('<script>alert("회원 탈퇴에 실패하셨습니다. 앞으로 잘부탁드립니다~")</script>')
        }
    })

})

module.exports = router;