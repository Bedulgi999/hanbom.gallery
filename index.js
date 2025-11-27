// index.js

// 기본 학생회 관리자 계정 생성
(function () {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const adminExists = users.some(u => u.role === "admin");

    if (!adminExists) {
        users.push({
            id: "hanbom",
            pw: "hb0330",
            name: "한봄고등학교",
            role: "admin"
        });

        localStorage.setItem("users", JSON.stringify(users));
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    const loginCard = document.querySelector(".card .login-form")?.parentElement;

    if (!loggedUser || !loginCard) return;

    loginCard.innerHTML = `
        <h3>${loggedUser.id}님</h3>

        <div style="font-size:13px; margin-bottom:8px;">
            글 ${loggedUser.posts} · 댓글 ${loggedUser.comments} · 방문 ${loggedUser.visits}
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
            <button class="btn-primary">MY갤로그</button>
            <button class="btn-primary">고정닉정보</button>
            <button class="btn-primary">즐겨찾기</button>
            <button class="btn-primary">운영/가입</button>
            <button class="btn-primary">스크랩</button>
            <button class="btn-primary">알림</button>
        </div>

        <button id="logoutBtn" class="btn-primary" style="width:100%; background:#444;">
            로그아웃
        </button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("loggedUser");
        alert("로그아웃 되었습니다.");
        window.location.reload();
    });
});




