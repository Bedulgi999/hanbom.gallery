const supabase = window.supabase.createClient(
  "https://glmytzfqxdtlhmzbcsgd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
);

const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

if (!loggedUser) {
    alert("로그인이 필요합니다.");
    location.href = "login.html";
}

async function savePost() {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    if (!title || !content) {
        alert("제목과 내용을 입력하세요");
        return;
    }

    await supabase.from("qna").insert({
        title,
        content,
        writer: loggedUser.id
    });

    alert("등록 완료!");
    location.href = "qna.html";
}
