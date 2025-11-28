document.addEventListener("DOMContentLoaded", ()=>{

    const btn = document.getElementById("save-post");
    if(!btn) return;

    const user = JSON.parse(localStorage.getItem("loggedUser"));
    if(!user){
        alert("로그인이 필요합니다");
        location.href="login.html";
        return;
    }

    btn.addEventListener("click", ()=>{
        let category = document.getElementById("category").value;
        let title = document.getElementById("title").value.trim();
        let content = document.getElementById("content").value.trim();

        if(!title || !content){
            alert("제목과 내용을 입력하세요!");
            return;
        }

        let posts = JSON.parse(localStorage.getItem("posts")) || [];
        let today = new Date().toISOString().split("T")[0];

        posts.unshift({
            category,
            title,
            content,
            writer:user.id,
            date:today,
            views:0
        });

        localStorage.setItem("posts", JSON.stringify(posts));

        alert("글이 등록되었습니다!");
        location.href="index.html";
    });
});
