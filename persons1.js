(function() {
  // Функція, яка додає стиль для приховування кнопки "підписатися"
  function hideSubscribeButton() {
    if (document.getElementById('hide-subscribe-style')) return;

    const css = `
      .button--subscribe {
        display: none !important;
      }
    `;

    const style = document.createElement('style');
    style.id = 'hide-subscribe-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Чекаємо, поки DOM буде завантажений, і виконуємо функцію
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideSubscribeButton);
  } else {
    hideSubscribeButton();
  }
})();
