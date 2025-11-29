// register.js

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector(".register-form");

    if (!registerForm) return;

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const inputs = registerForm.querySelectorAll("input, select");

        // 빈칸 체크
        for (let item of inputs) {
            if (!item.value || item.selectedIndex === 0) {
                alert("모든 항목을 입력해주세요!");
                return;
            }
        }

        const id = inputs[0].value.trim();
        const pw = inputs[1].value.trim();

        let users = JSON.parse(localStorage.getItem("users")) || [];

        // 중복 아이디 체크
        if (users.some(u => u.id === id)) {
            alert("이미 존재하는 아이디입니다!");
            return;
        }

        const newUser = {
            id,
            pw,
            name: inputs[2].value,
            major: inputs[3].value,
            grade: inputs[4].value,
            classNum: inputs[5].value,
            studentNum: inputs[6].value,
            posts: 0,
            comments: 0,
            visits: 0
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("회원가입 완료!");
        window.location.href = "login.html";
    });
});
