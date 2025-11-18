const buttons = document.querySelectorAll(".category-btn");
const cards = document.querySelectorAll(".card");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const categoria = btn.dataset.category;

    cards.forEach((card) => {
      if (categoria === "todas" || card.dataset.category === categoria) {
        card.style.display = "flex"; 
      } else {
        card.style.display = "none";  
      }
    });
  });
});
