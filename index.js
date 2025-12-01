// ------------------------------
// INDEX.JS — 메인 페이지 전용
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const authButtons = document.querySelector(".auth-buttons");
    const adminButtons = document.querySelector(".admin-buttons");
    const sidebarCard = document.querySelector(".sidebar .card");
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    // ------------------------------
    // 1) 헤더 로그인 UI
    // ------------------------------
    if (loggedUser) {
        if (authButtons) authButtons.style.display = "none";

        const logoutBtn = document.createElement("button");
        logoutBtn.className = "btn-logout";
        logoutBtn.textContent = "로그아웃";
        adminButtons.appendChild(logoutBtn);

        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedUser");
            alert("로그아웃 되었습니다.");
            location.reload();
        });

        if (loggedUser.role === "admin") {
            const manageBtn = document.createElement("a");
            manageBtn.textContent = "계정관리";
            manageBtn.href = "admin.html";
            manageBtn.className = "btn-login";
            adminButtons.appendChild(manageBtn);
        }
    }

    // ------------------------------
    // 2) 오른쪽 로그인 카드 UI 적용
    // ------------------------------
    const sidebarLogin = document.getElementById("sidebar-login-card");

    if (loggedUser && sidebarLogin) {
        sidebarLogin.innerHTML = `
            <h3>${loggedUser.id}님</h3>
            <div style="font-size:13px; margin-bottom:10px;">
                글 ${loggedUser.posts ?? 0} · 댓글 ${loggedUser.comments ?? 0} · 방문 ${loggedUser.visits ?? 1}
            </div>
            <button class="btn-primary" style="width:100%; background:#444;" onclick="logoutNow()">로그아웃</button>
        `;
    }

    // ------------------------------
    loadSidebarNotice();
    loadMainList();
});


// 로그아웃
function logoutNow() {
    localStorage.removeItem("loggedUser");
    alert("로그아웃 되었습니다.");
    location.reload();
}


// =============================
// 공지사항 로드
// =============================
function loadSidebarNotice() {
    let notices = JSON.parse(localStorage.getItem("notices")) || [];
    const box = document.getElementById("sidebar-notice");
    if (!box) return;

    box.innerHTML = "";
    notices.slice(0, 3).forEach(n => {
        box.innerHTML += `<li>[공지] ${n.title}</li>`;
    });
}

// =============================
// 메인 게시판 로드
// =============================
function loadMainList() {
    const list = document.getElementById("main-list");
    if (!list) return;

    let notices = JSON.parse(localStorage.getItem("notices")) || [];
    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    notices.sort((a, b) => b.pinned - a.pinned);

    let all = [];

    notices.forEach(n => {
        all.push({
            category: n.pinned ? "[공지]📌" : "[공지]",
            title: n.title,
            writer: n.writer,
            date: n.date,
            views: n.views
        });
    });

    posts.forEach(p => {
        all.push(p);
    });

    let html = "";
    all.forEach(item => {
        html += `
        <tr ${item.category.includes("📌") ? `style="background:#fff5d9"` : ""}>
            <td>${item.category}</td>
            <td>${item.title}</td>
            <td>${item.writer}</td>
            <td>${item.date}</td>
            <td>${item.views}</td>
        </tr>`;
    });

    list.innerHTML = html;
}


// =============================
// 📱 모바일 메뉴 기능
// =============================

// 메뉴 열고닫기
function toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    menu.classList.toggle("show");
    loadMobileMenuContent();
}

// 로그인/회원가입/로그아웃 자동 구성
function loadMobileMenuContent() {
    const content = document.getElementById("mobileMenuContent");
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    if (!loggedUser) {
        content.innerHTML = `
            <a href="login.html" class="mobile-link">로그인</a>
            <a href="register.html" class="mobile-link">회원가입</a>
        `;
    } else {
        content.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 18px; font-weight: 700;">
              ${loggedUser.id}님
            </div>

            <a class="mobile-link" onclick="logoutNow()">로그아웃</a>

            ${loggedUser.role === "admin"
                ? `<a href="admin.html" class="mobile-link">계정관리</a>`
                : ""}
        `;
    }
}
