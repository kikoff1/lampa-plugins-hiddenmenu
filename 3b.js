// Переконайтесь, що DOM повністю завантажений
document.addEventListener("DOMContentLoaded", function() {
    // Заміна кнопок
    const buttons = {
        'Онлайн': { text: 'Онлайн', color: '#4CAF50' },
        'Торренти': { text: 'Торренти', color: '#2196F3' },
        'Трейлери': { text: 'Трейлери', color: '#FF5722' }
    };

    // Знайдемо всі кнопки
    const buttonElements = document.querySelectorAll('button, a, .button'); // Замініть на точні селектори вашого сайту

    buttonElements.forEach(button => {
        // Якщо текст кнопки співпадає з одним із наших
        if (buttons[button.textContent.trim()]) {
            // Заміна тексту
            button.textContent = buttons[button.textContent.trim()].text;
            // Заміна кольору фону
            button.style.backgroundColor = buttons[button.textContent.trim()].color;
            button.style.color = 'white'; // Колір тексту білий
            button.style.border = 'none'; // Прибираємо рамки, щоб виглядало чисто
            button.style.padding = '10px 20px'; // Встановлюємо padding для кращого вигляду
            button.style.borderRadius = '5px'; // Закругляємо кути
            button.style.cursor = 'pointer'; // Додаємо ефект курсору
            button.style.transition = 'background-color 0.3s'; // Анімація при наведенні
        }
    });
});
