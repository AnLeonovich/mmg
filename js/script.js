(function(){
  const nextGame = document.getElementById('nextGame');
  const wrapper = document.getElementById('wrapper');
  const options = {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
  };
  const difficulty = {
    easy: {
      i: 5,
      j: 2
    },
    normal:{
      i: 6,
      j: 3
    },
    hard:{
      i: 8,
      j: 3
    }
  };
  let count, time, level, timer;
  let pair = {};

  //профили пользователей
  class User{  
    constructor(name, surname, email){
      this.name = name || "Anonym";
      this.surname = surname || "Anonymous";
      this.email = email || "Big@secret";
      this.fullName = `${this.name} ${this.surname}`;
    }
  }

  // страницы
  class Pages{
    constructor(){}
    selectPage(){ // страница выбора рубашки/уровня
      let body = document.querySelector('body');
      body.innerHTML = `<main class="select" id="select">
                          <section class="select__cards" >
                            <p class="select__caption">Select card shirt</p>
                            <div class="select__cards-shirts" id="shirts">
                              <img src="img/monster_card_back.png" alt="Monster Shirt" class="select__cards-shirts_img">
                              <img src="img/neutral_card_back.png" alt="Neutral Shirt" class="select__cards-shirts_img">
                              <img src="img/nilfgaard_card_back.png" alt="Nilfgaard Shirt" class="select__cards-shirts_img">
                              <img src="img/northern_realms_card_back.png" alt="Northern realms Shirt" class="select__cards-shirts_img">
                              <img src="img/scoiateal_card_back.png" alt="Scoiateal Shirt" class="select__cards-shirts_img">
                              <img src="img/skellige_card_back.png" alt="Skellige Shirt" class="select__cards-shirts_img">
                            </div>
                          </section>
                          <section class="select__level">
                            <p class="select__caption">Select difficulty level</p>
                            <div class="select__level-levels" id = "levels">
                            <div class="select__level-levels_item" id = 'easy'>Easy (5x2)</div>
                            <div class="select__level-levels_item" id = 'normal'>Normal (6x3)</div>
                            <div class="select__level-levels_item" id = 'hard'>Hard (8x3)</div>
                            </div>                        
                          </section>
                          <button type="button" class="select__button" id = 'start'>Start Game</button>
                        </main>`;
      let start = document.getElementById('start');
      start.addEventListener('click', new Pages().gamePage);

      //реакция рубашек на выбор пользователя 
      Array.from(shirts.children).forEach(div => {
        div.addEventListener('click', e => {
          let current = document.getElementsByClassName('chosen-shirt');
          if(current.length !== 0){
            current[0].classList.remove('chosen-shirt');
          }
          e.target.classList.add('chosen-shirt'); 
        })
      });

      //реакция уровней сложности на выбор пользователя
      Array.from(levels.children).forEach(div => {
        div.addEventListener('click', e => {
          let current = document.getElementsByClassName('chosen-level');
          if(current.length !== 0){
            current[0].classList.remove('chosen-level');
          }
          e.target.classList.add('chosen-level'); 
        })
      });
    }

    gamePage(){ // страница игры
      let shirt = shirts.querySelector('.chosen-shirt');
      level = levels.querySelector('.chosen-level');

      //рубашка по умолчанию или выбранная пользователем
      if(!shirt){
        shirt = shirts.querySelector('.select__cards-shirts_img').src;
      } else {
        shirt = shirt.src;
      }

      //уровень по умолчанию или выбранный пользователем
      if(!level){
        level = document.getElementById('easy').id;
      } else {
        level = level.id;
      }

      //создание поля для игры
      let body = document.querySelector('body');
      body.innerHTML = `<div class = 'game-wrapper ${level}'></div>
                        <time class = "timer" id = "timer">00:00:00</time>`;
      let game = body.querySelector('.game-wrapper');
      let columns = difficulty[level].i;
      let rows = difficulty[level].j;
      game.style.gridTemplateColumns = `repeat(${columns}, 130px)`;
      game.style.gridTemplateRows = `repeat(${rows}, 170px)`;
      let all = columns*rows;
      let arr =  new Helpers().makeArray(all, 50);
      count = arr.length;
      let k = 0; // шаги по созданному массиву
      while(all != 0){ // шаги по количество элементов
        game.innerHTML += `<div class = "container">
                            <div class = 'back'>
                              <img src = ${shirt} class = 'back-img' alt = "back side">
                            </div>
                            <div class = "front">
                              <img src = 'content/${arr[k]}.jpg' class = 'front-img' alt = "front side">
                            </div>
                          </div>`;
        all--;
        k++;
      }
      // добавляем картам событие клика
      Array.from(game.children).forEach(div => {
        div.addEventListener('click', new CardsActions().flip);
        div.querySelector('.front-img').ondragstart=function(){return false}; // запрет на перетаскивание скрытой картинки (можно подсмотреть)
      });

      new Helpers().startTimer();
    }

    winPage(){ // страница победы
      new Helpers().top10(); // изменения в таблице рекордов
      let body = document.querySelector('body');
      body.innerHTML = `<article class = 'win'>
                          <div class = 'win__caption'>Congratulations!</div>
                          <div class = 'win__player-results'>Your time: <span class = win__player-results_time></span></div>
                          <table class = 'win__top'>
                            <caption class = "win__top-caption">Level ${level} Top-10!</caption>
                            <thead class = 'win__top-head'>
                              <tr>
                                <th class = 'win__top-head_item'>Place</th>
                                <th class = 'win__top-head_item'>Name</th>
                                <th class = 'win__top-head_item'>Time</th>
                              </tr>
                            </thead>
                            <tbody id = 'top'>
                            </tbody>
                          </table>
                          <button type="button" class="win__button-game" id = 'newGame'>New Game</button>
                          <a href = 'index.html'><button type="button" class="win__button-player">New Player</button></a>
                        </article>`;
      body.querySelector('span').innerHTML = timer.innerHTML;
      // заполнение таблицы рекордов
      let top = document.getElementById('top');
      let records = JSON.parse(localStorage.getItem(`records-${level}`));
      for(let i = 0; i< records.length; i++){
        top.innerHTML += `<tr>
                            <td>${i+1}</td>
                            <td>${records[i][0]}</td>
                            <td>${records[i][1]}</td>
                          </tr>`;
      }

      let nextGame = document.getElementById('newGame');
      nextGame.addEventListener('click', new Pages().selectPage);
    }
  }

  //события карт
  class CardsActions{
    constructor(e){}
    flip(e){
      let div = e.target.parentElement;
      while(div.className != 'container'){
        div = div.parentElement;
        if(div === null){ // блокируем клик пользователя на общий контейнер элементов
          return;
        }
      }
      new CardsActions().cardsOnClick(div);
    }
    cardsOnClick(div){
      if(!pair.firstCard){
        // открытие первой карты
        pair.firstCard = div.querySelector('.front-img');
        pair.firstCardContainer = div;
        div.style.transform = 'rotateY(180deg)';
        setTimeout(function(){
          pair.firstCard.style.opacity = "1";
        }, 200);

      } else if (!pair.secondCard && div !== pair.firstCardContainer){
        // открытие второй карты
        let SK = div.querySelector('.front-img');
        pair.secondCard = div.querySelector('.front-img'); 
        pair.secondCardContainer = div;
        div.style.transform = 'rotateY(180deg)';
        setTimeout(function(){
          SK.style.opacity = "1";
        }, 200);

        new Pair(pair.firstCard, pair.secondCard, pair.firstCardContainer, pair.secondCardContainer);
        pair = {};
      } 
    }
  }

  // открытая пара
  class Pair{
    constructor(firstCard, secondCard, firstCardContainer,secondCardContainer){
      this.firstCard = firstCard;
      this.secondCard = secondCard;
      this.firstCardContainer = firstCardContainer;
      this.secondCardContainer = secondCardContainer;
      let pair = this;
      if(this.firstCard.src === this.secondCard.src && this.firstCardContainer !== this.secondCardContainer){
        this.hide(pair);
      }
      if(this.firstCard.src !== this.secondCard.src && this.firstCardContainer !== this.secondCardContainer){
        this.flip(pair);
      }
    }
    hide(pair){ // карты одинаковые
      setTimeout(function(){
        pair.firstCardContainer.querySelector('.back').style.opacity = '0';          
        pair.firstCard.style.opacity = '0';
        pair.firstCard.style.visibility = 'hidden';
        pair.firstCard.style.transition = 'opacity 1.5s, visibility 1.5s linear 1.5s';
        pair.secondCardContainer.querySelector('.back').style.opacity = '0';
        pair.secondCard.style.opacity = '0';
        pair.secondCard.style.visibility = 'hidden';
        pair.secondCard.style.transition = 'opacity 1.5s, visibility 1.5s linear 1.5s';
      }, 600)
      pair.firstCardContainer.removeEventListener('click', new CardsActions().flip);
      pair.secondCardContainer.removeEventListener('click', new CardsActions().flip);  
      count -=2;
      //если все карты открыты - игра закончена
      if(count === 0){
        clearInterval(time);
        setTimeout(new Pages().winPage, 2000);
      } 
    }
    flip(pair){ // карты разные
      setTimeout(function() {
        pair.firstCardContainer.style.transform = '';
        pair.secondCardContainer.style.transform = '';
        setTimeout(function(){
          pair.firstCard.style.opacity = '0'
          pair.secondCard.style.opacity = '0'
        }, 200);
      }, 600);
    }
  } 
  // вспомогательные функции
  class Helpers{ 
    constructor(){}
    makeArray(length, max){ // массив карт
      let arr = [];
      let unicNumber, number;
      while (arr.length < length){
        do{
          unicNumber = true;
          number = Math.floor(Math.random() * max);
          for (let i = 0; i < arr.length; i++) {
            if (number == arr[i]) {
              unicNumber = false;
              break;
            }
          }
        } while (!unicNumber) 
        arr.push(number);
        arr.push(number);
      }
      let i = arr.length, j, t, b;
      while(i){
        j = Math.floor( ( i-- ) * Math.random() );
        t = b && typeof arr[i].shuffle!=='undefined' ? arr[i].shuffle() : arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }
    newUser(){ // сохранение профиля пользователя
      let user = new User(document.getElementById('name').value, document.getElementById('surname').value, document.getElementById('email').value);
      localStorage.setItem('user', JSON.stringify(user));
    }
    startTimer(){ // запуск таймера игры
      let start = new Date();
      start.setHours(0, 0, 0, 0);
      let i = 0;
      timer = document.getElementById('timer');
      time = setInterval(function() {
        if(i === 60){
          i=0;
        }
        i++;
        start.setSeconds(i);
        timer.innerHTML = start.toLocaleString("en-GB", options);
      }, 1000);
    }
    top10(){ // управление таблицами рекордов
      let time = timer.innerHTML.split(':')[0]*3600+timer.innerHTML.split(':')[1]*60+timer.innerHTML.split(':')[2]*1;
      let winner = [JSON.parse(localStorage.getItem('user')).fullName, timer.innerHTML, time];
      let records = JSON.parse(localStorage.getItem(`records-${level}`)) || [];
      if(!records.length){ // если таблицы еще нет
        records[0] = winner;
      } else { // если таблица уже существует
        for(let i = 0; i < records.length; i++){ 
          // добавление в середину
          if(records[i][2] >= winner[2]){
            let arr = records.splice(i);
            records = records.concat([winner], arr);
            if(records.length > 10) {
              records.length = 10;
            }
            break;
          }

          //добавление в конец   
          if((i+1) === records.length && records.length < 10){ 
            records.push(winner);
            break;
          }

        }             
      }
      localStorage.setItem(`records-${level}`, JSON.stringify(records)); 
    }
  };

  newGame.addEventListener('click', new Helpers().newUser);
  newGame.addEventListener('click', new Pages().selectPage);
})();
