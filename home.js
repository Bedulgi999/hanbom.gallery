// ------------------------------
// HOME.JS — 홈 페이지 전용
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // 인증 버튼 렌더링 (로그인/회원가입 또는 로그아웃)
    renderAuthButtons();
    
    // 스크롤 애니메이션 효과
    initScrollAnimations();
});

// =============================
// 스크롤 애니메이션
// =============================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 애니메이션 대상 요소들
    const animateElements = document.querySelectorAll('.feature-card, .school-content, .cta-container');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}
