// info.js — 정보공유 리스트 페이지

document.addEventListener("DOMContentLoaded", () => {

    loadLoginCard();      // 로그인 카드 UI 구성
    loadSidebarNotice();  // 공지사항 사이드바
    loadTopPosts();       // 인기글 TOP5
    loadInfoList();       // 정보공유 목록 불러오기

    document.getElementById("infoSearch").addEventListener("input", filterInfo);

    checkWriteButton(); // 글쓰기 버튼 활성화
});

// ----------------------------------------------
// 로그인 카드
// ----------------------------------------------
function loadLoginCard() {
    const card = document.getElementById("login-card");
    const user = JSON.parse(localStorage.getItem("loggedUser"));

    if (!card) return;

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
        return;
    }

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

    document.getElementById("logoutSidebar").onclick = () => {
        localStorage.removeItem("loggedUser");
        alert("로그아웃 되었습니다.");
        location.reload();
    };
}



// ----------------------------------------------
// 글쓰기 버튼 (로그인 시만 보임)
// ----------------------------------------------
function checkWriteButton() {
    const writeBtn = document.getElementById("writeInfoBtn");
    const user = JSON.parse(localStorage.getItem("loggedUser"));

    if (!writeBtn) return;

    if (user) {
        writeBtn.style.display = "inline-block";
        writeBtn.onclick = () => location.href = "info_write.html";
    }
}



// ----------------------------------------------
// 정보공유 목록 불러오기
// ----------------------------------------------
let infoListData = [];

async function loadInfoList() {
    const { data, error } = await supabase
        .from("info")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.log(error);
        alert("정보공유 불러오기 실패");
        return;
    }

    infoListData = data;
    renderInfoList(data);
}



// ----------------------------------------------
// 목록 렌더링
// ----------------------------------------------
function renderInfoList(list) {
    const tbody = document.getElementById("infoList");
    tbody.innerHTML = "";

    list.forEach(post => {
        tbody.innerHTML += `
            <tr onclick="openInfoView(${post.id})" style="cursor:pointer">
                <td>[정보]</td>
                <td>${post.title}</td>
                <td>${post.writer}</td>
                <td>${post.created_at.split("T")[0]}</td>
                <td>${post.views}</td>
            </tr>
        `;
    });
}



// ----------------------------------------------
// 검색 기능
// ----------------------------------------------
function filterInfo() {
    const keyword = document.getElementById("infoSearch").value.trim();

    const filtered = infoListData.filter(p =>
        p.title.includes(keyword) ||
        p.writer.includes(keyword)
    );

    renderInfoList(filtered);
}



// ----------------------------------------------
// 글 상세보기 이동
// ----------------------------------------------
function openInfoView(id) {
    location.href = `info_view.html?id=${id}`;
}



// ----------------------------------------------
// 인기글 TOP5 (모든 게시판 합산)
// ----------------------------------------------
async function loadTopPosts() {
    const box = document.getElementById("topPosts");
    if (!box) return;

    const all = [];

    async function fetchTable(table) {
        const { data } = await supabase.from(table).select("*");
        if (data) all.push(...data.map(v => ({ ...v, table })));
    }

    await fetchTable("free");
    await fetchTable("qna");
    await fetchTable("notice");
    await fetchTable("info");

    all.sort((a, b) => b.views - a.views);

    const top5 = all.slice(0, 5);

    box.innerHTML = "";
    top5.forEach(p => {
        box.innerHTML += `
            <li onclick="goPost('${p.table}', ${p.id})" style="cursor:pointer;">
                ${p.title}
            </li>
        `;
    });
}

function goPost(table, id) {
    if (table === "free") location.href = `free_view.html?id=${id}`;
    if (table === "qna") location.href = `qna_view.html?id=${id}`;
    if (table === "notice") location.href = `notice_view.html?id=${id}`;
    if (table === "info") location.href = `info_view.html?id=${id}`;
}



// ----------------------------------------------
// 사이드바 공지 3개
// ----------------------------------------------
async function loadSidebarNotice() {
    const box = document.getElementById("sidebar-notice");
    if (!box) return;

    const { data } = await supabase
        .from("notice")
        .select("*")
        .order("id", { ascending: false })
        .limit(3);

    box.innerHTML = "";
    data.forEach(n => {
        box.innerHTML += `
            <li onclick="location.href='notice_view.html?id=${n.id}'" style="cursor:pointer;">
                [공지] ${n.title}
            </li>
        `;
    });
}
