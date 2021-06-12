/* global gsap */
/* global user:writable */

var appData = {
  currentResponseID: '',
  currentContent: '',
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
        appData.currentContent = xhr.response.joke;
        page.$content.textContent = appData.currentContent;
        appData.currentResponseID = xhr.response.id;
        if (appData.idChecker(user.likes)) {
          page.$emptyHeart.classList.add('hidden');
          page.$fullHeart.classList.remove('hidden');
        } else {
          page.$emptyHeart.classList.remove('hidden');
          page.$fullHeart.classList.add('hidden');
        }
        if (appData.idChecker(user.dislikes)) {
          page.$emptyThumb.classList.add('hidden');
          page.$fullThumb.classList.remove('hidden');
        } else {
          page.$emptyThumb.classList.remove('hidden');
          page.$fullThumb.classList.add('hidden');
        }
        document.querySelector('.response-container').classList.remove('hidden');
      });
    } else {
      xhr.open('GET', 'https://api.quotable.io/random');
      xhr.responseType = 'json';
      xhr.addEventListener('load', function () {
        appData.currentContent = xhr.response.content;
        page.$content.textContent = appData.currentContent;
        appData.currentResponseID = xhr.response._id;
        if (appData.idChecker(user.likes)) {
          page.$emptyHeart.classList.add('hidden');
          page.$fullHeart.classList.remove('hidden');
        } else {
          page.$emptyHeart.classList.remove('hidden');
          page.$fullHeart.classList.add('hidden');
        }
        if (appData.idChecker(user.dislikes)) {
          page.$emptyThumb.classList.add('hidden');
          page.$fullThumb.classList.remove('hidden');
        } else {
          page.$emptyThumb.classList.remove('hidden');
          page.$fullThumb.classList.add('hidden');
        }
        document.querySelector('.response-container').classList.remove('hidden');
      });
    }
    xhr.send();
  },
  viewSwapper: function (event) {
    if (event.target.tagName === 'A') {
      for (let i = 0; i < page.$mainList.length; i++) {
        if (event.target.dataset.view === page.$mainList[i].dataset.view) {
          page.$mainList[i].classList.remove('hidden');
          page.$dropDown.classList.add('hidden');
        } else if (event.target.dataset.view !== page.$mainList[i].dataset.view) {
          page.$mainList[i].classList.add('hidden');
          page.$dropDown.classList.add('hidden');
        }
      }
    } else if (event.target.classList.contains('dropdown')) {
      page.$dropDown.classList.toggle('hidden');
    } else {
      page.$dropDown.classList.add('hidden');
    }
  },
  reactionCallback: function (event) {
    if (event.target.closest('main').dataset.view === 'home') {
      if (event.target === page.$emptyHeart) {
        if (!appData.idChecker(user.likes)) {
          user.likes.push({ joke: appData.isJoke, id: appData.currentResponseID, content: appData.currentContent });
          page.$likesPage.append(appData.likesRenderer(user.likes.length - 1));
          page.$likesDefault.classList.add('hidden');
        }
        if (appData.idChecker(user.dislikes)) {
          page.$emptyThumb.classList.remove('hidden');
          page.$fullThumb.classList.add('hidden');
          appData.idRemover(user.dislikes, appData.currentResponseID);
        }
        page.$emptyHeart.classList.add('hidden');
        page.$fullHeart.classList.remove('hidden');
      } else if (event.target === page.$emptyThumb) {
        if (!appData.idChecker(user.dislikes)) {
          user.dislikes.push({ joke: appData.isJoke, id: appData.currentResponseID, content: appData.currentContent });
        }
        if (appData.idChecker(user.likes)) {
          page.$emptyHeart.classList.remove('hidden');
          page.$fullHeart.classList.add('hidden');
          appData.idRemover(user.likes, appData.currentResponseID);
          const likedNode = document.querySelector(`div[data-id='${appData.currentResponseID}']`);
          likedNode.remove();
        }
        page.$emptyThumb.classList.add('hidden');
        page.$fullThumb.classList.remove('hidden');
      } else if (event.target === page.$fullHeart) {
        appData.idRemover(user.likes, appData.currentResponseID);
        page.$emptyHeart.classList.remove('hidden');
        page.$fullHeart.classList.add('hidden');
        const likedNode = document.querySelector(`div[data-id='${appData.currentResponseID}']`);
        likedNode.remove();
      } else if (event.target === page.$fullThumb) {
        appData.idRemover(user.dislikes, appData.currentResponseID);
        page.$emptyThumb.classList.remove('hidden');
        page.$fullThumb.classList.add('hidden');
      }
    } else if (event.target.closest('main').dataset.view === 'likes') {
      if (event.target.classList.contains('full-heart')) {
        const closestContainer = event.target.closest('div.likes-container');
        const targetId = closestContainer.dataset.id;
        appData.idRemover(user.likes, targetId);
        closestContainer.remove();
        if (targetId === appData.currentResponseID) {
          page.$emptyHeart.classList.remove('hidden');
          page.$fullHeart.classList.add('hidden');
        }
      } else if (event.target.classList.contains('empty-thumb')) {
        const closestContainer = event.target.closest('div.likes-container');
        const targetId = closestContainer.dataset.id;
        var removedItem = appData.idRemover(user.likes, targetId);
        user.dislikes.push(removedItem[0]);
        closestContainer.remove();
        if (targetId === appData.currentResponseID) {
          page.$emptyHeart.classList.remove('hidden');
          page.$fullHeart.classList.add('hidden');
          page.$emptyThumb.classList.add('hidden');
          page.$fullThumb.classList.remove('hidden');
        }
      }
    }
    if (user.likes.length === 0) {
      page.$likesDefault.classList.remove('hidden');
    }
  },
  likesRenderer: function (i) {
    var $likesContainer = document.createElement('div');
    $likesContainer.classList.add('likes-container');
    $likesContainer.dataset.id = user.likes[i].id;
    var $likesContent = document.createElement('p');
    $likesContent.classList.add('likes-content');
    $likesContent.textContent = user.likes[i].content;
    var $likesReactions = document.createElement('div');
    $likesReactions.classList.add('reactions');
    var $thumb = document.createElement('i');
    $thumb.classList.add('far', 'fa-thumbs-down', 'empty-thumb');
    var $heart = document.createElement('i');
    $heart.classList.add('fas', 'fa-heart', 'full-heart');
    $likesReactions.append($thumb, $heart);
    $likesContainer.append($likesContent, $likesReactions);
    return $likesContainer;
  },
  likesLoader: function () {
    if (user.likes.length > 0) {
      for (let i = 0; i < user.likes.length; i++) {
        page.$likesPage.append(appData.likesRenderer(i));
      }
    } else {
      page.$likesDefault.classList.remove('hidden');
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
  idRemover: function (array, identifier) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (array[i].id === identifier) {
        return array.splice(i, 1);
      }
    }
  },
  localStorageSaver: function (event) {
    localStorage.setItem('userData', JSON.stringify(user));
  },
  localStorageGetter: function (event) {
    user = JSON.parse(localStorage.getItem('userData'));
  }
};

var page = {
  $navbar: document.querySelector('.navbar'),
  $mainList: document.querySelectorAll('main'),
  $dropDown: document.querySelector('.dropdown-list'),
  $content: document.querySelector('.response-content'),
  $roulette: document.querySelector('.roulette'),
  $likesPage: document.querySelector('div.likes'),
  $likesDefault: document.querySelector('h2.empty-likes'),
  $reactions: document.querySelector('.response-container > .reactions'),
  $emptyHeart: document.querySelector('.home .empty-heart'),
  $fullHeart: document.querySelector('.home .full-heart'),
  $emptyThumb: document.querySelector('.home .empty-thumb'),
  $fullThumb: document.querySelector('.home .full-thumb')
};

page.$roulette.addEventListener('click', appData.rouletteCallback);
page.$reactions.addEventListener('click', appData.reactionCallback);
page.$likesPage.addEventListener('click', appData.reactionCallback);
window.addEventListener('click', appData.viewSwapper);
window.addEventListener('beforeunload', appData.localStorageSaver);
window.addEventListener('DOMContentLoaded', appData.localStorageGetter);
window.addEventListener('DOMContentLoaded', appData.likesLoader);
