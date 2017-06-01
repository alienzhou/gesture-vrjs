(function () {
    var num = prompt("amount of logos");
    var fragment = document.createDocumentFragment();
    for (var i = 1; i <= num; i++) {
        var dom = document.createElement('div');
        dom.className = 'logo logo_' + i;
        fragment.appendChild(dom);
    }
    document.getElementById('logo-container').appendChild(fragment);
})();