// 회원가입 처리
document.addEventListener("DOMContentLoaded", function () {  
    const registerForm = document.querySelector(".register-form");  

    //회원가입 기능
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const inputs = registerForm.querySelectorAll("input, select");
            let userData = {};

            // 빈칸 확인
            for (let item of inputs) {
                if (item.value === "" || item.value === "학과 선택" || item.value === "학년 선택" ||
                    item.value === "반 선택" || item.value === "번호 선택") {
                    alert("모든 항목을 입력해주세요!");
                    return;
                }
            }

            const id = inputs[0].value;
            const pw = inputs[1].value;

            // LocalStorage에 저장
            const newUser = {
                id: id,
                pw: pw,
                name: inputs[2].value,
                major: inputs[3].value,
                grade: inputs[4].value,
                classNum: inputs[5].value,
                studentNum: inputs[6].value
            };

            // 기존 데이터 불러오기
            let users = JSON.parse(localStorage.getItem("users")) || [];

            // 중복 아이디 체크
            if (users.some(u => u.id === id)) {
                alert("이미 존재하는 아이디입니다!");
                return;
            }

            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));

            alert("회원가입 완료!");
            window.location.href = "login.html";
        });
    }
});