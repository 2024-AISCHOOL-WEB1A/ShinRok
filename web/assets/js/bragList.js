
const itemsPerPage = 6;
let currentPage = 1
// 예제 게시물 데이터
const posts = [];
// for (let i = 1; i <= 20; i++) {
//     posts.push({
//         idx: i,
//         USER_NICK: `닉네임${i}`,
//         BOARD_DATE: `2024-07-25`,
//         BOARD_COUNT: i * 10,
//         BOARD_TITLE: `제목${i}`,
//         BOARD_CONTENT: `내용${i}`,
//         BOARD_IMG: `이미지경로${i}.jpg` // 이미지 경로는 예제로 넣었습니다.
//     });
// }

// 게시물 하나의 템플릿 생성 함수
function createPostTemplate(post, commentCount) {
    return `
        <div class="board-item">
            <input type="hidden" name="idx" value="${post.idx}">
            <div class="info-section">
                <span>${post.USER_NICK}</span>
                <span>${post.BOARD_DATE}</span>
                <span>조회수: ${post.BOARD_COUNT}</span>
                <span><i class="fa-regular fa-comment-dots"></i> 댓글 수: ${commentCount}</span>
            </div>
            <table class="table">
                <tr>
                    <td class="addImage" style="text-align: center;">
                        <img src="${post.BOARD_IMG}" alt="자랑 이미지" style="max-width: 100%; height: auto;">
                    </td>
                </tr>
            </table>
            <h2 id="titleName">제목: ${post.BOARD_TITLE}</h2>
            <p>내용: ${post.BOARD_CONTENT}</p>
        </div>
    `;
}

// 현재 페이지의 게시물 표시
function displayPage(page) {
    const board = document.getElementById('board');
    board.innerHTML = ''
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = posts.slice(start, end)
    pageItems.forEach(item => {
        const commentCount = Math.floor(Math.random() * 100); // 예제 댓글 수
        board.innerHTML += createPostTemplate(item, commentCount);
    })
    displayPagination();
}
// 페이지네이션 표시
function displayPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''
    const totalPages = Math.ceil(posts.length / itemsPerPage)
    const prevButton = document.createElement('button');
    prevButton.textContent = '이전';
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    };
    prevButton.className = currentPage === 1 ? 'disabled' : '';
    pagination.appendChild(prevButton)
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            displayPage(currentPage);
        };
        button.className = i === currentPage ? 'active' : '';
        pagination.appendChild(button);
    }
    const nextButton = document.createElement('button');
    nextButton.textContent = '다음';
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
        }
    };
    nextButton.className = currentPage === totalPages ? 'disabled' : '';
    pagination.appendChild(nextButton);
}

// 초기 페이지 표시
displayPage(currentPage);
