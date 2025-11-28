// ===========================
// 기존 LocalStorage admin.js 코드 유지 (지우지 마시오)
// ===========================

// LocalStorage 데이터 로드 (MySQL 없을 때만 사용)
document.addEventListener("DOMContentLoaded", () => {

    // MySQL에서 데이터가 로드되면 실행 금지
    if (window.DB_LOADED) return;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const table = document.getElementById("userTable").querySelector("tbody");

    users.forEach((u, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.pw || "-"}</td>
            <td>${u.name || "-"}</td>
            <td>${u.major || "-"}</td>
            <td>${u.grade || "-"}</td>
            <td>${u.classNum || "-"}</td>
            <td>${u.studentNum || "-"}</td>
            <td>${u.visits || 0}</td>
            <td><button class="delete-btn" onclick="deleteUser(${index})">삭제</button></td>
        `;

        table.appendChild(tr);
    });
});

function deleteUser(index) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users[index].id === "admin") {
        alert("관리자 계정은 삭제할 수 없습니다.");
        return;
    }

    if (confirm("정말 삭제하시겠습니까?")) {
        users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(users));
        alert("삭제 완료!");
        location.reload();
    }
}



// ===========================
// MySQL 연동 코드
// ===========================

function loadUsers(sort = "id", order = "ASC") {
    fetch(`http://localhost:3000/users?sort=${sort}&order=${order}`)
        .then(res => res.json())
        .then(data => {
            window.DB_LOADED = true; // MySQL 데이터 로드 완료 표시
            renderTable(data);
        })
        .catch(() => {
            console.log("⚠ MySQL 연결 실패 → LocalStorage 사용");
        });
}

// 테이블 출력
function renderTable(users) {
    const table = document.getElementById("userTable").querySelector("tbody");
    table.innerHTML = "";

    users.forEach((u) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.pw || "-"}</td>
            <td>${u.name || "-"}</td>
            <td>${u.major || "-"}</td>
            <td>${u.grade || "-"}</td>
            <td>${u.classNum || "-"}</td>
            <td>${u.studentNum || "-"}</td>
            <td>${u.visits || 0}</td>
            <td><button class="delete-btn" onclick="deleteUserSQL('${u.id}')">삭제</button></td>
        `;

        table.appendChild(tr);
    });
}

// MySQL 회원 삭제
function deleteUserSQL(id) {
    if (!confirm("삭제할까요?")) return;

    fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(() => loadUsers());
}

// 첫 로드 시 MySQL 가져오기
document.addEventListener("DOMContentLoaded", () => {
    loadUsers("id", "ASC");
});
