// register.js — Supabase 회원가입

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll("input, select");

    const id       = inputs[0].value.trim();
    const password = inputs[1].value.trim();
    const name     = inputs[2].value.trim();
    const major    = inputs[3].value;
    const grade    = inputs[4].value;
    const classNum = inputs[5].value;
    const number   = inputs[6].value;

    // 기본 체크
    if (!id || !password || !name || !major || !grade || !classNum || !number) {
      alert("모든 항목을 입력해주세요!");
      return;
    }

    // 아이디 최소 길이 같은 간단 검증
    if (id.length < 3) {
      alert("아이디는 3글자 이상 입력해주세요.");
      return;
    }

    // 1) 아이디 중복 체크
    const { data: exist, error: existError } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existError) {
      console.log(existError);
      alert("중복 체크 중 오류가 발생했습니다.");
      return;
    }

    if (exist) {
      alert("이미 존재하는 아이디입니다!");
      return;
    }

    // 2) INSERT 할 데이터
    const newUser = {
      id,
      password,
      name,
      major,
      grade: Number(grade),
      class_num: Number(classNum),
      number: Number(number),
      posts: 0,
      comments: 0,
      visits: 0,
      role: id === "admin" ? "admin" : "user"
    };

    // 3) Supabase INSERT
    const { error } = await supabase
      .from("users")
      .insert(newUser);

    if (error) {
      console.log(error);
      alert("회원가입 실패: " + error.message);
      return;
    }

    alert("회원가입 완료! 로그인 페이지로 이동합니다.");
    location.href = "login.html";
  });
});
