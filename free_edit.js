// free_edit.js — 자유게시판 글 수정

const params = new URLSearchParams(location.search);
const postId = params.get("id");
const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

let oldImages = [];
let oldFiles = [];
let newImages = [];
let newFiles = [];

document.addEventListener("DOMContentLoaded", () => {
  if (!loggedUser) {
    alert("로그인 후 이용 가능합니다.");
    location.href = "login.html";
    return;
  }
  loadPost();
  setupUploadHandlers();
});

// 게시글 로드
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

  // 작성자/관리자 확인
  if (loggedUser.id !== data.writer && loggedUser.role !== "admin") {
    alert("수정 권한이 없습니다.");
    location.href = "free.html";
    return;
  }

  document.getElementById("title").value = data.title;
  document.getElementById("content").value = data.content;

  oldImages = data.images || [];
  oldFiles = data.files || [];

  renderOldImages();
  renderOldFiles();
}

// 기존 이미지 표시
function renderOldImages() {
  const area = document.getElementById("previewImages");
  area.innerHTML = "";

  oldImages.forEach((url, idx) => {
    const box = document.createElement("div");
    box.className = "preview-item";
    box.innerHTML = `
      <img src="${url}" class="preview-img">
      <button class="remove-img-btn" onclick="removeOldImage(${idx})">&times;</button>
    `;
    area.appendChild(box);
  });
}

function removeOldImage(idx) {
  oldImages.splice(idx, 1);
  renderOldImages();
}

// 기존 파일 표시
function renderOldFiles() {
  const list = document.getElementById("fileList");
  list.innerHTML = "";

  oldFiles.forEach((url, idx) => {
    const fileName = url.split("/").pop();
    list.innerHTML += `
      <li class="file-item">
        <span class="file-icon">📄</span>
        <span>${fileName}</span>
        <button class="remove-file-btn" onclick="removeOldFile(${idx})">&times;</button>
      </li>
    `;
  });
}

function removeOldFile(idx) {
  oldFiles.splice(idx, 1);
  renderOldFiles();
}

// 업로드 핸들러
function setupUploadHandlers() {
  const imgDropBox = document.getElementById("imgDropBox");
  const imgUpload = document.getElementById("imgUpload");
  const fileDropBox = document.getElementById("fileDropBox");
  const fileUpload = document.getElementById("fileUpload");

  const previewArea = document.getElementById("previewImages");
  const fileList = document.getElementById("fileList");

  // 이미지
  if (imgDropBox && imgUpload) {
    imgDropBox.addEventListener("click", () => imgUpload.click());
    imgUpload.addEventListener("change", () => {
      [...imgUpload.files].forEach(file => {
        newImages.push(file);
        previewNewImage(file);
      });
    });
  }

  function previewNewImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const box = document.createElement("div");
      box.className = "preview-item";
      box.innerHTML = `
        <img src="${e.target.result}" class="preview-img">
        <button class="remove-img-btn">&times;</button>
      `;
      box.querySelector(".remove-img-btn").onclick = () => {
        newImages = newImages.filter(f => f !== file);
        box.remove();
      };
      previewArea.appendChild(box);
    };
    reader.readAsDataURL(file);
  }

  // 파일
  if (fileDropBox && fileUpload) {
    fileDropBox.addEventListener("click", () => fileUpload.click());
    fileUpload.addEventListener("change", () => {
      [...fileUpload.files].forEach(file => {
        newFiles.push(file);
        addNewFileItem(file);
      });
    });
  }

  function addNewFileItem(file) {
    const li = document.createElement("li");
    li.className = "file-item";
    li.innerHTML = `
      <span class="file-icon">📄</span>
      <span>${file.name}</span>
      <button class="remove-file-btn">&times;</button>
    `;
    li.querySelector(".remove-file-btn").onclick = () => {
      newFiles = newFiles.filter(f => f !== file);
      li.remove();
    };
    fileList.appendChild(li);
  }
}

// Storage 업로드 (free_write와 동일 구조)
async function uploadToStorage(file, folder) {
  const fileName = Date.now() + "_" + file.name;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(`${folder}/${fileName}`, file);

  if (error) {
    console.error(error);
    return null;
  }

  return supabase.storage
    .from("uploads")
    .getPublicUrl(`${folder}/${fileName}`).data.publicUrl;
}

// 수정 저장
async function updateFree() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }

  let uploadedImages = [...oldImages];
  let uploadedFiles = [...oldFiles];

  // 새 이미지 업로드
  for (const img of newImages) {
    const url = await uploadToStorage(img, "free_images");
    if (url) uploadedImages.push(url);
  }

  // 새 파일 업로드
  for (const file of newFiles) {
    const url = await uploadToStorage(file, "free_files");
    if (url) uploadedFiles.push(url);
  }

  const { error } = await supabase
    .from("free")
    .update({
      title,
      content,
      images: uploadedImages,
      files: uploadedFiles
    })
    .eq("id", postId);

  if (error) {
    console.error(error);
    alert("수정 실패!");
    return;
  }

  alert("수정 완료!");
  location.href = `free_view.html?id=${postId}`;
}
