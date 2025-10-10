// Início

window.addEventListener("scroll", function() {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Carrossel de notícias
document.addEventListener('DOMContentLoaded', function () {
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');

    if (track && cards.length > 0) {
        const cardWidth = cards[0].getBoundingClientRect().width;
        let currentIndex = 0;

        // Função para mover para o slide
        const moveToSlide = (targetIndex) => {
            // Calcula o deslocamento
            const amountToMove = (cardWidth + 30) * targetIndex; // 30 é a margem (15px de cada lado)
            track.style.transform = 'translateX(-' + amountToMove + 'px)';
            currentIndex = targetIndex;
        }

        // Navegar para a direita
        nextButton.addEventListener('click', () => {
            let nextIndex = currentIndex + 1;
            // Verifica se está no fim para voltar ao início (loop)
            if (nextIndex >= cards.length) {
                nextIndex = 0;
            }
            moveToSlide(nextIndex);
        });

        // Navegar para a esquerda
        prevButton.addEventListener('click', () => {
            let prevIndex = currentIndex - 1;
            // Verifica se está no início para ir ao fim (loop)
            if (prevIndex < 0) {
                prevIndex = cards.length - 1;
            }
            moveToSlide(prevIndex);
        });

        // Opcional: Auto-play
        setInterval(() => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= cards.length) {
                nextIndex = 0;
            }
            moveToSlide(nextIndex);
        }, 5000); // Muda de slide a cada 5 segundos
    }
}); 
