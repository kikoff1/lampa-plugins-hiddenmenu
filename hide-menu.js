(function() {
  const hideItems = ['Стрічка', 'Релізи', 'Торренти'];

  function hideMenuItems() {
    const items = document.querySelectorAll('.menu__list .selector');
    items.forEach(item => {
      const text = item.innerText?.trim();
      if (hideItems.includes(text)) {
        item.style.display = 'none';
        console.log('🚫 Приховано:', text);
      }
    });
  }

  if (window.appready) {
    hideMenuItems();
  } else {
    document.addEventListener('appready', hideMenuItems);
  }
})();
