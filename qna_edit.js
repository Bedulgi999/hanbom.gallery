// qna_edit.js

const supabase = window.supabase.createClient(
  "https://glmytzfqxdtlhmzbcsgd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
);

const params = new URLSearchParams(location.search);
const postId = params.get("id");

const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

let oldFilePath = null; // 기존 첨부 저장
let newUploadedFile = null; // 새 파일 저장


document.addEventListener("DOMContentLoaded", () => {
    loadPost();

    // 새 파일 선택 시 미리보기
    document.getElementById("fileInput").addEventListener("change", handleFilePreview);
});


// ============================
// ✔ 기존 글 불러오기
// ============================
async function loadPost() {
    const { data, error } = await supabase
        .from("qna")
        .select("*")
        .eq("id", postId)
        .maybeSingle();

    if (error || !data) {
        alert("게시글 불러오기 실패");
        return;
    }

    // 작성자 or admin만 수정 가능
    if (!loggedUser || (loggedUser.id !== data.writer && loggedUser.role !== "admin")) {
        alert("수정 권한이 없습니다");
        location.href = "qna_view.html?id=" + postId;
        return;
    }

    document.getElementById("titleInput").value = data.title;
    document.getElementById("contentInput").value = data.content;

    // 기존 첨부파일 표시
    if (data.file_url) {
        oldFilePath = data.file_url;

        if (data.file_url.match(/\.(jpg|jpeg|png|gif)$/)) {
            document.getElementById("previewImage").src = data.file_url;
            document.getElementById("previewImage").style.display = "block";
        }

        document.getElementById("fileName").innerText = "첨부됨: " + data.file_url.split("/").pop();
        document.getElementById("deleteFileBtn").style.display = "inline-block";
    }
}


// ============================
// ✔ 새 파일 미리보기
// ============================
function handleFilePreview(e) {
    const file = e.target.files[0];
    if (!file) return;

    newUploadedFile = file;

    // 이미지면 미리보기
    if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        document.getElementById("previewImage").src = url;
        document.getElementById("previewImage").style.display = "block";
    } else {
        document.getElementById("previewImage").style.display = "none";
    }

    document.getElementById("fileName").innerText = file.name;
}


// ============================
// ✔ 기존 첨부 삭제
// ============================
async function deleteOldFile() {
    if (!oldFilePath) return;

    const fileName = oldFilePath.split("/").pop();

    await supabase.storage
        .from("qna_uploads")
        .remove([fileName]);

    oldFilePath = null;
}


// ============================
// ✔ 글 저장
// ============================
async function saveEdit() {
    const title = document.getElementById("titleInput").value.trim();
    const content = document.getElementById("contentInput").value.trim();

    if (!title || !content) {
        alert("모든 내용을 입력하세요!");
        return;
    }

    let file_url = oldFilePath;

    // 새 파일 업로드
    if (newUploadedFile) {
        const fileName = `${Date.now()}_${newUploadedFile.name}`;

        const { error: uploadError } = await supabase.storage
            .from("qna_uploads")
            .upload(fileName, newUploadedFile);

        if (uploadError) {
            alert("파일 업로드 실패!");
            return;
        }

        // 기존 파일 삭제
        if (oldFilePath) await deleteOldFile();

        const { data } = supabase.storage
            .from("qna_uploads")
            .getPublicUrl(fileName);

        file_url = data.publicUrl;
    }

    // DB 업데이트
    const { error } = await supabase
        .from("qna")
        .update({ title, content, file_url })
        .eq("id", postId);

    if (error) {
        alert("수정 실패");
        return;
    }

    alert("수정 완료!");
    location.href = "qna_view.html?id=" + postId;
}


// ============================
// ✔ 첨부 삭제 버튼 눌렀을 때
// ============================
document.getElementById("deleteFileBtn").addEventListener("click", async () => {
    if (!confirm("첨부파일을 삭제하시겠습니까?")) return;

    await deleteOldFile();

    oldFilePath = null;
    newUploadedFile = null;

    document.getElementById("previewImage").style.display = "none";
    document.getElementById("fileName").innerText = "";
    document.getElementById("fileInput").value = "";
    document.getElementById("deleteFileBtn").style.display = "none";
});
