// Supabase 연결
const supabase = window.supabase.createClient(
  "https://glmytzfqxdtlhmzbcsgd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
);

// HTML 요소 불러오기
const imgDropBox = document.getElementById("imgDropBox");
const imgUpload = document.getElementById("imgUpload");
const previewArea = document.getElementById("previewImages");
const fileDropBox = document.getElementById("fileDropBox");
const fileUpload = document.getElementById("fileUpload");
const fileList = document.getElementById("fileList");

// 요소가 없으면 중단 (오류 방지)
if (!imgDropBox || !imgUpload || !previewArea || !fileDropBox || !fileUpload || !fileList) {
    console.error("❌ qna_write.js: 필요한 HTML 요소가 존재하지 않습니다.");
}

// ===== 이미지 업로드 =====
if (imgDropBox) {
    imgDropBox.addEventListener("click", () => imgUpload.click());
}

if (imgUpload) {
    imgUpload.addEventListener("change", () => {
        [...imgUpload.files].forEach(file => previewImage(file));
    });
}

function previewImage(file) {
    if (!previewArea) return;
// qna_write.js — JSONB 이미지/파일 저장

const supabase = window.supabase.createClient(
  "https://glmytzfqxdtlhmzbcsgd.supabase.co",
  "YOUR_ANON_KEY"
);

const user = JSON.parse(localStorage.getItem("loggedUser"));
if (!user) {
  alert("로그인 후 작성 가능합니다!");
  location.href = "login.html";
}

let imageFiles = [];
let generalFiles = [];

// -----------------------
// 이미지 선택 처리
// -----------------------
document.getElementById("imgUpload").addEventListener("change", (e) => {
  imageFiles = [...e.target.files];
});

// -----------------------
// 파일 선택 처리
// -----------------------
document.getElementById("fileUpload").addEventListener("change", (e) => {
  generalFiles = [...e.target.files];
});

// -----------------------
// Supabase 스토리지 업로드
// -----------------------
async function uploadToBucket(files, folderName) {
  if (!files.length) return [];

  let uploaded = [];

  for (let file of files) {
    const filePath = `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from("qna_uploads")
      .upload(`${folderName}/${filePath}`, file);

    if (!error) {
      const { data: urlData } = supabase.storage
        .from("qna_uploads")
        .getPublicUrl(`${folderName}/${filePath}`);

      uploaded.push({
        name: file.name,
        url: urlData.publicUrl,
        size: file.size
      });
    }
  }

  return uploaded; // JSONB 구조
}

// -----------------------
// QNA 등록
// -----------------------
async function submitQna() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) {
    alert("제목과 내용을 입력하세요!");
    return;
  }

  // 1) 이미지 업로드
  const uploadedImages = await uploadToBucket(imageFiles, "images");

  // 2) 파일 업로드
  const uploadedFiles = await uploadToBucket(generalFiles, "files");

  // 3) Supabase DB INSERT
  const { error } = await supabase.from("qna").insert({
    title,
    content,
    writer: user.id,
    views: 0,
    images: uploadedImages,  // JSONB 저장
    files: uploadedFiles     // JSONB 저장
  });

  if (error) {
    console.error(error);
    alert("등록 실패!");
    return;
  }

  alert("등록 완료!");
  location.href = "qna.html";
}

    const reader = new FileReader();
    reader.onload = e => {
        const box = document.createElement("div");
        box.className = "preview-item";
        box.innerHTML = `
          <img src="${e.target.result}" class="preview-img">
          <button class="remove-img-btn">&times;</button>
        `;
        box.querySelector(".remove-img-btn").addEventListener("click", () => box.remove());
        box.fileObj = file;
        previewArea.appendChild(box);
    };
    reader.readAsDataURL(file);
}


// ===== 파일 업로드 =====
if (fileDropBox) {
    fileDropBox.addEventListener("click", () => fileUpload.click());
}

if (fileUpload) {
    fileUpload.addEventListener("change", () => {
        [...fileUpload.files].forEach(file => addFileItem(file));
    });
}

function addFileItem(file) {
    if (!fileList) return;

    const li = document.createElement("li");
    li.className = "file-item";
    li.innerHTML = `
        <span class="file-icon">📄</span>
        <span>${file.name}</span>
        <button class="remove-file-btn">&times;</button>
    `;
    li.querySelector(".remove-file-btn").addEventListener("click", () => li.remove());
    li.fileObj = file;
    fileList.appendChild(li);
}


// ===== Storage 업로드 =====
async function uploadToStorage(file) {
    const filePath = `${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
        .from("qna_uploads")
        .upload(filePath, file);

    if (error) {
        console.error("업로드 실패:", error);
        return null;
    }

    return supabase.storage.from("qna_uploads").getPublicUrl(filePath).data.publicUrl;
}


// ===== 등록하기 =====
async function submitQna() {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const user = JSON.parse(localStorage.getItem("loggedUser"));

    if (!user) return alert("로그인이 필요합니다!");
    if (!title || !content) return alert("제목과 내용을 입력하세요!");

    // 이미지 업로드
    let images = [];
    if (previewArea) {
        const items = previewArea.querySelectorAll(".preview-item");
        for (let box of items) {
            const file = box.fileObj;
            const url = await uploadToStorage(file);
            if (url) images.push(url);
        }
    }

    // 파일 업로드
    let files = [];
    if (fileList) {
        const items = fileList.querySelectorAll(".file-item");
        for (let li of items) {
            const file = li.fileObj;
            const url = await uploadToStorage(file);
            if (url) files.push(url);
        }
    }

    // QNA 저장
    const { error } = await supabase.from("qna").insert({
        title,
        content,
        writer: user.id,
        images,
        files
    });

    if (error) {
        console.error(error);
        return alert("등록 실패!");
    }

    alert("등록 완료!");
    location.href = "qna.html";
}
