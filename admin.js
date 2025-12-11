// admin.js

let usersData = [];      // 전체 회원 목록
let filteredUsers = [];  // 검색/정렬 후 목록
let editingUserId = null;
let deletingUserId = null;

let currentPage = 1;
const PAGE_SIZE = 10;

document.addEventListener("DOMContentLoaded", () => {
    checkAdmin();
    loadUsers();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", filterUsers);
    }
});


// ==============================
// ✔ 관리자만 접근 가능
// ==============================
function checkAdmin() {
    const logged = JSON.parse(localStorage.getItem("loggedUser"));
    if (!logged || logged.role !== "admin") {
        alert("관리자 전용 페이지입니다.");
        location.href = "index.html";
    }
}


// ==============================
// ✔ 회원 불러오기
// ==============================
async function loadUsers() {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.log(error);
        alert("회원 목록 불러오기 실패");
        return;
    }

    usersData = data;
    filteredUsers = data;

    const countSpan = document.getElementById("userCount");
    if (countSpan) countSpan.innerText = data.length;

    currentPage = 1;
    renderTable();
}


// ==============================
// ✔ 테이블 렌더링 + 페이징
// ==============================
function renderTable() {
    const tbody = document.getElementById("userTable");
    if (!tbody) return;

    tbody.innerHTML = "";

    const total = filteredUsers.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filteredUsers.slice(start, start + PAGE_SIZE);

    pageItems.forEach(u => {
        tbody.innerHTML += `
        <tr>
            <td>${u.id}</td>
            <td>${u.password}</td>
            <td>${u.name}</td>
            <td>${u.major}</td>
            <td>${u.grade}</td>
            <td>${u.class_num}</td>
            <td>${u.number}</td>
            <td>${u.visits ?? 0}</td>

            <td>
                <button class="admin-edit-btn" onclick='openEditModal(${JSON.stringify(u)})'>
                    수정
                </button>
            </td>

            <td>
                <button class="admin-delete-btn" onclick="openDeleteModal('${u.id}')">
                    삭제
                </button>
            </td>
        </tr>`;
    });

    // 페이징 UI 업데이트
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("pagePrev");
    const nextBtn = document.getElementById("pageNext");

    if (pageInfo) {
        pageInfo.innerText = `${currentPage} / ${totalPages}`;
    }

    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
}


// ==============================
// ✔ 페이지 변경
// ==============================
function changePage(dir) {
    currentPage += dir;
    renderTable();
}


// ==============================
// ✔ 검색 기능
// ==============================
function filterUsers() {
    const keyword = document.getElementById("searchInput").value.trim();

    if (!keyword) {
        filteredUsers = usersData;
    } else {
        filteredUsers = usersData.filter(u =>
            (u.id && u.id.includes(keyword)) ||
            (u.name && u.name.includes(keyword))
        );
    }

    currentPage = 1;
    renderTable();
}


// ==============================
// ✔ 정렬 기능
// ==============================
function sortTable(key) {
    filteredUsers.sort((a, b) => {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;
        return 0;
    });
    currentPage = 1;
    renderTable();
}


// ==============================
// ✔ 삭제 (커스텀 모달)
// ==============================
function openDeleteModal(id) {
    deletingUserId = id;
    const modal = document.getElementById("deleteModal");
    if (modal) modal.style.display = "flex";
}

function closeDeleteModal() {
    deletingUserId = null;
    const modal = document.getElementById("deleteModal");
    if (modal) modal.style.display = "none";
}

async function confirmDelete() {
    if (!deletingUserId) return;

    const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", deletingUserId);

    if (error) {
        alert("삭제 실패: " + error.message);
        return;
    }

    alert("삭제 완료");
    closeDeleteModal();
    loadUsers();
}


// ==============================
// ✔ 회원 정보 수정 모달 열기
// ==============================
function openEditModal(user) {
    editingUserId = user.id;

    document.getElementById("edit-id").innerText = user.id;
    document.getElementById("edit-name").value = user.name ?? "";
    document.getElementById("edit-major").value = user.major ?? "";
    document.getElementById("edit-grade").value = user.grade ?? "";
    document.getElementById("edit-class").value = user.class_num ?? "";
    document.getElementById("edit-number").value = user.number ?? "";
    document.getElementById("edit-role").value = user.role ?? "user";
    document.getElementById("edit-password").value = "";

    document.getElementById("editModal").style.display = "flex";
}


// ==============================
// ✔ 회원 수정 모달 닫기
// ==============================
function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    editingUserId = null;
}


// ==============================
// ✔ 수정 내용 저장 (비밀번호 변경 포함)
// ==============================
async function saveUserEdit() {
    if (!editingUserId) return;

    const name = document.getElementById("edit-name").value.trim();
    const major = document.getElementById("edit-major").value;
    const grade = Number(document.getElementById("edit-grade").value);
    const class_num = Number(document.getElementById("edit-class").value);
    const number = Number(document.getElementById("edit-number").value);
    const role = document.getElementById("edit-role").value;
    const newPassword = document.getElementById("edit-password").value.trim();

    const updateData = { name, major, grade, class_num, number, role };

    // 비밀번호 입력되어 있으면 같이 변경
    if (newPassword) {
        updateData.password = newPassword;
    }

    const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", editingUserId);

    if (error) {
        alert("수정 실패: " + error.message);
        return;
    }

    alert("수정 완료!");
    closeEditModal();
    loadUsers();
}
