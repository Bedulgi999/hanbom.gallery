// qna_edit.js

const params = new URLSearchParams(location.search);
const postId = params.get("id");

let oldImages = [];
LetOldFiles = [];
let newImages = [];
let newFiles = [];

// 로드
document.addEventListener("DOMContentLoaded", () => {
    loadPost();
    setupUploadHandlers();
});

// 게시글 로드
async function loadPost() {
    const { data } = await supabase
        .from("qna")
        .select("*")
        .eq("id", postId)
        .single();

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

// 기존 삭제
function removeOldImage(idx) {
    oldImages.splice(idx, 1);
    renderOldImages();
}

// 파일 표시
function renderOldFiles() {
    const list = document.getElementById("fileList");
    list.innerHTML = "";

    oldFiles.forEach((url, idx) => {
        list.innerHTML += `
            <li class="file-item">
                <span>📄 ${url.split("/").pop()}</span>
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
    // 이미지
    imgDropBox.addEventListener("click", () => imgUpload.click());
    imgUpload.addEventListener("change", () => {
        [...imgUpload.files].forEach(file => newImages.push(file));
        renderNewImages();
    });

    // 파일
    fileDropBox.addEventListener("click", () => fileUpload.click());
    fileUpload.addEventListener("change", () => {
        [...fileUpload.files].forEach(file => newFiles.push(file));
        renderNewFiles();
    });
}

// 새 이미지 미리보기
function renderNewImages() {
    const area = document.getElementById("previewImages");

    newImages.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = e => {
            const box = document.createElement("div");
            box.className = "preview-item";
            box.innerHTML = `
                <img src="${e.target.result}" class="preview-img">
                <button class="remove-img-btn" onclick="removeNewImage(${idx})">&times;</button>
            `;
            area.appendChild(box);
        };
        reader.readAsDataURL(file);
    });
}

function removeNewImage(idx) {
    newImages.splice(idx, 1);
    renderNewImages();
}

// 새 파일 목록
function renderNewFiles() {
    const list = document.getElementById("fileList");

    newFiles.forEach((file, idx) => {
        list.innerHTML += `
            <li class="file-item">
                <span>📄 ${file.name}</span>
                <button class="remove-file-btn" onclick="removeNewFile(${idx})">&times;</button>
            </li>
        `;
    });
}

function removeNewFile(idx) {
    newFiles.splice(idx, 1);
    renderNewFiles();
}

// 파일 업로드 helper
async function uploadToStorage(file, folder) {
    const filename = `${Date.now()}_${file.name}`;
    const path = `${folder}/${filename}`;

    const { error } = await supabase.storage
        .from("qna_uploads")
        .upload(path, file);

    if (error) console.error(error);

    return `https://glmytzfqxdtlhmzbcsgd.supabase.co/storage/v1/object/public/qna_uploads/${path}`;
}

// 수정 저장
async function updateQna() {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    let uploadedImages = [...oldImages];
    let uploadedFiles = [...oldFiles];

    // 새 이미지 업로드
    for (const img of newImages) {
        uploadedImages.push(await uploadToStorage(img, "images"));
    }

    // 새 파일 업로드
    for (const file of newFiles) {
        uploadedFiles.push(await uploadToStorage(file, "files"));
    }

    const { error } = await supabase
        .from("qna")
        .update({
            title,
            content,
            images: uploadedImages,
            files: uploadedFiles
        })
        .eq("id", postId);

    if (error) {
        alert("수정 실패!");
        return;
    }

    alert("수정 완료!");
    location.href = `qna_view.html?id=${postId}`;
}
