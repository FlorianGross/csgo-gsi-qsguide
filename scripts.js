jQuery(function ($) {
    var seconds = $('#seconds');
    var milliseconds = $('#milliseconds');

    var s = 40;
    var ms = 1000;
    var i = 1;

    setDate();

    function setDate() {

        is_int(i);
        seconds.html('<strong>' + Math.floor(s) + '</strong> Seconde' + (s > 1 ? 's' : ''));

        isZero(ms);
        milliseconds.html('<strong>' + ms + '</strong> Milliseconde' + (ms > 1 ? 's' : ''));

        if (s != 0) {
            setTimeout(setDate, 10);
        }
    }
})




function update() {
    var element = document.getElementById("myprogressBar");
    var width = 1;
    var identity = setInterval(scene, 100.00);
    function scene() {
        if (width >= 100) {
            clearInterval(identity);
        } else {
            width += 0.25;
            element.style.width = width + '%';
            element.innerHTML = width * 1 + '%';
        }
    }
}
