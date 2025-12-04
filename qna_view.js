// qna_view.js

const supabase = window.supabase.createClient(
  "https://glmytzfqxdtlhmzbcsgd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
);

const params = new URLSearchParams(location.search);
const postId = params.get("id");
const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

// 초기 로드
document.addEventListener("DOMContentLoaded", () => {
    loadPost();
    loadReplies();
});


// ============================
// ✔ 게시글 불러오기
// ============================
async function loadPost() {
    const { data, error } = await supabase
        .from("qna")
        .select("*")
        .eq("id", postId)
        .single();

    if (error || !data) {
        alert("게시글을 불러오지 못했습니다.");
        return;
    }

    document.getElementById("title").innerText = data.title;
    document.getElementById("writer").innerText = data.writer;
    document.getElementById("date").innerText = data.created_at.split("T")[0];
    document.getElementById("views").innerText = data.views + 1;

    // ⭐ 조회수 증가 실행
    increaseViews();

    // ========================
    // ✔ 조회수 증가(안전한 방식)
    // ========================
    async function increaseViews() {
        const { data: current, error: readError } = await supabase
            .from("qna")
            .select("views")
            .eq("id", postId)
            .single();

        if (readError) {
            console.log("조회수 읽기 오류", readError);
            return;
        }

        const newViews = (current.views || 0) + 1;

        const { error: updateError } = await supabase
            .from("qna")
            .update({ views: newViews })
            .eq("id", postId);

        if (updateError) {
            console.log("조회수 증가 실패", updateError);
            return;
        }

        document.getElementById("views").innerText = newViews;
    }


    // 이미지 표시
    let imageArea = document.getElementById("imageArea");
    imageArea.innerHTML = "";
    (data.images || []).forEach(url => {
        imageArea.innerHTML += `
            <div class="view-image-item">
                <img src="${url}" onclick="window.open('${url}')">
            </div>
        `;
    });

    // 파일 표시
    let fileArea = document.getElementById("fileArea");
    fileArea.innerHTML = "";
    (data.files || []).forEach(url => {
        fileArea.innerHTML += `
            <li class="file-item">
                <span>📄</span>
                <a href="${url}" download>${url.split("/").pop()}</a>
            </li>
        `;
    });

    // 수정/삭제 권한
    if (loggedUser && (loggedUser.id === data.writer || loggedUser.role === "admin")) {
        document.getElementById("editBtn").style.display = "inline-block";
        document.getElementById("deleteBtn").style.display = "inline-block";

        document.getElementById("editBtn").onclick = () => {
            location.href = `qna_edit.html?id=${postId}`;
        };
        document.getElementById("deleteBtn").onclick = deletePost;
    }
}


// ============================
// ✔ 게시글 삭제
// ============================
async function deletePost() {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    await supabase.from("qna").delete().eq("id", postId);
    alert("삭제되었습니다!");
    location.href = "qna.html";
}


// ============================
// ✔ 답글 목록 불러오기
// ============================
async function loadReplies() {
    const { data, error } = await supabase
        .from("qna_reply")
        .select("*")
        .eq("post_id", postId)
        .order("id");

    if (error) return;

    let box = document.getElementById("replyList");
    box.innerHTML = "";

    data.forEach(r => {
        box.innerHTML += `
            <div class="reply-item">
                <b>${r.writer}</b> (${r.created_at.split("T")[0]})
                <p>${r.content}</p>
            </div>
        `;
    });
}


// ============================
// ✔ 답글 작성
// ============================
async function addReply() {
    if (!loggedUser) return alert("로그인이 필요합니다.");

    const content = document.getElementById("replyInput").value.trim();
    if (!content) return alert("내용을 입력하세요");

    const { data, error } = await supabase.from("qna_reply").insert({
        post_id: postId,
        writer: loggedUser.id,
        content
    });

    if (error) {
        console.error("답글 등록 실패:", error);
        alert("답글 등록에 실패했습니다. 콘솔을 확인하세요.");
        return;
    }

    alert("답글이 등록되었습니다!");
    document.getElementById("replyInput").value = "";
    loadReplies();
}
