
// const itemsPerPage = 6;
// let currentPage = 1
// // 예제 게시물 데이터
// const posts = [];

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
// // 페이지네이션 표시
// function displayPagination() {
//     const pagination = document.getElementById('pagination');
//     pagination.innerHTML = ''
//     const totalPages = Math.ceil(posts.length / itemsPerPage)
//     const prevButton = document.createElement('button');
//     prevButton.textContent = '이전';
//     prevButton.onclick = () => {
//         if (currentPage > 1) {
//             currentPage--;
//             displayPage(currentPage);
//         }
//     };
//     prevButton.className = currentPage === 1 ? 'disabled' : '';
//     pagination.appendChild(prevButton)
//     for (let i = 1; i <= totalPages; i++) {
//         const button = document.createElement('button');
//         button.textContent = i;
//         button.onclick = () => {
//             currentPage = i;
//             displayPage(currentPage);
//         };
//         button.className = i === currentPage ? 'active' : '';
//         pagination.appendChild(button);
//     }
//     const nextButton = document.createElement('button');
//     nextButton.textContent = '다음';
//     nextButton.onclick = () => {
//         if (currentPage < totalPages) {
//             currentPage++;
//             displayPage(currentPage);
//         }
//     };
//     nextButton.className = currentPage === totalPages ? 'disabled' : '';
//     pagination.appendChild(nextButton);
// }

// // 초기 페이지 표시
// displayPage(currentPage);
