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
        console.log('userRows', userRows);
        
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
            console.log('boardRows', boardRows);

            const dssSql = `
                SELECT * FROM SR_DSS WHERE USER_IDX = ?
                        ORDER BY DSS_DATE DESC`
            conn.query(dssSql, [userId], (err, dssRows) => {
                if (err) {
                    console.error('데이터베이스 DSS 쿼리 오류:', err);
                    return res.status(500).json({ error: '데이터베이스 DSS 쿼리 오류' });
                }
                console.log('dssRows', dssRows);

                res.render('myPage', {
                    userData: userRows[0],  // 첫 번째 결과만 전달
                    boardData: boardRows || [],
                    dssData: dssRows || []
                });
            });
        });
    });
});


// 회원 수정 기능 router
router.post('/update', (req, res) => {
    const userId = req.session.user.idx;
    const newNickname = req.body.q;

    let sql = `UPDATE SR_USER SET USER_NICK = ? WHERE USER_IDX = ?`;
    
    conn.query(sql, [newNickname, userId], (err, result) => {
        if (err) {
            console.error('닉네임 업데이트 오류:', err);
            return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
        }
        
        if (result.affectedRows > 0) {
            // 수정 성공
            req.session.user.nick = newNickname; // 세션 업데이트
            res.json({ success: true, newNicㅐkname: newNickname });
        } else {
            // 수정 실패
            res.status(400).json({ success: false, message: '닉네임 업데이트에 실패했습니다.' });
        }
    });
});

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