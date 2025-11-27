// 회원가입 처리
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login-form");

    // 로그인 기능
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const id = loginForm.querySelectorAll("input")[0].value;
            const pw = loginForm.querySelectorAll("input")[1].value;

            let users = JSON.parse(localStorage.getItem("users")) || [];

            const user = users.find(u => u.id === id && u.pw === pw);

            if (!user) {
                alert("아이디 또는 비밀번호가 입력해주세요!");
                return;
            }

            alert("로그인 성공!");
            window.location.href = "index.html";
        });
    }
});
