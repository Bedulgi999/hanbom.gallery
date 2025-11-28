// ===============================
// notice.js — FULL VERSION
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    let notices = JSON.parse(localStorage.getItem("notices")) || [];

    // 🔥 Notice Write 페이지에서 저장하기 버튼 처리
    const saveBtn = document.getElementById("save-notice");
    if (saveBtn) {
        // 관리자 검증
        if (!loggedUser || loggedUser.id !== "admin") {
            alert("접근 권한이 없습니다.");
            location.href = "notice.html";
            return;
        }

        saveBtn.addEventListener("click", () => {
            const title = document.getElementById("notice-title").value.trim();
            const content = document.getElementById("notice-content").value.trim();
            const pinned = document.getElementById("notice-pin").checked;

            if (!title || !content) {
                alert("제목과 내용을 모두 입력해주세요!");
                return;
            }

            const today = new Date().toISOString().split("T")[0];

            const newNotice = {
                title,
                content,
                writer: loggedUser.id,
                date: today,
                views: 0,
                pinned
            };

            // 리스트에 추가
            notices.unshift(newNotice);
            localStorage.setItem("notices", JSON.stringify(notices));

            alert("공지 등록 완료!");
            location.href = "notice.html";
        });
    }

    // ===============================
    // notice.html 페이지 (공지 목록 + 검색 + pagination)
    // ===============================

    const listBox = document.getElementById("notice-list");
    const paginationBox = document.getElementById("pagination");
    const searchTitle = document.getElementById("noticeSearch");
    const searchWriter = document.getElementById("searchWriter");
    const searchDate = document.getElementById("searchDate");

    const writeBtn = document.querySelector(".notice-write-btn");

    // 🔥 관리자만 작성버튼 표시
    if (writeBtn) {
        if (loggedUser && loggedUser.id === "admin") writeBtn.style.display = "inline-flex";
    }

    if (listBox) {

        // 🔥 pinned(상단고정) 먼저 정렬
        notices.sort((a, b) => b.pinned - a.pinned);

        let currentPage = 1;
        const perPage = 5;

        function renderList(list) {
            let start = (currentPage - 1) * perPage;
            let end = start + perPage;

            let html = "";

            list.slice(start, end).forEach((n, i) => {
                let realIndex = notices.indexOf(n);

                html += `
                <tr class="notice-row">
                    <td>${n.pinned ? "[공지]📌" : "[공지]"}</td>
                    <td><a href="notice_view.html?id=${realIndex}">${n.title}</a></td>
                    <td>${n.writer}</td>
                    <td>${n.date}</td>
                    <td>${n.views}</td>
                </tr>`;
            });

            listBox.innerHTML = html;
        }

        function renderPagination(list) {
            let totalPages = Math.ceil(list.length / perPage);
            paginationBox.innerHTML = "";

            for (let i = 1; i <= totalPages; i++) {
                let btn = document.createElement("button");
                btn.className = "page-btn";
                btn.textContent = i;

                if (i === currentPage) btn.classList.add("active");

                btn.addEventListener("click", () => {
                    currentPage = i;
                    renderList(list);
                    renderPagination(list);
                });

                paginationBox.appendChild(btn);
            }
        }

        function applyFilters() {
            const keyword = searchTitle ? searchTitle.value.trim() : "";
            const writer = searchWriter ? searchWriter.value.trim() : "";
            const date = searchDate ? searchDate.value : "";

            let filtered = notices.filter(n =>
                (keyword === "" || n.title.includes(keyword) || n.content.includes(keyword)) &&
                (writer === "" || n.writer.includes(writer)) &&
                (date === "" || n.date === date)
            );

            currentPage = 1;
            renderList(filtered);
            renderPagination(filtered);
        }

        // 이벤트 등록
        if (searchTitle) searchTitle.addEventListener("input", applyFilters);
        if (searchWriter) searchWriter.addEventListener("input", applyFilters);
        if (searchDate) searchDate.addEventListener("change", applyFilters);

        // 첫 렌더링
        renderList(notices);
        renderPagination(notices);
    }
});
