// common.js — 공통 유틸리티 함수

// =============================
// 로그인 사용자 가져오기
// =============================
function getLoggedUser() {
    return JSON.parse(localStorage.getItem("loggedUser"));
}

// =============================
// 로그아웃
// =============================
function logout() {
    localStorage.removeItem("loggedUser");
    alert("로그아웃 되었습니다.");
    location.href = "index.html";
}

// =============================
// 관리자 권한 체크
// =============================
function checkAdmin() {
    const user = getLoggedUser();
    if (!user || user.role !== "admin") {
        alert("관리자 전용 페이지입니다.");
        location.href = "index.html";
        return false;
    }
    return true;
}

// =============================
// 로그인 카드 UI 렌더링
// =============================
function renderLoginCard(cardId = "login-card") {
    const card = document.getElementById(cardId);
    if (!card) return;

    const user = getLoggedUser();

    if (!user) {
        // 비로그인 상태
        card.innerHTML = `
            <h3>로그인</h3>
            <form class="login-form" id="sidebar-login-form">
                <input type="text" placeholder="아이디" id="sidebar-id">
                <input type="password" placeholder="비밀번호" id="sidebar-pw">
                <button type="submit" class="btn-primary full">로그인</button>
            </form>
            <div class="login-links">
                <a href="register.html">회원가입</a>
                <span>·</span>
                <a href="#">아이디/비밀번호 찾기</a>
            </div>
        `;
        
        // 사이드바 로그인 폼에 이벤트 리스너 추가
        const form = document.getElementById("sidebar-login-form");
        if (form) {
            form.addEventListener("submit", handleSidebarLogin);
        }
        return;
    }

    // 로그인 상태
    card.innerHTML = `
        <h3>${user.id}님</h3>
        <div style="font-size:13px; margin-bottom:10px;">
            글 ${user.posts ?? 0} · 댓글 ${user.comments ?? 0} · 방문 ${user.visits ?? 1}
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
            <button class="btn-primary">MY갤로그</button>
            <button class="btn-primary">고정닉정보</button>
            <button class="btn-primary">즐겨찾기</button>
            <button class="btn-primary">운영/가입</button>
            <button class="btn-primary">스크랩</button>
        </div>
        <button id="logoutSidebar" class="btn-primary" style="width:100%; background:#444;">
            로그아웃
        </button>
    `;

    const logoutBtn = document.getElementById("logoutSidebar");
    if (logoutBtn) {
        logoutBtn.onclick = logout;
    }
}

// =============================
// 사이드바 로그인 처리
// =============================
async function handleSidebarLogin(e) {
    e.preventDefault();

    const id = document.getElementById("sidebar-id").value.trim();
    const pw = document.getElementById("sidebar-pw").value.trim();

    // 입력값 체크
    if (!id && !pw) {
        alert("아이디와 비밀번호를 모두 입력해주세요!");
        return;
    }
    if (!id) {
        alert("아이디를 입력해주세요!");
        return;
    }
    if (!pw) {
        alert("비밀번호를 입력해주세요!");
        return;
    }

    // 1) DB에서 해당 아이디 찾기
    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error(error);
        alert("로그인 중 오류가 발생했습니다.");
        return;
    }

    if (!user) {
        alert("존재하지 않는 계정입니다!");
        return;
    }

    // 2) 비밀번호 확인
    if (user.password !== pw) {
        alert("비밀번호가 올바르지 않습니다!");
        return;
    }

    // 3) 방문수 +1 업데이트
    const newVisits = (user.visits ?? 0) + 1;
    await supabase
        .from("users")
        .update({ visits: newVisits })
        .eq("id", id);

    // 4) localStorage에 로그인 정보 저장
    const loggedUser = {
        id: user.id,
        name: user.name,
        major: user.major,
        grade: user.grade,
        class_num: user.class_num,
        number: user.number,
        posts: user.posts ?? 0,
        comments: user.comments ?? 0,
        visits: newVisits,
        role: user.role ?? (user.id === "admin" ? "admin" : "user"),
    };

    localStorage.setItem("loggedUser", JSON.stringify(loggedUser));

    alert("로그인 성공!");
    location.reload();
}

// =============================
// 헤더 인증 버튼 렌더링
// =============================
function renderAuthButtons() {
    const authButtons = document.querySelector(".auth-buttons");
    const adminButtons = document.querySelector(".admin-buttons");
    
    if (!authButtons || !adminButtons) return;

    const user = getLoggedUser();

    if (!user) {
        // 비로그인 상태
        authButtons.style.display = "flex";
        authButtons.innerHTML = `
            <a href="login.html" class="btn-login">로그인</a>
            <a href="register.html" class="btn-signup">회원가입</a>
        `;
        adminButtons.innerHTML = "";
        return;
    }

    // 로그인 상태
    authButtons.style.display = "none";
    adminButtons.innerHTML = "";

    // 로그아웃 버튼
    const logoutBtn = document.createElement("button");
    logoutBtn.className = "btn-logout";
    logoutBtn.textContent = "로그아웃";
    logoutBtn.onclick = logout;
    adminButtons.appendChild(logoutBtn);

    // 관리자 전용 버튼
    if (user.role === "admin") {
        const manageBtn = document.createElement("a");
        manageBtn.textContent = "계정관리";
        manageBtn.href = "admin.html";
        manageBtn.className = "btn-login";
        adminButtons.appendChild(manageBtn);
    }
}

// =============================
// 사이드바 공지사항 로드
// =============================
async function loadSidebarNotice() {
    const box = document.getElementById("sidebar-notice");
    if (!box) return;

    const { data, error } = await supabase
        .from("notice")
        .select("id, title")
        .order("id", { ascending: false })
        .limit(3);

    if (error) {
        console.error("공지 로드 오류:", error);
        return;
    }

    box.innerHTML = "";
    (data || []).forEach(n => {
        box.innerHTML += `
            <li onclick="location.href='notice_view.html?id=${n.id}'" style="cursor:pointer;">
                [공지] ${n.title}
            </li>
        `;
    });
}

// =============================
// 사이드바 인기글 TOP5 로드
// =============================
async function loadTopPosts() {
    const box = document.getElementById("topPosts");
    if (!box) return;

    const all = [];

    // 모든 게시판에서 데이터 가져오기
    const tables = ["free", "qna", "notice"];
    
    for (const table of tables) {
        const { data } = await supabase
            .from(table)
            .select("id, title, views");
        
        if (data) {
            all.push(...data.map(v => ({ ...v, table })));
        }
    }

    // 조회수 기준 정렬
    all.sort((a, b) => b.views - a.views);
    const top5 = all.slice(0, 5);

    box.innerHTML = "";
    top5.forEach((p, i) => {
        const viewUrl = `${p.table}_view.html?id=${p.id}`;
        box.innerHTML += `
            <li onclick="location.href='${viewUrl}'" style="cursor:pointer;">
                ${i + 1}. ${p.title}
            </li>
        `;
    });
}

// =============================
// 날짜 포맷팅
// =============================
function formatDate(dateString) {
    if (!dateString) return "";
    return dateString.split("T")[0];
}
