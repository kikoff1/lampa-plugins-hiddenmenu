(function () {
  "use strict";

  var timer = setInterval(function () {
    if (typeof Lampa !== "undefined") {
      clearInterval(timer);

      Lampa.Utils.putScriptAsync(
        [

          "http://wtch.ch/m", //Онлайн без преміум
          "https://lampame.github.io/main/bo.js", // Бандера Онлайн
          

          
        ],
        function () {},
      );
    }
  }, 200);
})();
