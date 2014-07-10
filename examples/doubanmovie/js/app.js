fox.navigator.defaultTransition = 'hslide';

if (/android/i.test(navigator.userAgent)) {
    fox.navigator.disabled = true;
}

rivets.binders.href = function(el, value) {
    el.href = value;
};

rivets.binders.moviehref = function(el, value) {
    el.href = 'movie.html?id=' + value;
};

rivets.binders.movieinfohref = function(el, value) {
    el.href = 'movieinfo.html?id=' + value;
};


rivets.binders.photoshref = function(el, value) {
    el.href = 'photos.html?id=' + value;
};

rivets.binders.galleryhref = function(el, value) {
    el.href = 'imagegallery.html?id=' + value;
};

rivets.binders.title = function(el, value) {
    el.title = value;
};

rivets.binders.starvalue = function(el, value) {
    el.value = value;
};

rivets.binders.proxysrc = function(el, value) {
    el.src = 'data/imageproxy.php?img=' + encodeURIComponent(value);
};

window.addEventListener('HTMLImportsLoaded', function(e) {
    document.body.removeAttribute('unresolved');
});


$(function() {
    FastClick.attach(document.body);
});
