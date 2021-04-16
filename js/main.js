/* global gsap */
/* global user:writable */

var appData = {
  currentResponseID: '',
  isJoke: false,
  rouletteCallback: function (event) {
    gsap.to('.roulette', {
      duration: 1,
      rotation: -360,
      onComplete: function () {
        gsap.set('.roulette', { rotation: 0 });
      }
    });
    if (Math.random() < 0.5) {
      appData.isJoke = false;
    } else {
      appData.isJoke = true;
    }
    var xhr = new XMLHttpRequest();
    if (appData.isJoke) {
      xhr.open('GET', 'https://icanhazdadjoke.com/');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.responseType = 'json';
      xhr.addEventListener('load', function () {
        page.$content.textContent = xhr.response.joke;
        appData.currentResponseID = xhr.response.id;
        if (appData.idChecker(user.likes)) {
          page.$emptyHeart.classList.add('hidden');
          page.$fullHeart.classList.remove('hidden');
        } else {
          page.$emptyHeart.classList.remove('hidden');
          page.$fullHeart.classList.add('hidden');
        }
        document.querySelector('.response-container').classList.remove('hidden');
      });
    } else {
      xhr.open('GET', 'https://api.quotable.io/random');
      xhr.responseType = 'json';
      xhr.addEventListener('load', function () {
        page.$content.textContent = xhr.response.content;
        appData.currentResponseID = xhr.response._id;
        if (appData.idChecker(user.likes)) {
          page.$emptyHeart.classList.add('hidden');
          page.$fullHeart.classList.remove('hidden');
        } else {
          page.$emptyHeart.classList.remove('hidden');
          page.$fullHeart.classList.add('hidden');
        }
        document.querySelector('.response-container').classList.remove('hidden');
      });
    }
    xhr.send();
  },
  reactionCallback: function (event) {
    if (event.target === page.$emptyHeart) {
      if (!appData.idChecker(user.likes)) {
        user.likes.push({ joke: appData.isJoke, id: appData.currentResponseID });
      }
      page.$emptyHeart.classList.add('hidden');
      page.$fullHeart.classList.remove('hidden');
    }
  },
  idChecker: function (array) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === appData.currentResponseID) {
        return true;
      }
    }
    return false;
  },
  localStorageSaver: function (event) {
    localStorage.setItem('userData', JSON.stringify(user));
  },
  localStorageGetter: function (event) {
    user = JSON.parse(localStorage.getItem('userData'));
  }
};

var page = {
  $content: document.querySelector('.response-content'),
  $roulette: document.querySelector('.roulette'),
  $reactions: document.querySelector('.reactions'),
  $emptyHeart: document.querySelector('.empty-heart'),
  $fullHeart: document.querySelector('.full-heart'),
  $emptyThumb: document.querySelector('.empty-thumb'),
  $fullThumb: document.querySelector('.full-thumb')
};

page.$roulette.addEventListener('click', appData.rouletteCallback);
page.$reactions.addEventListener('click', appData.reactionCallback);
window.addEventListener('beforeunload', appData.localStorageSaver);
window.addEventListener('DOMContentLoaded', appData.localStorageGetter);
