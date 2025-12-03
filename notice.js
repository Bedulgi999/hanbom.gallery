// Supabase 연결
const supabase = window.supabase.createClient(
  "https://glmytzfqxdtlhmzbcsgd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
);

document.addEventListener("DOMContentLoaded", () => {
  loadAuthButtons();
  loadNoticeList();
  loadSidebarNotice();
  loadTopPosts();
});

// 로그인 UI 표시
function loadAuthButtons() {
    const box = document.getElementById("authBox");
    const user = JSON.parse(localStorage.getItem("loggedUser"));

    if (!user) {
        box.innerHTML = `
          <a href="login.html" class="btn-login">로그인</a>
          <a href="register.html" class="btn-signup">회원가입</a>
        `;
    } else {
        box.innerHTML = `
          <button class="btn-login" onclick="logout()">로그아웃</button>
        `;
        if (user.role === "admin") {
            document.getElementById("writeNoticeBtn").style.display = "inline-block";
            document.getElementById("writeNoticeBtn").onclick = () => {
              location.href = "notice_write.html";
            };
        }
    }
}

function logout() {
    localStorage.removeItem("loggedUser");
    location.reload();
}

// 공지 목록 로드
async function loadNoticeList() {
  const { data, error } = await supabase
    .from("notice")
    .select("*")
    .order("id", { ascending: false });

  if (error) return console.log(error);

  const list = document.getElementById("noticeList");
  list.innerHTML = "";

  data.forEach(n => {
    list.innerHTML += `
      <tr onclick="location.href='notice_view.html?id=${n.id}'" style="cursor:pointer">
        <td>[공지]</td>
        <td>${n.title}</td>
        <td>${n.writer}</td>
        <td>${n.created_at.split("T")[0]}</td>
        <td>${n.views}</td>
      </tr>
    `;
  });
}

// 사이드바 최신 공지 3개
async function loadSidebarNotice() {
  const { data } = await supabase
    .from("notice")
    .select("id, title")
    .order("id", { ascending: false })
    .limit(3);

  const box = document.getElementById("sidebarNotice");
  box.innerHTML = "";

  data.forEach(n => {
    box.innerHTML += `
      <li onclick="location.href='notice_view.html?id=${n.id}'" style="cursor:pointer">
        [공지] ${n.title}
      </li>
    `;
  });
}

// 인기글 (조회수 TOP5)
async function loadTopPosts() {
  const { data } = await supabase
    .from("qna")
    .select("id, title, views")
    .order("views", { ascending: false })
    .limit(5);

  const box = document.getElementById("topPosts");
  box.innerHTML = "";

  data.forEach((p, i) => {
    box.innerHTML += `
      <li onclick="location.href='qna_view.html?id=${p.id}'" style="cursor:pointer">
        ${i + 1}. ${p.title}
      </li>
    `;
  });
}
