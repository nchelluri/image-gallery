'use strict';

(function() {
  console.log('Loading Flickr Gallery...');

  var gallery = document.getElementById('flickr-gallery');
  if (! gallery) {
    console.error('Unable to find gallery element within document (id should be: \'flickr-gallery\')');
    return;
  }

  var apiKey = gallery.getAttribute('data-api-key');
  if (! apiKey) {
    console.error('Unable to find API key attribute on gallery element (attribute name should be: \'data-api-key\')');
    return;
  }

  var groupId = gallery.getAttribute('data-group-id');
  if (! groupId) {
    console.error('Unable to find Group ID attribute on gallery element (attribute name should be: \'data-group-id\')');
    return;
  }

  gallery.innerHTML = gallery.getAttribute('data-loading-indicator') || '<img src="assets/img/loading.gif" /> <strong>Please wait...</strong><br>The gallery is loading.';
  document.addEventListener('click', thumbnailClick, false);
  loadGallery();

  function loadGallery() {
    // TODO: Impl pagination using the API's page and per_page params.
    var req = new XMLHttpRequest();
    req.addEventListener('load', onLoad, false);
    req.addEventListener('error', onError, false);
    req.addEventListener('abort', onAbort, false);
    req.open('GET', 'https://api.flickr.com/services/rest/?' +
      'method=flickr.groups.pools.getPhotos&' +
      'format=json&' +
      'nojsoncallback=1&' +
      'media=photos&' +
      'api_key=' + apiKey + '&' +
      'group_id=' + groupId
    );
    req.send();

    function onLoad() {
      var response;

      if (this.status == 200) {
        // Since IE 11 does not support xhr.responseType = 'json', we need to manually parse the response.
        try {
          response = JSON.parse(this.responseText);
        } catch(e) {
          console.error('Error parsing JSON', e);
          return onError.apply(this);
        }
      } else {
        console.error('API returned non-OK status code', this.status);
        return onError.apply(this);
      }

      if (response.stat == 'ok') {
        var photos = response.photos;

        if (photos.total && photos.total >= 1 && photos.photo.length >= 1) {
          var thumbnailHtml = '';
          for (var i = 0; i < photos.photo.length; i++) {
            var photo = photos.photo[i];
            var photoId = photo.id;
            var farm = photo.farm;
            var server = photo.server;
            var secret = photo.secret;
            var title = photo.title;
            title = title.replace(/[^-a-z0-9.:\s]/ig, ''); // Poor man's XSS protection. Probably bad for many languages.

            var baseUrl = 'https://farm' + farm + '.staticflickr.com/' + server + '/' + photoId + '_' + secret;
            var thumbnailUrl = baseUrl + '_t.jpg';
            var url240 = baseUrl + '_m.jpg';
            var url320 = baseUrl + '_n.jpg';
            var url500 = baseUrl + '.jpg';
            var url640 =  baseUrl + '_z.jpg';

            thumbnailHtml += '<div class="thumbnail" data-photo-index="' + i + '" data-title="' + title +
              '" data-url-240="' + url240 + '" data-url-320="' + url320 + '" data-url-500="' + url500 + '" ' +
              'data-url-640="' + url640 + '"><img src="' + thumbnailUrl + '" /></div>';
          }

          gallery.innerHTML = thumbnailHtml;
          gallery.photoCount = photos.photo.length;

          if (window.location.hash) {
            var initialIndex = parseInt(window.location.hash.slice(1));
            if (initialIndex >= 1 && initialIndex <= gallery.photoCount) {
              gallery.getElementsByClassName('thumbnail')[initialIndex - 1].click();
            }
          }
        } else {
          gallery.innerHTML = gallery.getAttribute('data-no-photos-indicator') || '<strong>No photos:</strong><br>There are no photos in this gallery.';
        }
      } else {
        onError.apply(this);
      }
    }

    function onError() {
      console.error('Error fetching gallery', this);
      gallery.innerHTML = gallery.getAttribute('data-error-indicator') || '<strong>Error:</strong><br>There was an error fetching the gallery.';
    }

    function onAbort() {
      console.error('Aborted fetching gallery', this);
      gallery.innerHTML = gallery.getAttribute('data-abort-indicator') || '<strong>Aborted:</strong><br>Loading of the gallery was aborted.';
    }
  }

  function thumbnailClick(event) {
    var target = event.target;

    if (! parentOf(target, 'flickr-gallery')) {
      return;
    }

    // The structure of our node is div.thumbnail>img, so if we hit an image, pop out a level.
    if (target.nodeName == 'IMG') {
      target = target.parentElement;
    }

    if (target.classList.contains('thumbnail')) {
      var photoIndex = parseInt(target.getAttribute('data-photo-index'));
      var url240 = target.getAttribute('data-url-240');
      var url320 = target.getAttribute('data-url-320');
      var url500 = target.getAttribute('data-url-500');
      var url640 = target.getAttribute('data-url-640');
      var title = target.getAttribute('data-title');
      var overlayId = 'flickr-gallery-overlay';
      var img, caption, navigation;

      var overlay = document.getElementById(overlayId);
      if (! overlay) {
        var body = document.body;

        // create overlay
        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.display = 'none';

        // create lightbox
        var lightbox = document.createElement('div');
        lightbox.id = 'flickr-gallery-lightbox';

        // add close button to lightbox
        var closeButton = document.createElement('div');
        closeButton.className = 'close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', closeClick, false);
        lightbox.appendChild(closeButton);

        // add <img> to lightbox
        img = document.createElement('img');
        lightbox.appendChild(img);
        lightbox.img = img;

        // add caption to lightbox
        caption = document.createElement('p');
        lightbox.appendChild(caption);
        lightbox.caption = caption;

        // create navigation elements
        navigation = document.createElement('p');
        navigation.className = 'navigation';
        navigation.photoCount = gallery.photoCount;

        // add prev button to navigation elements
        var prev = document.createElement('span');
        prev.className = 'prev';
        prev.addEventListener('click', prevClick, false);
        prev.innerHTML = gallery.getAttribute('data-prev-button') || '<a href="javascript:void(0)">Previous</a>';
        navigation.appendChild(prev);

        // add photo count span to navigation elements
        var photoCountSpan = document.createElement('span');
        navigation.appendChild(photoCountSpan);
        navigation.photoCountSpan = photoCountSpan;
        navigation.photoCountSpan.template = gallery.getAttribute('data-photo-count-template') || ' | Photo $index of $count | ';

        // add next button to navigation elements
        var next = document.createElement('span');
        next.className = 'next';
        next.innerHTML = gallery.getAttribute('data-next-button') || '<a href="javascript:void(0)">Next</a>';
        next.addEventListener('click', nextClick, false);
        navigation.appendChild(next);

        // add navigation elements to lightbox
        lightbox.navigation = navigation;
        lightbox.appendChild(navigation);

        // add lightbox to overlay
        overlay.appendChild(lightbox);
        overlay.lightbox = lightbox;

        document.addEventListener('keydown', navKeypress, false);

        body.insertBefore(overlay, body.firstChild);
      } else {
        img = overlay.lightbox.img;
        caption = overlay.lightbox.caption;
        navigation = overlay.lightbox.navigation;
      }

      var imgUrl;
      var viewportWidth = document.documentElement.clientWidth - 40;
      var viewportHeight = document.documentElement.clientHeight - 100;
      if (viewportWidth < 320 || viewportHeight < 320) {
        imgUrl = url240;
      } else if (viewportWidth < 500 || viewportHeight < 500) {
        imgUrl = url320;
      } else if (viewportWidth < 640 || viewportHeight < 640) {
        imgUrl = url500;
      } else {
        imgUrl = url640;
      }

      img.src = imgUrl;
      caption.innerHTML = title;
      navigation.photoCountSpan.innerHTML = navigation.photoCountSpan.template.replace(/\$index/g, (photoIndex + 1)).replace(/\$count/g, navigation.photoCount);
      navigation.photoIndex = photoIndex;
      overlay.style.display = 'flex';
      window.location.hash = photoIndex + 1;
    }

    function closeClick() {
      overlay.style.display = 'none';
      window.history.replaceState({}, '', window.location.href.substr(0, window.location.href.length - window.location.hash.length));
    }

    function prevClick() {
      var navigation = overlay.lightbox.navigation;
      var index = ((navigation.photoIndex - 1) + navigation.photoCount) % navigation.photoCount;
      gallery.getElementsByClassName('thumbnail')[index].click();
    }

    function nextClick() {
      var navigation = overlay.lightbox.navigation;
      var index = (navigation.photoIndex + 1) % navigation.photoCount;
      gallery.getElementsByClassName('thumbnail')[index].click();
    }

    function navKeypress(event) {
      if (overlay.style.display != 'none') {
        if (event.which == 37) { // left arrow
          prev.click();
        } else if (event.which == 39) { // right arrow
          next.click();
        } else if (event.which == 27) { // ESC
          closeButton.click();
        }
      }
    }

    function parentOf(el, id) {
      while (el) {
        if (el.id == id) {
          return true;
        }

        el = el.parentNode;
      }

      return false;
    }
  }
})();
