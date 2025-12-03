// free_view.js — 자유게시판 상세보기

const supabase = window.supabase.createClient(
    "https://glmytzfqxdtlhmzbcsgd.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
  );
  
  const params = new URLSearchParams(location.search);
  const postId = params.get("id");
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  
  document.addEventListener("DOMContentLoaded", () => {
    loadPost();
    applyHeaderAuthUI();
  });
  
  // 헤더 로그인/로그아웃 UI
  function applyHeaderAuthUI() {
    const authBox = document.getElementById("authButtons");
    const adminBox = document.getElementById("adminButtons");
  
    if (!loggedUser) return;
  
    if (authBox) authBox.style.display = "none";
  
    const logoutBtn = document.createElement("button");
    logoutBtn.className = "btn-logout";
    logoutBtn.textContent = "로그아웃";
    logoutBtn.onclick = () => {
      localStorage.removeItem("loggedUser");
      alert("로그아웃 되었습니다.");
      location.href = "index.html";
    };
    if (adminBox) adminBox.appendChild(logoutBtn);
  
    if (loggedUser.role === "admin") {
      const manageBtn = document.createElement("a");
      manageBtn.textContent = "계정관리";
      manageBtn.href = "admin.html";
      manageBtn.className = "btn-login";
      adminBox.appendChild(manageBtn);
    }
  }
  
  // 게시글 불러오기
  async function loadPost() {
    const { data, error } = await supabase
      .from("free")
      .select("*")
      .eq("id", postId)
      .maybeSingle();
  
    if (error || !data) {
      console.log(error);
      alert("게시글을 불러오지 못했습니다.");
      return;
    }
  
    // 기본 정보 표시
    document.getElementById("title").innerText = data.title;
    document.getElementById("writer").innerText = data.writer;
    document.getElementById("date").innerText = data.created_at.split("T")[0];
    document.getElementById("content").innerText = data.content;
  
    // 조회수 UI는 +1 해서 표시
    document.getElementById("views").innerText = (data.views ?? 0) + 1;
  
    // 이미지 렌더링 (URL 배열)
    const imageArea = document.getElementById("imageArea");
    imageArea.innerHTML = "";
    (data.images || []).forEach((url) => {
      imageArea.innerHTML += `
        <div class="view-image-item">
          <img src="${url}" onclick="window.open('${url}')" />
        </div>
      `;
    });
  
    // 파일 렌더링
    const fileArea = document.getElementById("fileArea");
    fileArea.innerHTML = "";
    (data.files || []).forEach((url) => {
      const fileName = url.split("/").pop();
      fileArea.innerHTML += `
        <li class="file-item">
          <span>📄</span>
          <a href="${url}" download>${fileName}</a>
        </li>
      `;
    });
  
    // 조회수 증가
    await increaseViews(data.views ?? 0);
  
    // 수정/삭제 권한 (작성자 또는 관리자)
    if (loggedUser && (loggedUser.id === data.writer || loggedUser.role === "admin")) {
      const editBtn = document.getElementById("editBtn");
      const delBtn = document.getElementById("deleteBtn");
  
      editBtn.style.display = "inline-block";
      delBtn.style.display = "inline-block";
  
      editBtn.onclick = () => {
        location.href = `free_edit.html?id=${postId}`;
      };
  
      delBtn.onclick = deletePost;
    }
  }
  
  // 조회수 증가
  async function increaseViews(currentViews) {
    const newViews = (currentViews || 0) + 1;
  
    const { error } = await supabase
      .from("free")
      .update({ views: newViews })
      .eq("id", postId);
  
    if (error) {
      console.log("조회수 증가 실패:", error);
    }
  }
  
  // 게시글 삭제
  async function deletePost() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
  
    const { error } = await supabase
      .from("free")
      .delete()
      .eq("id", postId);
  
    if (error) {
      alert("삭제 실패!");
      return;
    }
  
    alert("삭제되었습니다.");
    location.href = "free.html";
  }
  