// Константы
var SERVER_TIMEOUT = 15000;
var SERVER_STATUS_SUCCESS = 200;
var URL = 'https://my-json-server.typicode.com/aleksandrmalinin/demo/apartment';
var INITIAL_LOADED_DATA = 12;
var ZERO_SCROLL_VALUE = 0;
var NORMAL_SCROLL_VALUE = 300;

var container = document.querySelector('.search-results__items-list');
var more = document.querySelector('.search-results__more');
var inputs = document.querySelectorAll('.search-results__input');
var backToTop = document.querySelector('.back-to-top');
var email = document.querySelector('.main-footer__email');
var submit = document.querySelector('.main-footer__submit');
var menuToggle = document.querySelector(".main-nav__toggle");
var menuList = document.querySelector(".main-nav");

// Сообщение об ошибке
var errorHandler = function (errorMessage) {
  var template = document.createElement('div');
  template.textContent = errorMessage;

  var styles = [
    'position: fixed',
    'top: 25%',
    'left: 50%',
    'z-index: 100',
    'width: 800px',
    'padding: 20px',
    'color: #fff',
    'text-align: center',
    'transform: translateX(-50%)',
    'border-radius: 2px',
    'background-color: red'
  ];

  template.style.cssText = styles.join(';');
  document.body.appendChild(template);
};

// Запрос данных с сервера
var reactToServer = function (xhr, onLoad, onError) {
    xhr.addEventListener('load', function () {
        if (xhr.status === SERVER_STATUS_SUCCESS) {
          onLoad(JSON.parse(xhr.responseText));
        } else {
            onError('Неизвестный статус: ' + xhr.status + ' ' + xhr.statusText);
        }
    });

    xhr.addEventListener('error', function () {
        onError('Ошибка соединения');
    });

    xhr.addEventListener('timeout', function () {
        onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });
};

var load = function (onLoad, onError) {
    var xhr = new XMLHttpRequest();

    reactToServer(xhr, onLoad, onError);

    xhr.open('GET', URL);
    xhr.timeout = SERVER_TIMEOUT;
    xhr.send();
};

var save = function (data, onLoad, onError) {
    var xhr = new XMLHttpRequest();

    reactToServer(xhr, onLoad, onError);

    xhr.open('POST', URL);
    xhr.timeout = SERVER_TIMEOUT;
    xhr.send(data);
};

// Создание элемента квартиры
var createElements = function (apartment) {
    var apartmentElement = document.querySelector('.search-results__item').cloneNode(true);

    apartmentElement.querySelector('.search-results__image img').src = apartment.url;
    apartmentElement.querySelector('.search-results__type').textContent = apartment.title;

    if (apartment.sale) {
      apartmentElement.querySelector('.search-results__promo-number').textContent = apartment.sale.discount;

      if (apartment.sale.promo) {
        apartmentElement.querySelector('.search-results__promo-word').textContent = apartment.sale.promo;
      } else {
          var promo = apartmentElement.querySelector('.search-results__promo');
          var promoWord = promo.querySelector('.search-results__promo-word');
          if (apartmentElement) promo.removeChild(promoWord);
      }
    } else {
        var image = apartmentElement.querySelector('.search-results__image');
        var promoResult = image.querySelector('.search-results__promo');
        if (promoResult) image.removeChild(promoResult);
    }

    apartmentElement.querySelector('.search-results__rooms').textContent = apartment.rooms;
    apartmentElement.querySelector('.search-results__decoration').textContent = apartment.decoration;
    apartmentElement.querySelector('.search-results__space-number').textContent = apartment.space;
    apartmentElement.querySelector('.search-results__floor-number').textContent = apartment.floor;
    apartmentElement.querySelector('.search-results__price').textContent = apartment.price;
    apartmentElement.querySelector('.search-results__status').textContent = apartment.status;

    if (apartmentElement.querySelector('.search-results__rooms').textContent < 1) {
      apartmentElement.querySelector('.search-results__caption').classList.add('search-results__caption--studio');
    }

    if (apartmentElement.querySelector('.search-results__status').textContent === 'Забронировано') {
      apartmentElement.querySelector('.search-results__status').classList.add('search-results__status--reserved')
    } else if (apartmentElement.querySelector('.search-results__status').textContent === 'Свободно') {
      apartmentElement.querySelector('.search-results__status').classList.add('search-results__status--free')
    } else {
      apartmentElement.querySelector('.search-results__status').classList.add('search-results__status--sold')
    }

    return apartmentElement;
};

// Рендеринг элементов
var renderElement = function (items) {
    [].forEach.call(items, function(item) {
        container.appendChild(createElements(item));
    });
};

var data;

// Получение данных с сервера
var getDataApartments = function (apartments) {
    data = apartments;
    renderFirstTwelve(apartments);
};

// Рендеринг первых 12-ти элементов
var renderFirstTwelve = function (items) {
  for (var i = 0; i < INITIAL_LOADED_DATA; i++) {
    data = items.slice(i+1);
    container.appendChild(createElements(items[i]));
  }
};

// Показать еще 20 квартир
more.addEventListener('click', function (evt) {
    evt.preventDefault();
    renderElement(data);
});

load(getDataApartments, errorHandler);

// Механизм сортировки
[].forEach.call(inputs, function (it) {
    it.addEventListener('click', function () {
        if (it.checked && it.id === 'price') {
            [].slice.call(document.querySelectorAll('.search-results__item'), 0).sort(function (a, b) {
                return parseInt(a.querySelector('.search-results__price').textContent.split(' ').join('')) -
                    parseInt(b.querySelector('.search-results__price').textContent.split(' ').join(''))
            }).forEach(function (el) {
                el.parentNode.appendChild(el);
            });
        } else {
            [].slice.call(document.querySelectorAll('.search-results__item'), 0).sort(function (a, b) {
                return a.querySelector('.search-results__rooms').textContent -
                    b.querySelector('.search-results__rooms').textContent;
            }).forEach(function (el) {
                el.parentNode.appendChild(el);
            });
        }
    });
});

// Изначально кнопка скролла к началу страницы скрыта
document.addEventListener('DOMContentLoaded', function () {
    backToTop.style.display = 'none';
    document.querySelectorAll('.search-results__star');
});

// Скрытие/показ кнопки при скролле и его отсутствии
document.addEventListener('scroll', function () {
    if (document.querySelector('.search-results').getBoundingClientRect().top === ZERO_SCROLL_VALUE) {
    }

    // Кнопка отображается, если если значение скролла больше 300, иначе скрывается
    if (window.pageYOffset > NORMAL_SCROLL_VALUE) {
        backToTop.style.display = 'block';
    } else {
        backToTop.style.display = 'none';
    }
});


// Фокусировка на поле ввода при попытке сабмита без данных пользователя
submit.addEventListener('click', function (evt) {
   if (email.value === '') {
       evt.preventDefault();
       email.focus();
   }
});

// Мобильное меню
menuToggle.addEventListener("click", function () {
  menuToggle.classList.toggle("main-nav__toggle--active");
  menuList.classList.toggle("main-nav--opened");
});

// Кнопка скролла страницы к началу
(function () {
  $(document).ready(function () {
    $('#back-to-top').on('click', 'a', function (event) {
      event.preventDefault();
      var id = $(this).attr('href'),
        top = $(id).offset().top;
      $('body,html').animate({scrollTop: top}, 750);
    });
  });
})();
