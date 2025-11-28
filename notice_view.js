// ===============================
// notice_view.js — FULL VERSION
// ===============================

// URL에서 공지 id(인덱스) 가져오기
const urlParams = new URLSearchParams(location.search);
const noticeIndex = Number(urlParams.get("id"));

let notices = JSON.parse(localStorage.getItem("notices")) || [];
let notice = notices[noticeIndex];

if (!notice) {
    alert("존재하지 않는 공지입니다.");
    location.href = "notice.html";
}

// ----------------------------
// 조회수 증가 + 저장
// ----------------------------
notice.views++;
localStorage.setItem("notices", JSON.stringify(notices));

document.getElementById("v-title").textContent = notice.title;
document.getElementById("v-info").innerHTML =
    `${notice.pinned ? "📌 (상단 고정) · " : ""}작성자: <b class='writer-link' onclick="openProfile('${notice.writer}')">${notice.writer}</b> | 날짜: ${notice.date} | 조회수: ${notice.views}`;

document.getElementById("v-content").textContent = notice.content;

// 로그인 정보
const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

// ----------------------------
// 🔥 관리자에게만 수정/삭제 버튼 표시
// ----------------------------
if (loggedUser && loggedUser.id === "admin") {
    document.getElementById("admin-tools").style.display = "flex";
}

// ----------------------------
// 공지 수정하기
// ----------------------------
function editNotice() {
    let newTitle = prompt("새 제목 입력", notice.title);
    if (!newTitle) return;

    let newContent = prompt("새 내용 입력", notice.content);
    if (!newContent) return;

    notice.title = newTitle;
    notice.content = newContent;

    localStorage.setItem("notices", JSON.stringify(notices));

    alert("수정 완료!");
    location.reload();
}

// ----------------------------
// 삭제 모달 표시
// ----------------------------
function openDeleteModal() {
    document.getElementById("delete-modal").style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("delete-modal").style.display = "none";
}

// ----------------------------
// 공지 삭제
// ----------------------------
function confirmDelete() {
    notices.splice(noticeIndex, 1);
    localStorage.setItem("notices", JSON.stringify(notices));

    alert("삭제되었습니다.");
    location.href = "notice.html";
}

// ----------------------------
// 작성자 프로필 보기
// ----------------------------
function openProfile(name) {
    let count = notices.filter(n => n.writer === name).length;

    alert(`
📘 작성자 프로필

이름: ${name}
작성한 공지 수: ${count}
가입 정보: LocalStorage 기반이므로 실제 정보는 없음
`);
}

// ----------------------------
// 댓글 기능
// ----------------------------
let comments = JSON.parse(localStorage.getItem("noticeComments")) || {};
if (!comments[noticeIndex]) comments[noticeIndex] = [];

function renderComments() {
    let html = "";

    comments[noticeIndex].forEach((c, i) => {
        html += `
        <div class="comment-item">
            <b>${c.writer}</b> (${c.date})<br>
            ${c.text}
            ${loggedUser && loggedUser.id === "admin"
                ? `<button onclick="deleteComment(${i})" class="btn-login" style="margin-left:10px;padding:2px 6px;font-size:11px;">삭제</button>`
                : ""}
        </div>`;
    });

    document.getElementById("comment-list").innerHTML = html;
}

renderComments();

function addComment() {
    const txt = document.getElementById("comment-text").value.trim();
    if (!txt) {
        alert("댓글을 입력하세요!");
        return;
    }

    comments[noticeIndex].push({
        writer: loggedUser ? loggedUser.id : "익명",
        text: txt,
        date: new Date().toISOString().split("T")[0]
    });

    localStorage.setItem("noticeComments", JSON.stringify(comments));
    document.getElementById("comment-text").value = "";
    renderComments();
}

function deleteComment(i) {
    comments[noticeIndex].splice(i, 1);
    localStorage.setItem("noticeComments", JSON.stringify(comments));
    renderComments();
}
