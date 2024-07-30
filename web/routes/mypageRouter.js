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
            
    const userId = req.session.user.idx;

    const usersql = `
        SELECT 
            USER_NAME, USER_NICK, SNS_PROVIDER, USER_PICTURE
        FROM 
            SR_USER
        WHERE 
            USER_IDX = ?               
    `;
    conn.query(usersql, [userId], (err, userRows) => {
        if (err) {
            console.error('데이터베이스 유저 쿼리 오류:', err);
            return res.status(500).json({ error: '데이터베이스 유저쿼리 오류' });
        }
        if (userRows.length === 0) {
            return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
        }
        console.log('userRows',userRows);
        
        const boardSql = `
            SELECT 
                B.BOARD_IDX, B.BOARD_TITLE, B.BOARD_DATE, B.BOARD_CATE,
                B.BOARD_COUNT,
                COUNT(C.CMNT_IDX) AS COMMENT_COUNT
            FROM 
                SR_BOARD B
            LEFT JOIN SR_CMNT C ON B.BOARD_IDX = C.BOARD_IDX
            WHERE 
                B.USER_IDX = ?
            GROUP BY 
                B.BOARD_IDX, B.BOARD_TITLE, B.BOARD_DATE, B.BOARD_CATE, B.BOARD_COUNT
            ORDER BY B.BOARD_DATE DESC
            LIMIT 10
        `;
        conn.query(boardSql, [userId], (err, boardRows) => {
            if (err) {
                console.error('데이터베이스 보드 쿼리 오류:', err);
                return res.status(500).json({ error: '데이터베이스 보드 쿼리 오류' });
            }
            console.log('boardRows',boardRows);

            res.render('myPage', {
                userData: userRows[0],  // 첫 번째 결과만 전달
                boardData: boardRows || []
            });
        });
        
    }); // 여기에 닫는 괄호 추가

}); // 이 닫는 괄호가 추가되어야 합니다.

// 회원 수정 기능 router
router.post('/update',(req,res)=>{
   
    const userId = req.session.user.idx;

    let sql = `UPDATE SR_USER SET USER_NICK = ? 
                WHERE USER_IDX=?`
    conn.query(sql, [userId], (err, rows)=> {
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
router.post('/delete', (req, res) => {
    console.log('delete', req.session.user.idx);
    const userId = req.session.user.idx;

    conn.beginTransaction((err) => {
        if (err) {
            console.error('트랜잭션 시작 오류:', err);
            return res.status(500).json({ error: '서버 오류' });
        }

        // 사용자 관련 데이터 삭제 또는 익명화
        const updateUserSql = 'UPDATE SR_USER SET USER_NAME = "탈퇴회원", USER_NICK = "탈퇴회원",AUTH_ID=0, USER_PICTURE = NULL, USER_STATUS = STOP, WHERE USER_IDX = ?';
        conn.query(updateUserSql, [userId], (err, result) => {
            if (err) {
                return conn.rollback(() => {
                    console.error('사용자 정보 업데이트 오류:', err);
                    res.status(500).json({ error: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
                });
            }

            // 트랜잭션 커밋
            conn.commit((err) => {
                if (err) {
                    return conn.rollback(() => {
                        console.error('커밋 오류:', err);
                        res.status(500).json({ error: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
                    });
                }

                // 세션 삭제
                req.session.destroy((err) => {
                    if (err) {
                        console.error('세션 삭제 오류:', err);
                    }
                    res.redirect('/');
                });
            });
        });
    });
});

router.post('/predict')

module.exports = router;