(function() {
    const hideItems = ['Стрічка', 'Релізи', 'Торренти'];
    function hideMenuItems() {
        const interval = setInterval(() => {
            const items = document.querySelectorAll('.menu__list .selector');
            if (items.length) {
                items.forEach(item => {
                    const title = item?.innerText?.trim();
                    if (hideItems.includes(title)) {
                        item.style.display = 'none';
                    }
                });
                clearInterval(interval);
            }
        }, 500);
    }
    if (window.appready) {
        hideMenuItems();
    } else {
        document.addEventListener('appready', hideMenuItems);
    }
})();
