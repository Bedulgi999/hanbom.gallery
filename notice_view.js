// Supabase 연결
const supabase = window.supabase.createClient(
  "https://glmytzfqxdtlhmzbcsgd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
);

const params = new URLSearchParams(location.search);
const id = params.get("id");

const user = JSON.parse(localStorage.getItem("loggedUser"));

document.addEventListener("DOMContentLoaded", () => {
  loadNotice();
});

// 공지 불러오기
async function loadNotice() {
  const { data, error } = await supabase
    .from("notice")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return alert("공지 불러오기 실패");

  document.getElementById("title").innerText = data.title;
  document.getElementById("writer").innerText = data.writer;
  document.getElementById("date").innerText = data.created_at.split("T")[0];
  document.getElementById("views").innerText = data.views + 1;
  document.getElementById("content").innerText = data.content;

  // 이미지 출력
  if (data.images?.length) {
    const imgBox = document.getElementById("imageBox");
    data.images.forEach(url => {
      imgBox.innerHTML += `<img src="${url}" class="notice-image">`;
    });
  }

  // 파일 출력
  if (data.files?.length) {
    const fileBox = document.getElementById("fileBox");
    data.files.forEach(url => {
      const fileName = url.split("_").pop();
      fileBox.innerHTML += `<a href="${url}" download>${fileName}</a>`;
    });
  }

  // 조회수 증가
  await supabase
    .from("notice")
    .update({ views: data.views + 1 })
    .eq("id", id);

  // 관리자 권한 표시
  if (user && user.role === "admin") {
    document.getElementById("editBtn").style.display = "inline-block";
    document.getElementById("deleteBtn").style.display = "inline-block";

    document.getElementById("editBtn").onclick = () => {
      location.href = `notice_edit.html?id=${id}`;
    };

    document.getElementById("deleteBtn").onclick = deleteNotice;
  }
}

// 삭제 기능
async function deleteNotice() {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  await supabase.from("notice").delete().eq("id", id);

  alert("삭제되었습니다.");
  location.href = "notice.html";
}
