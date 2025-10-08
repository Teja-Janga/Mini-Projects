
// Add at end of body, or in separate script file
const bttBtn = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
    bttBtn.style.display = (window.scrollY > 250) ? "block" : "none";
});
bttBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
