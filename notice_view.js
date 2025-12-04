// notice_view.js — 공지사항 상세 + 조회수 증가



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

  if (error || !data) {
    console.log("공지 불러오기 오류:", error);
    alert("공지 불러오기 실패");
    return;
  }

  // 기본 정보 표시
  document.getElementById("title").innerText = data.title;
  document.getElementById("writer").innerText = data.writer;
  document.getElementById("date").innerText = data.created_at.split("T")[0];
  document.getElementById("views").innerText = (data.views ?? 0) + 1;

  document.getElementById("content").innerText = data.content;

  // 이미지 출력
  if (data.images && data.images.length) {
    const imgBox = document.getElementById("imageBox") || document.getElementById("imageArea");
    if (imgBox) {
      imgBox.innerHTML = "";
      data.images.forEach(url => {
        imgBox.innerHTML += `<img src="${url}" class="notice-image">`;
      });
    }
  }

  // 파일 출력
  if (data.files && data.files.length) {
    const fileBox = document.getElementById("fileBox") || document.getElementById("fileArea");
    if (fileBox) {
      fileBox.innerHTML = "";
      data.files.forEach(url => {
        const fileName = url.split("/").pop();
        fileBox.innerHTML += `<a href="${url}" download>${fileName}</a>`;
      });
    }
  }

  // ⭐ 조회수 증가 (Q&A랑 같은 안전한 방식)
  await increaseNoticeViews();
  
  // 관리자 권한 표시
  if (user && user.role === "admin") {
    const editBtn = document.getElementById("editBtn");
    const deleteBtn = document.getElementById("deleteBtn");

    if (editBtn && deleteBtn) {
      editBtn.style.display = "inline-block";
      deleteBtn.style.display = "inline-block";

      editBtn.onclick = () => {
        location.href = `notice_edit.html?id=${id}`;
      };

      deleteBtn.onclick = deleteNotice;
    }
  }
}

// 조회수 증가 함수
async function increaseNoticeViews() {
  // 현재 조회수 다시 읽어오기 (동시 접속 대비)
  const { data: current, error: readError } = await supabase
    .from("notice")
    .select("views")
    .eq("id", id)
    .maybeSingle();

  if (readError || !current) {
    console.log("조회수 읽기 오류:", readError);
    return;
  }

  const newViews = (current.views ?? 0) + 1;

  const { error: updateError } = await supabase
    .from("notice")
    .update({ views: newViews })
    .eq("id", id);

  if (updateError) {
    console.log("조회수 증가 실패:", updateError);
    return;
  }

  // 화면에 최신 조회수 반영
  const viewsSpan = document.getElementById("views");
  if (viewsSpan) viewsSpan.innerText = newViews;
}

// 삭제 기능
async function deleteNotice() {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  const { error } = await supabase
    .from("notice")
    .delete()
    .eq("id", id);

  if (error) {
    console.log("삭제 오류:", error);
    alert("삭제 실패");
    return;
  }

  alert("삭제되었습니다.");
  location.href = "notice.html";
}

