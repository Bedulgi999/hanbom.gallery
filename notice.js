// notice.js — 공지사항 페이지 전용
// ⚠ supabase 는 notice.html 에서 window.supabase.createClient(...) 로 이미 생성되어 있어야 함!

let noticeData = []; // 검색용 원본 데이터 저장

document.addEventListener("DOMContentLoaded", () => {
  loadAuthButtons();    // 상단 메뉴 로그인/로그아웃 + 계정관리 + 공지작성
  loadLoginCard();      // 오른쪽 사이드 로그인 카드
  loadNoticeList();     // 공지 테이블 목록
  loadSidebarNotice();  // 사이드바 최신 공지 3개
  loadTopPosts();       // 사이드바 Q&A 인기글 TOP5

  // 검색 이벤트
  const searchInput = document.getElementById("noticeSearch");
  if (searchInput) {
    searchInput.addEventListener("input", filterNotice);
  }
});

/* ----------------------------------------------
   1. 오른쪽 로그인 카드
---------------------------------------------- */
function loadLoginCard() {
  const card = document.getElementById("login-card");
  const user = JSON.parse(localStorage.getItem("loggedUser"));

  if (!card) return;

  // 로그인 안 된 상태
  if (!user) {
    card.innerHTML = `
      <h3>로그인</h3>
      <form class="login-form">
          <input type="text" placeholder="아이디">
          <input type="password" placeholder="비밀번호">
          <button type="submit" class="btn-primary full">로그인</button>
      </form>
      <div class="login-links">
          <a href="register.html">회원가입</a>
          <span>·</span>
          <a href="#">아이디/비밀번호 찾기</a>
      </div>
    `;
    // 실제 로그인 동작은 login.js 에서 .login-form 에 submit 이벤트를 걸어서 처리
    return;
  }

  // 로그인 된 상태
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

      <button id="logoutSidebar" class="btn-primary" style="width:100%; background:#444;">로그아웃</button>
  `;

  const logoutBtn = document.getElementById("logoutSidebar");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem("loggedUser");
      alert("로그아웃 되었습니다.");
      location.reload();
    };
  }
}

/* ----------------------------------------------
   2. 상단 헤더 로그인/로그아웃 + 계정관리/공지작성
---------------------------------------------- */
function loadAuthButtons() {
  const authButtons = document.getElementById("authBox");   // 로그인/회원가입 버튼 영역
  if (!authButtons) return;

  // admin 버튼 영역이 없으면 동적으로 하나 생성
  let adminButtons = document.getElementById("adminButtons");
  if (!adminButtons) {
    adminButtons = document.createElement("div");
    adminButtons.id = "adminButtons";
    adminButtons.className = "admin-buttons";
    // 헤더 안에서 authButtons 바로 뒤에 붙이기
    authButtons.parentNode.appendChild(adminButtons);
  }

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  // 로그인 안 된 상태 → 로그인/회원가입 보여주고, admin 영역 비움
  if (!loggedUser) {
    authButtons.style.display = "flex";
    authButtons.innerHTML = `
      <a href="login.html" class="btn-login">로그인</a>
      <a href="register.html" class="btn-signup">회원가입</a>
    `;
    adminButtons.innerHTML = "";
    return;
  }

  // 로그인 된 상태 → 로그인/회원가입 숨기고 admin 버튼 영역 사용
  authButtons.style.display = "none";
  adminButtons.innerHTML = "";

  // 로그아웃 버튼
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn-logout";
  logoutBtn.textContent = "로그아웃";
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    alert("로그아웃 되었습니다.");
    location.href = "index.html";
  });
  adminButtons.appendChild(logoutBtn);

  // admin 전용 기능들
  if (loggedUser.role === "admin") {
    // 계정관리 버튼
    const manageBtn = document.createElement("a");
    manageBtn.textContent = "계정관리";
    manageBtn.href = "admin.html";
    manageBtn.className = "btn-login";
    adminButtons.appendChild(manageBtn);

    // 공지 작성 버튼 활성화
    const writeBtn = document.getElementById("writeNoticeBtn");
    if (writeBtn) {
      writeBtn.style.display = "inline-block";
      writeBtn.onclick = () => {
        location.href = "notice_write.html";
      };
    }
  }
}

/* ----------------------------------------------
   3. 공지 목록 로드 + 렌더 + 검색
---------------------------------------------- */
async function loadNoticeList() {
  const { data, error } = await supabase
    .from("notice")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.log("공지 목록 로드 오류:", error);
    return;
  }

  noticeData = data || [];
  renderNoticeList(noticeData);
}

function renderNoticeList(list) {
  const tbody = document.getElementById("noticeList");
  if (!tbody) return;

  tbody.innerHTML = "";

  list.forEach(n => {
    tbody.innerHTML += `
      <tr onclick="location.href='notice_view.html?id=${n.id}'" style="cursor:pointer">
        <td>[공지]</td>
        <td>${n.title}</td>
        <td>${n.writer}</td>
        <td>${(n.created_at || "").split("T")[0]}</td>
        <td>${n.views ?? 0}</td>
      </tr>
    `;
  });
}

// 검색
function filterNotice() {
  const keywordInput = document.getElementById("noticeSearch");
  if (!keywordInput) return;

  const keyword = keywordInput.value.trim();
  if (!keyword) {
    renderNoticeList(noticeData);
    return;
  }

  const lower = keyword.toLowerCase();
  const filtered = noticeData.filter(n =>
    (n.title || "").toLowerCase().includes(lower) ||
    (n.writer || "").toLowerCase().includes(lower)
  );

  renderNoticeList(filtered);
}

/* ----------------------------------------------
   4. 사이드바 최신 공지 3개
---------------------------------------------- */
async function loadSidebarNotice() {
  const { data, error } = await supabase
    .from("notice")
    .select("id, title")
    .order("id", { ascending: false })
    .limit(3);

  if (error) {
    console.log("사이드 공지 로드 오류:", error);
    return;
  }

  const box = document.getElementById("sidebar-notice");
  if (!box) return;

  box.innerHTML = "";

  (data || []).forEach(n => {
    box.innerHTML += `
      <li onclick="location.href='notice_view.html?id=${n.id}'" style="cursor:pointer">
        [공지] ${n.title}
      </li>
    `;
  });
}

/* ----------------------------------------------
   5. 사이드바 인기글 TOP5 (Q&A 기준)
---------------------------------------------- */
async function loadTopPosts() {
  const { data, error } = await supabase
    .from("qna")
    .select("id, title, views")
    .order("views", { ascending: false })
    .limit(5);

  if (error) {
    console.log("인기글 로드 오류:", error);
    return;
  }

  const box = document.getElementById("topPosts");
  if (!box) return;

  box.innerHTML = "";

  (data || []).forEach((p, i) => {
    box.innerHTML += `
      <li onclick="location.href='qna_view.html?id=${p.id}'" style="cursor:pointer">
        ${i + 1}. ${p.title}
      </li>
    `;
  });
}
