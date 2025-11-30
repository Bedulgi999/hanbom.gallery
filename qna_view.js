// qna_view.js

const supabase = window.supabase.createClient(
  "https://glmytzfqxdtlhmzbcsgd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
);

const params = new URLSearchParams(location.search);
const postId = params.get("id");

const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

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
        .maybeSingle();

    if (error || !data) {
        alert("게시글을 불러오지 못했습니다.");
        return;
    }

    document.getElementById("title").innerText = data.title;
    document.getElementById("writer").innerText = data.writer;
    document.getElementById("date").innerText = data.created_at.split("T")[0];
    document.getElementById("content").innerText = data.content;
    document.getElementById("views").innerText = data.views + 1;

    // 조회수 증가
    await supabase.from("qna").update({ views: data.views + 1 }).eq("id", postId);

    // 수정/삭제 권한
    if (loggedUser && (loggedUser.id === data.writer || loggedUser.role === "admin")) {
        document.getElementById("editBtn").style.display = "inline-block";
        document.getElementById("deleteBtn").style.display = "inline-block";
    }

    document.getElementById("editBtn").onclick = () => {
        location.href = `qna_edit.html?id=${postId}`;
    };
    document.getElementById("deleteBtn").onclick = deletePost;

    // 첨부파일 표시
    if (data.file_url) renderFileBox(data.file_url);
}


// ============================
// ✔ 첨부파일 표시
// ============================
function renderFileBox(url) {
    const box = document.getElementById("fileBox");
    box.style.display = "block";

    const fileName = url.split("/").pop().toLowerCase();

    // 이미지면 미리보기
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        box.innerHTML = `
            <p>📎 첨부 이미지</p>
            <img src="${url}" class="view-img" id="viewImage">
        `;

        // 클릭하면 확대
        document.getElementById("viewImage").onclick = () => openImageModal(url);

    } else {
        // 일반 파일 (PDF, HWP 등)
        box.innerHTML = `
            <p>📎 첨부 파일</p>
            <a href="${url}" target="_blank">${fileName}</a>
        `;
    }
}


// ============================
// ✔ 이미지 확대 모달
// ============================
function openImageModal(url) {
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImage");
    modalImg.src = url;

    modal.style.display = "flex";

    modal.onclick = () => {
        modal.style.display = "none";
    };
}


// ============================
// ✔ 게시글 삭제
// ============================
async function deletePost() {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    await supabase.from("qna").delete().eq("id", postId);
    alert("삭제되었습니다.");
    location.href = "qna.html";
}


// ============================
// ✔ 답글 불러오기
// ============================
async function loadReplies() {
    const { data } = await supabase
        .from("qna_reply")
        .select("*")
        .eq("post_id", postId)
        .order("id");

    const box = document.getElementById("replyList");
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
    if (!loggedUser) {
        alert("로그인이 필요합니다.");
        return;
    }

    const text = document.getElementById("replyInput").value.trim();
    if (!text) {
        alert("내용을 입력해주세요.");
        return;
    }

    await supabase.from("qna_reply").insert({
        post_id: postId,
        writer: loggedUser.id,
        content: text
    });

    document.getElementById("replyInput").value = "";
    loadReplies();
}
