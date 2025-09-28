(function () {
    "use strict";

    // ==== Приховування стандартної кнопки "Підписатися" ====
    function hideDefaultSubscribeButton() {
        if (document.getElementById("hide-subscribe-style")) return;

        const css = `
            .button--subscribe {
                display: none !important;
            }
        `;

        const style = document.createElement("style");
        style.id = "hide-subscribe-style";
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== Константи ====
    const PLUGIN_NAME = "persons_plugin";
    const PERSONS_KEY = "saved_persons";
    const PAGE_SIZE = 20;
    let currentPersonId = null;

    // ==== Переклади ====
    const pluginTranslations = {
        persons_title: {
            ru: "Персоны",
            en: "Persons",
            uk: "Персони",
            be: "Асобы",
            pt: "Pessoas",
            zh: "人物",
            he: "אנשים",
            cs: "Osobnosti",
            bg: "Личности",
        },
        subscribe: {
            ru: "Подписаться",
            en: "Subscribe",
            uk: "Підписатися",
            be: "Падпісацца",
            pt: "Inscrever",
            zh: "订阅",
