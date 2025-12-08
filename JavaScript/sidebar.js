// --------------------------------------------
// 📢 ① 사이드바 공지사항 불러오기
// --------------------------------------------
async function loadSidebarNotice() {
    const box = document.getElementById("sidebar-notice");
    if (!box) return; // 요소 없으면 중단

    let { data, error } = await supabase
        .from("notice")
        .select("id, title")
        .order("id", { ascending: false })
        .limit(3);

    if (error) {
        console.log("공지 불러오기 오류:", error);
        return;
    }

    box.innerHTML = "";

    data.forEach(n => {
        box.innerHTML += `
        <li>
            <a href="notice_view.html?id=${n.id}" 
               style="color:#333; text-decoration:none;">
               [공지] ${n.title}
            </a>
        </li>`;
    });
}



// --------------------------------------------
// 🔥 ② 인기 글 TOP 5 (모든 게시판 통합)
// --------------------------------------------
// posts 테이블 대신 너는 qna / info / freeboard 등 DB가 분리되어 있으므로
// 현재는 qna 기준으로 해줄게 — 필요하면 모두 통합해줄 수 있음
// --------------------------------------------
async function loadTopPosts() {
    const box = document.getElementById("topPosts");
    if (!box) return;

    let { data, error } = await supabase
        .from("qna")
        .select("id, title, views")
        .order("views", { ascending: false })
        .limit(5);

    if (error) {
        console.log("인기글 로딩 오류:", error);
        return;
    }

    box.innerHTML = "";

    data.forEach((post, i) => {
        box.innerHTML += `
        <li>
            <a href="qna_view.html?id=${post.id}"
               style="color:#333; text-decoration:none;">
               ${i + 1}. ${post.title}
            </a>
        </li>`;
    });
}



// --------------------------------------------
// ✔ 페이지 로드시 자동 실행
// --------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadSidebarNotice();
    loadTopPosts();
});
