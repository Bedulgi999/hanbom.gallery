// qna.js — 질문답변 게시판

document.addEventListener("DOMContentLoaded", () => {

    loadLoginCard();
    loadSidebarNotice();
    loadTopPosts();
    loadQnaList();
    loadTopPosts();
    const searchInput = document.getElementById("qnaSearch");
    if (searchInput) searchInput.addEventListener("input", filterQna);

});

let qnaListData = [];

// =============================
// ✔ 게시글 불러오기
// =============================
async function loadQnaList() {
    const { data, error } = await supabase
        .from("qna")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.log(error);
        alert("Q&A 게시글 불러오기 실패");
        return;
    }

    qnaListData = data;
    renderQnaList(data);
}

// =============================
// ✔ 테이블 렌더링
// =============================
function renderQnaList(list) {
    const table = document.getElementById("qna-list");
    if (!table) return;

    table.innerHTML = "";

    list.forEach(post => {
        table.innerHTML += `
            <tr onclick="openQnaView(${post.id})" style="cursor:pointer">
                <td>[질문]</td>
                <td>${post.title}</td>
                <td>${post.writer}</td>
                <td>${post.created_at?.split("T")[0]}</td>
                <td>${post.views}</td>
            </tr>
        `;
    });
}

// =============================
// ✔ 검색
// =============================
function filterQna() {
    const keyword = document.getElementById("qnaSearch").value.trim();
    const filtered = qnaListData.filter(p =>
        p.title.includes(keyword) ||
        p.writer.includes(keyword)
    );
    renderQnaList(filtered);
}

// =============================
// ✔ 상세 페이지 이동
// =============================
function openQnaView(id) {
    location.href = `qna_view.html?id=${id}`;
}

// =============================
// ✔ 로그인 카드 적용(index.js 동일 버전)
// =============================
function loadLoginCard() {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    const card = document.getElementById("login-card");
    if (!loggedUser || !card) return;

    card.innerHTML = `
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
        <button class="btn-primary" style="width:100%; background:#444;" id="logoutSidebar">
            로그아웃
        </button>
    `;

    document.getElementById("logoutSidebar").addEventListener("click", () => {
        localStorage.removeItem("loggedUser");
        alert("로그아웃 되었습니다.");
        location.reload();
    });
}

/* -------------------------------------------------
   ✔ 사이드바 공지사항 3개 불러오기
--------------------------------------------------- */
// 사이드바 공지사항 Supabase에서 최신 3개 불러오기
async function loadSidebarNotice() {
    const box = document.getElementById("sidebar-notice");

    let { data, error } = await supabase
        .from("notice")
        .select("id, title")
        .order("id", { ascending: false })
        .limit(3);

    if (error) {
        console.log(error);
        return;
    }

    box.innerHTML = "";
    data.forEach(n => {
        box.innerHTML += `
            <li onclick="location.href='notice_view.html?id=${n.id}'" style="cursor:pointer;">
                [공지] ${n.title}
            </li>
        `;
    });
}




/* -------------------------------------------------
   ✔ 사이드바 인기글 TOP5
--------------------------------------------------- */
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

    // 조회수 기준 정렬
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

// TOP5 클릭 시 이동
function goPost(table, id) {
    if (table === "free") location.href = `free_view.html?id=${id}`;
    if (table === "qna") location.href = `qna_view.html?id=${id}`;
    if (table === "notice") location.href = `notice_view.html?id=${id}`;
    if (table === "info") location.href = `info_view.html?id=${id}`;
}

