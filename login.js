// login.js — Supabase 로그인 (여러 로그인 폼 지원)

document.addEventListener("DOMContentLoaded", () => {
  const loginForms = document.querySelectorAll(".login-form");
  if (loginForms.length === 0) return;

  loginForms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const idInput = form.querySelector('input[type="text"]');
      const pwInput = form.querySelector('input[type="password"]');

      const id = idInput.value.trim();
      const pw = pwInput.value.trim();

      // 입력값 체크
      if (!id && !pw) {
        alert("아이디와 비밀번호를 모두 입력해주세요!");
        return;
      }
      if (!id) {
        alert("아이디를 입력해주세요!");
        return;
      }
      if (!pw) {
        alert("비밀번호를 입력해주세요!");
        return;
      }

      // 1) DB에서 해당 아이디 찾기
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.log(error);
        alert("로그인 중 오류가 발생했습니다.");
        return;
      }

      if (!user) {
        alert("존재하지 않는 계정입니다!");
        return;
      }

      // 2) 비밀번호 확인
      if (user.password !== pw) {
        alert("비밀번호가 올바르지 않습니다!");
        return;
      }

      // 3) 방문수 +1 업데이트
      const newVisits = (user.visits ?? 0) + 1;
      await supabase
        .from("users")
        .update({ visits: newVisits })
        .eq("id", id);

      // 4) localStorage에 로그인 정보 저장
      const loggedUser = {
        id: user.id,
        name: user.name,
        major: user.major,
        grade: user.grade,
        class_num: user.class_num,
        number: user.number,
        posts: user.posts ?? 0,
        comments: user.comments ?? 0,
        visits: newVisits,
        role: user.role ?? (user.id === "admin" ? "admin" : "user"),
      };

      localStorage.setItem("loggedUser", JSON.stringify(loggedUser));

      alert("로그인 성공!");
      // 어디서 로그인했든 메인으로 이동
      location.href = "index.html";
    });
  });
});
