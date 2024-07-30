const express = require('express');
const router = express.Router();
const conn = require('../config/db'); // 데이터베이스 연결 설정 파일

// 회원 정보 보기 기능 router
router.post('/info', (req, res) => {
    // 사용자 인증 확인
    console.log('요청 바디:', req.session.user.idx);
    if (!req.session.user) {
        return res.status(401).json({ error: '세션이 존재하지 않습니다.' });
    }
        
      
    const {userId} = req.session.user.idx;


    const sql = `
        SELECT 
            U.USER_NAME, U.USER_NICK, U.SNS_PROVIDER, U.USER_PICTURE,
            B.BOARD_TITLE, B.BOARD_CONTENT, B.BOARD_DATE, B.BOARD_CATE,
            D.DSS_PLANT, D.DSS_DATE, D.DSS_RES, D.DSS_PREV, D.DSS_DISC
        FROM 
            SR_USER U
        JOIN 
            SR_BOARD B ON U.USER_IDX = B.USER_IDX
        JOIN 
            SR_DSS D ON B.USER_IDX = D.USER_IDX
        WHERE 
            U.USER_IDX = ?               
    `;

    conn.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error('데이터베이스 쿼리 오류:', err);
            return res.status(500).json({ error: '데이터베이스 쿼리 오류' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
        }
        console.log(rows);
        res.render('myPage', {
            myData: rows[0]  // 첫 번째 결과만 전달
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