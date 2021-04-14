/* global gsap */

var appData = {
  currentResponseID: '',
  isJoke: false,
  interactCallback: function (event) {
    if (event.target === page.$roulette) {
      gsap.to('.roulette', {
        duration: 1.5,
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
          document.querySelector('.response-container').classList.remove('hidden');
        });
      } else {
        xhr.open('GET', 'https://api.quotable.io/random');
        xhr.responseType = 'json';
        xhr.addEventListener('load', function (event) {
          page.$content.textContent = xhr.response.content;
          appData.currentResponseID = xhr.response._id;
          document.querySelector('.response-container').className = 'response-container';
        });
      }
      xhr.send();
    }
  }
};

var page = {
  $content: document.querySelector('.response-content'),
  $roulette: document.querySelector('.roulette')
};

page.$roulette.addEventListener('click', appData.interactCallback);
