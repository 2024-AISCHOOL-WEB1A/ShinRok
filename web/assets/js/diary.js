// script.js
document.addEventListener("DOMContentLoaded", function() {
    var calendarEl = document.getElementById('calendar');
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    var modalText = document.getElementById("modal-text");

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        dateClick: function(info) {
            document.body.style.userSelect = 'none';
            modalText.innerText = `${info.dateStr}`;
            modal.style.display = "block";
        }
    });

    calendar.render();

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});




function loadFile(input) {
    let file = input.files[0]; // 선택파일 가져오기

    let newImage = document.createElement("img"); //새 이미지 태그 생성

    //이미지 source 가져오기
    newImage.src = URL.createObjectURL(file);
    newImage.style.width = "100%"; //div에 꽉차게 넣으려고
    newImage.style.height = "100%";
    newImage.style.objectFit = "cover"; // div에 넘치지 않고 들어가게

    //이미지를 image-show div에 추가
    let container = document.getElementById('image-show');
    container.appendChild(newImage);
}