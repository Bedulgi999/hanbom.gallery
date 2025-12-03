// ------------------------------
// INDEX.JS — 메인 페이지 전용
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const authButtons = document.querySelector(".auth-buttons");
    const adminButtons = document.querySelector(".admin-buttons");
    const sidebarCard = document.querySelector(".sidebar .card");
document.addEventListener("DOMContentLoaded", () => {
    loadTopPosts();
});

    // 현재 로그인된 사용자 가져오기
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    // ------------------------------
    // 1) 로그인 상태에 따라 헤더 UI 변경
    // ------------------------------
    if (loggedUser) {
        // 로그인/회원가입 숨기기
        if (authButtons) authButtons.style.display = "none";

        // 로그아웃 버튼 추가
        const logoutBtn = document.createElement("button");
        logoutBtn.className = "btn-logout";
        logoutBtn.textContent = "로그아웃";
        adminButtons.appendChild(logoutBtn);

        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedUser");
            alert("로그아웃 되었습니다.");
            location.reload();
        });

        // admin 전용 버튼
        if (loggedUser.role === "admin") {
            const manageBtn = document.createElement("a");
            manageBtn.textContent = "계정관리";
            manageBtn.href = "admin.html";
            manageBtn.className = "btn-login";
            adminButtons.appendChild(manageBtn);
        }
    }

    // ------------------------------
    // 2) 오른쪽 로그인 카드 UI 변경
    // ------------------------------
    if (loggedUser && sidebarCard) {
        sidebarCard.innerHTML = `
            <h3>${loggedUser.id}님</h3>

            <div style="font-size:13px; margin-bottom:10px;">
                글 ${loggedUser.posts ?? 0} · 댓글 ${loggedUser.comments ?? 0} · 방문 ${loggedUser.visits ?? 1}
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
                <button class="btn-primary">MY갤로그</button>
                <button class="btn-primary">고정닉정보</button>
                <button class="btn-primary">즐겨찾기</button>
                <button class="btn-primary">운영/가입</button>
                <button class="btn-primary">스크랩</button>
            </div>

            <button class="btn-primary" style="width:100%; padding:7px 0; background:#444;" id="logoutSidebar">
                로그아웃
            </button>
        `;

        document.getElementById("logoutSidebar").addEventListener("click", () => {
            localStorage.removeItem("loggedUser");
            alert("로그아웃 되었습니다.");
            location.reload();
        });
    }

    // ------------------------------
    // 3) 사이드 공지 불러오기 (localStorage 기반)
    // ------------------------------
    loadSidebarNotice();

    // ------------------------------
    // 4) 메인 게시글 목록 불러오기 (localStorage 기반)
    // ------------------------------
    loadMainList();
});



/* -------------------------------------------------
   ✔ 사이드바 공지사항 3개 불러오기
--------------------------------------------------- */
// 사이드바 공지사항 Supabase에서 최신 3개 불러오기
async function loadSidebarNotice() {
    const box = document.getElementById("sidebar-notice");

    let { data, error } = await supabase
        .from("notice")
        .select("title")
        .order("id", { ascending: false })
        .limit(3);

    if (error) {
        console.log(error);
        return;
    }

    box.innerHTML = "";
    data.forEach(n => {
        box.innerHTML += `<li>[공지] ${n.title}</li>`;
    });
}




/* -------------------------------------------------
   ✔ 사이드바 인기글 TOP5
--------------------------------------------------- */
function loadTopPosts() {
    const box = document.getElementById("topPosts");
    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    // 조회수 기준 정렬
    posts.sort((a, b) => b.views - a.views);

    box.innerHTML = "";
    posts.slice(0, 5).forEach((p, i) => {
        box.innerHTML += `<li>${i + 1}. ${p.title}</li>`;
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

    // 공지 고정 우선 정렬
    notices.sort((a, b) => b.pinned - a.pinned);

    let all = [];

    // 공지
    notices.forEach(n => {
        all.push({
            category: n.pinned ? "[공지]📌" : "[공지]",
            title: n.title,
            writer: n.writer,
            date: n.date,
            views: n.views
        });
    });

    // 일반 게시판
    posts.forEach(p => {
        all.push({
            category: p.category,
            title: p.title,
            writer: p.writer,
            date: p.date,
            views: p.views
        });
    });

    // 테이블 생성
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
