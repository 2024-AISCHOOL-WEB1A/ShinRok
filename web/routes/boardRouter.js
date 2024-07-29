const express = require('express')
const router = express.Router()
const conn = require('../config/db')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const uploadImage = require('../config/uploadImage') // S3 업로드 함수
const fs = require('fs')
const { log } = require('console')

// 게시판 관련 기능


// 게시글 작성 기능
router.post('/upload', upload.single('image'), async (req, res) => {
    const { title, content, category, idx } = req.body
    let imageUrl = null
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
router.get('/freePost', (req, res) => {
    const page = parseInt(req.query.page) || 1; // 현재 페이지 번호 (기본값: 1)
    const limit = 15; // 페이지 당 게시글 수
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) AS total FROM SR_BOARD WHERE BOARD_CATE = '자유'`;
    const dataSql = `SELECT 
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
                        B.BOARD_IMG
                    ORDER BY B.BOARD_DATE DESC
                    LIMIT ?, ?`;

    conn.query(countSql, (err, countResult) => {
        if (err) {
            console.error('DB Count Error: ', err);
            return res.status(500).json({ error: 'DB Count Error' });
        }
        
        const totalPosts = countResult[0].total;
        const totalPages = Math.ceil(totalPosts / limit);

        conn.query(dataSql, [offset, limit], (err, dataResult) => {
            if (err) {
                console.error('DB Query Error: ', err);
                return res.status(500).json({ error: 'DB Query Error' });
            }
            res.render('freePost', { boardFree: dataResult, currentPage: page, totalPages: totalPages, user: req.session.user });
        });
    });
});

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
                    B.BOARD_IMG
                ORDER BY B.BOARD_DATE DESC
                    `

    conn.query(sql, (e, r) => {
        console.log(r)
        res.render('bragPost', {bragPost : r, user: req.session.user})
    })
})

// 세부 목록페이지 (+그림포함, 사이드바 통해서)
router.get('/bragList',(req,res)=> {
    const page = parseInt(req.query.page) || 1; // 현재 페이지 번호 (기본값: 1)
    const limit = 15; // 페이지 당 게시글 수
    const offset = (page - 1) * limit;
    
    const countSql = `SELECT COUNT(*) AS total FROM SR_BOARD WHERE BOARD_CATE = '자랑'`;
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

    conn.query(countSql, (err, countResult) => {
        if (err) {
            console.error('DB Count Error: ', err);
            return res.status(500).json({ error: 'DB Count Error' });
        }
        
        const totalPosts = countResult[0].total;
        const totalPages = Math.ceil(totalPosts / limit);

        conn.query(sql, [offset, limit], (err, dataResult) => {
            if (err) {
                console.error('DB Query Error: ', err);
                return res.status(500).json({ error: 'DB Query Error' });
            }
        res.render('bragList', {bragList : dataResult, currentPage: page, totalPages: totalPages})
        })
    })
})

router.get('/bragdetailPost',(req,res)=> {
    const postId = req.query.idx

    // 세션에 조회한 게시글 ID 저장
    if (!req.session.viewedPosts) {
        req.session.viewedPosts = {}
    }

    if (!req.session.viewedPosts[postId]) {
        req.session.viewedPosts[postId] = true;

        const updateCountSql = `UPDATE SR_BOARD SET BOARD_COUNT = BOARD_COUNT + 1 WHERE BOARD_IDX = ?`

        conn.query(updateCountSql, [postId], (err, result) => {
            if (err) {
                console.error('DB Update Error: ', err)
                return res.status(500).json({ error: 'DB Update Error' })
            }

            getPost(postId, req, res)
        })
    } else {
        getPost(postId, req, res)
    }
});

function getPost(postId, req, res) {
    const postSql = `SELECT 
                        U.USER_IDX,
                        U.USER_NICK,
                        U.USER_PICTURE,
                        B.BOARD_IDX,
                        B.BOARD_TITLE,
                        B.BOARD_CONTENT,
                        B.BOARD_COUNT,
                        B.BOARD_DATE,
                        B.BOARD_IMG,
                        B.BOARD_CATE
                    FROM 
                        SR_USER U
                        JOIN SR_BOARD B ON U.USER_IDX = B.USER_IDX
                    WHERE 
                        B.BOARD_IDX = ?`

    conn.query(postSql, [postId], (err, postResult) => {
        if (err) {
            console.error('DB Query Error: ', err)
            return res.status(500).json({ error: 'DB Query Error' })
        }
        if (postResult.length === 0) {
            return res.status(404).json({ error: 'Post not found' })
        }

        const post = postResult[0]
        res.render('bragdetailPost', { post: post, user: req.session.user })
    })
}
//d
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

// 게시글 상세보기 페이지
router.get('/detailPost', (req, res) => {
    const postId = req.query.idx

    // 세션에 조회한 게시글 ID 저장
    if (!req.session.viewedPosts) {
        req.session.viewedPosts = {}
    }

    if (!req.session.viewedPosts[postId]) {
        req.session.viewedPosts[postId] = true;

        const updateCountSql = `UPDATE SR_BOARD SET BOARD_COUNT = BOARD_COUNT + 1 WHERE BOARD_IDX = ?`

        conn.query(updateCountSql, [postId], (err, result) => {
            if (err) {
                console.error('DB Update Error: ', err)
                return res.status(500).json({ error: 'DB Update Error' })
            }

            getPost(postId, req, res)
        })
    } else {
        getPost(postId, req, res)
    }
});

function getPost(postId, req, res) {
    const postSql = `SELECT 
                        U.USER_IDX,
                        U.USER_NICK,
                        U.USER_PICTURE,
                        B.BOARD_IDX,
                        B.BOARD_TITLE,
                        B.BOARD_CONTENT,
                        B.BOARD_COUNT,
                        B.BOARD_DATE,
                        B.BOARD_IMG,
                        B.BOARD_CATE
                    FROM 
                        SR_USER U
                        JOIN SR_BOARD B ON U.USER_IDX = B.USER_IDX
                    WHERE 
                        B.BOARD_IDX = ?`

    conn.query(postSql, [postId], (err, postResult) => {
        if (err) {
            console.error('DB Query Error: ', err)
            return res.status(500).json({ error: 'DB Query Error' })
        }
        if (postResult.length === 0) {
            return res.status(404).json({ error: 'Post not found' })
        }
        const post = postResult[0]
        // log(post)
        res.render('detailPost', { post: post, user: req.session.user })
    })
}


// 댓글 목록 조회
router.get('/comments', (req, res) => {
    const { board_idx } = req.query;
    console.log(req.session.user);
    
    // 댓글 목록 조회
    const commentsSql = `SELECT 
                            C.CMNT_IDX,
                            C.CMNT_CONTENT,
                            C.CMNT_DATE,
                            U.USER_NICK,
                            U.USER_PICTURE
                        FROM 
                            SR_CMNT C
                            JOIN SR_USER U ON C.USER_IDX = U.USER_IDX
                        WHERE 
                            C.BOARD_IDX = ?
                        ORDER BY C.CMNT_DATE ASC`;

    // 댓글 수 조회 
    const countSql = `SELECT COUNT(*) AS COMMENT_COUNT FROM SR_CMNT WHERE BOARD_IDX = ?`;

    // 댓글 목록 조회
    conn.query(commentsSql, [board_idx], (err, commentsResult) => {
        if (err) {
            console.error('DB Query Error: ', err);
            return res.status(500).json({ error: 'DB Query Error' });
        }

        // 댓글 수 조회
        conn.query(countSql, [board_idx], (countErr, countResult) => {
            if (countErr) {
                console.error('Count Query Error: ', countErr);
                return res.status(500).json({ error: 'Count Query Error' });
            }
           
            res.json({ success: true, comments: commentsResult, commentCount: countResult[0].COMMENT_COUNT, user: req.session.user });
        });
    });
});


// 댓글기능
router.post('/cmnt', (req, res) => {
    let { user_idx, board_idx, content } = req.body
    console.log(req.body)
    if (!user_idx || !board_idx || !content) {
        return res.json({ success: false, message: '댓글을 작성 해주세요.' })
    }

    const sql = `INSERT INTO SR_CMNT (BOARD_IDX, USER_IDX, CMNT_CONTENT) VALUES (?, ?, ?)`
    
    conn.query(sql, [board_idx, user_idx, content], (err, rows) => {
        if (err) {
            console.error('Insert Error: ', err)
            return res.json({ success: false, message: '댓글 삽입에 실패했습니다.' })
        }


        if(err) {
            res.send(`<script>alert('댓글 삽입에 실패했습니다.'); </script>`)
        }
        
        // 삽입 성공
        res.json({ success: true, message: '댓글이 성공적으로 등록되었습니다.', board_idx: board_idx })

    })
})


// 수정 페이지로 이동
router.get('/changePost', (req, res) => {
    const board_idx = req.query.board_idx
    // console.log(board_idx)
    const sql = `SELECT * FROM SR_BOARD WHERE BOARD_IDX = ?`
    
    conn.query(sql, [board_idx], (e, r) => {
        if(e) {
            console.log('DB에러 : ' + e)
            return res.status(500).json({error : 'DB 쿼리에러'})
        } else if (r.length === 0) {
            return res.status(404).json({errer : "페이지 없음"})
        } else {
            const post = r[0]
            // console.log(r)
            res.render('changePost', {post : post, user: req.session.user})
        }
    })
})

// 게시글 수정 기능
router.post('/change', (req, res) => {
    const {title, category, content, board_idx} = req.body
    // log(req.body)
    const sql = `UPDATE SR_BOARD SET BOARD_CONTENT = ? WHERE BOARD_IDX = ? `
    
    conn.query(sql, [content, board_idx], (e, r) => {
        if(e) {
            // log(e)
            return res.status(500).json({error : "DB쿼리에러"})
        } else if (r.length === 0) {
            return res.status(404).json({errer : "페이지 없음"})
        } else {
            const post = r[0]
            // console.log(r)
            res.json({ success: true, message: '게시글이 성공적으로 수정되었습니다.', board_idx: board_idx })
        }
    })
})

// 자유게시판의 전체 목록을 가져옴
router.get('/freeList', (req, res) => {
    const page = parseInt(req.query.page) || 1; // 현재 페이지 번호 (기본값: 1)
    const limit = 15; // 페이지 당 게시글 수
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) AS total FROM SR_BOARD WHERE BOARD_CATE = '자유'`;
    const dataSql = `SELECT 
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
                        B.BOARD_IMG
                    ORDER BY B.BOARD_DATE DESC
                    LIMIT ?, ?`;

    conn.query(countSql, (err, countResult) => {
        if (err) {
            console.error('DB Count Error: ', err);
            return res.status(500).json({ error: 'DB Count Error' });
        }
        
        const totalPosts = countResult[0].total;
        const totalPages = Math.ceil(totalPosts / limit);

        conn.query(dataSql, [offset, limit], (err, dataResult) => {
            if (err) {
                console.error('DB Query Error: ', err);
                return res.status(500).json({ error: 'DB Query Error' });
            }
            res.render('plantList', { boardFree: dataResult, currentPage: page, totalPages: totalPages });
        });
    });
});

// 게시글 삭제 기능
router.get('/delete', (req, res) => {
    const board_idx = req.query.idx;
    log(board_idx);
    const sql = `DELETE FROM SR_BOARD WHERE BOARD_IDX = ?`

    conn.query(sql, [board_idx], (e, r) => {
        if (e) {
            log(e);
            return res.status(500).json({ error: "DB 쿼리 에러" })
        } else if (r.affectedRows === 0) {
            return res.status(404).json({ error: "페이지 없음" })
        } else {
            res.json({ success: true, message: '게시글이 성공적으로 삭제되었습니다.', board_idx: board_idx })
        }
    })
})




module.exports = router


