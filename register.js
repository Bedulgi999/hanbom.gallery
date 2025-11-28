// register.js (MySQL 연동)

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector(".register-form");

    if (!registerForm) return;

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // 각 입력값 가져오기
        const id = registerForm.querySelector('input[placeholder="아이디"]').value.trim();
        const pw = registerForm.querySelector('input[placeholder="비밀번호"]').value.trim();
        const name = registerForm.querySelector('input[placeholder="이름"]').value.trim();

        const major = registerForm.querySelector('.register-select').value;

        const selectHalf = registerForm.querySelectorAll('.register-select-half');
        const grade = selectHalf[0].value;
        const classNum = selectHalf[1].value;
        const studentNum = selectHalf[2].value;

        if (users.some(u => u.id === id)) {
            alert("이미 존재하는 아이디입니다!");
            return;
        };

        // 빈칸 체크
        if (!id || !pw || !name || !major || !grade || !classNum || !studentNum) {
            alert("모든 항목을 입력해주세요!");
            return;
        };

        // DB로 전송할 데이터
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

        // ⭐ MySQL 서버로 회원가입 요청
        fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("회원가입 완료!");
                window.location.href = "login.html";
            } else {
                alert("회원가입 실패: " + data.message);
            }
        })
        .catch(() => {
            alert("서버 연결 실패!");
        });
    });
});
