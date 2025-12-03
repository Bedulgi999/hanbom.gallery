// Supabase 연결
const supabase = window.supabase.createClient(
  "https://glmytzfqxdtlhmzbcsgd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
);

const imgDrop = document.getElementById("imgDropBox");
const imgUpload = document.getElementById("imgUpload");
const imgPreview = document.getElementById("previewImages");

let selectedImages = [];
let selectedFiles = [];

imgDrop.onclick = () => imgUpload.click();
imgUpload.onchange = () => {
  [...imgUpload.files].forEach(f => previewImage(f));
};

function previewImage(file) {
  selectedImages.push(file);

  const reader = new FileReader();
  reader.onload = e => {
    const box = document.createElement("div");
    box.className = "preview-item";
    box.innerHTML = `
      <img src="${e.target.result}" class="preview-img">
      <button class="remove-img-btn">&times;</button>
    `;
    box.querySelector("button").onclick = () => {
      selectedImages = selectedImages.filter(x => x !== file);
      box.remove();
    };
    imgPreview.appendChild(box);
  };
  reader.readAsDataURL(file);
}

// 파일 업로드
const fileDrop = document.getElementById("fileDropBox");
const fileUpload = document.getElementById("fileUpload");
const fileList = document.getElementById("fileList");

fileDrop.onclick = () => fileUpload.click();
fileUpload.onchange = () => {
  [...fileUpload.files].forEach(f => addFile(f));
};

function addFile(file) {
  selectedFiles.push(file);

  const li = document.createElement("li");
  li.className = "file-item";
  li.innerHTML = `
    <span class="file-icon">📄</span>
    <span>${file.name}</span>
    <button class="remove-file-btn">&times;</button>
  `;
  li.querySelector("button").onclick = () => {
    selectedFiles = selectedFiles.filter(x => x !== file);
    li.remove();
  };
  fileList.appendChild(li);
}

// 공지 등록
async function submitNotice() {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  if (!user || user.role !== "admin") return alert("관리자만 작성할 수 있습니다!");

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) return alert("제목과 내용을 입력해주세요.");

  // ===========================
  // 1) 이미지 업로드
  // ===========================
  let uploadedImages = [];
  for (const file of selectedImages) {
    const fileName = Date.now() + "_" + file.name;

    const { data, error } = await supabase.storage
      .from("qna_uploads")
      .upload(fileName, file);

    if (error) console.log(error);
    else uploadedImages.push(
      `https://glmytzfqxdtlhmzbcsgd.supabase.co/storage/v1/object/public/qna_uploads/${fileName}`
    );
  }

  // ===========================
  // 2) 파일 업로드
  // ===========================
  let uploadedFiles = [];
  for (const file of selectedFiles) {
    const fileName = Date.now() + "_" + file.name;

    const { data, error } = await supabase.storage
      .from("qna_uploads")
      .upload(fileName, file);

    if (error) console.log(error);
    else uploadedFiles.push(
      `https://glmytzfqxdtlhmzbcsgd.supabase.co/storage/v1/object/public/qna_uploads/${fileName}`
    );
  }

  // ===========================
  // 3) DB 저장
  // ===========================
  const { error } = await supabase.from("notice").insert({
    title,
    content,
    writer: user.id,
    views: 0,
    images: uploadedImages,
    files: uploadedFiles
  });

  if (error) {
    console.log(error);
    return alert("등록 실패!");
  }

  alert("공지 등록 완료!");
  location.href = "notice.html";
}
