// index.js

document.addEventListener("DOMContentLoaded", () => {

    // ⭐ 0) Admin 계정 자동 생성
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (!users.some(u => u.id === "admin")) {
        users.push({
            id: "admin",
            pw: "admin1234",
            name: "관리자",
            major: "관리",
            grade: "-",
            classNum: "-",
            studentNum: "-",
            posts: 0,
            comments: 0,
            visits: 0
        });

        localStorage.setItem("users", JSON.stringify(users));
    }

    // ⭐ 1) 로그인 상태 확인
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    const loginCard = document.querySelector(".card .login-form")?.parentElement;

    // ⭐ 2) 헤더 버튼 (로그인/회원가입)
    const authButtons = document.querySelector(".auth-buttons");

    if (loggedUser) {
        // 로그인/회원가입 숨기기
        if (authButtons) authButtons.style.display = "none";

        // ⭐ 버튼을 넣을 공간 (admin-buttons)
        const adminButtons = document.querySelector(".admin-buttons");

        // ⭐ 1) 로그아웃 버튼 (항상 왼쪽)
        const logoutTopBtn = document.createElement("button");
        logoutTopBtn.textContent = "로그아웃";
        logoutTopBtn.className = "btn-logout";
        logoutTopBtn.style.padding = "6px 14px";
        adminButtons.appendChild(logoutTopBtn);

        // 로그아웃 기능
        logoutTopBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedUser");
            alert("로그아웃 되었습니다.");
            window.location.reload();
        });

        // ⭐ 2) Admin 계정이면 오른쪽에 계정관리 버튼 추가
        if (loggedUser.id === "admin") {
            const manageBtn = document.createElement("a");
            manageBtn.textContent = "계정관리";
            manageBtn.href = "admin.html";
            manageBtn.className = "btn-login";
            manageBtn.style.padding = "6px 14px";
            adminButtons.appendChild(manageBtn);
        }

    }
    // ⭐ 3) 오른쪽 로그인 박스 UI 변경
    if (!loggedUser || !loginCard) return;

    loginCard.innerHTML = `
        <h3>${loggedUser.id}님</h3>

        <div style="font-size:13px; margin-bottom:8px;">
            글 ${loggedUser.posts} · 댓글 ${loggedUser.comments} · 방문 ${loggedUser.visits}
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
            <button class="btn-primary">작성글</button>
            <button class="btn-primary">고정닉정보</button>
            <button class="btn-primary">즐겨찾기</button>
            <button class="btn-primary">운영/가입</button>
            <button class="btn-primary">스크랩</button>
        </div>

        <button id="logoutBtn" class="btn-primary" style="width:100%; background:#444;">
            로그아웃
        </button>
    `;

    // ⭐ 오른쪽 박스 로그아웃 동작
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("loggedUser");
        alert("로그아웃 되었습니다.");
        window.location.reload();
    });
});
