// login.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".login-form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = loginForm.querySelectorAll("input")[0].value.trim();
        const pw = loginForm.querySelectorAll("input")[1].value.trim();

        if (!id || !pw) {
            alert("아이디와 비밀번호를 입력해주세요!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.id === id && u.pw === pw);

        if (!user) {
            alert("존재하지 않는 계정입니다!");
            // 비밀번호 삭제 ❌ (요청에 따라 삭제 안 함)
            return;
        }

        // 로그인 성공 → 저장
        const loggedUser = {
            id: user.id,
            posts: user.posts || 0,
            comments: user.comments || 0,
            visits: (user.visits || 0) + 1
        };

        localStorage.setItem("loggedUser", JSON.stringify(loggedUser));

        alert("로그인 성공!");

        // login.html에서 실행되면 index.html로 이동
        location.reload();
    });
});






