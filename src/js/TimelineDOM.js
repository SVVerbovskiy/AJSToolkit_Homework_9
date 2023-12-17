/* eslint-disable no-console */
export default class TimelineDOM {
  constructor() {
    this.container = null; // for container

    /* массивы для callback-а функций */
    this.textSubmitListeners = [];
    this.popUpSubmitListeners = [];
    this.audioClickListeners = [];
    this.videoClickListeners = [];
    this.mediaOkListeners = [];
    this.mediaCancelListeners = [];

    this.targetMedia = null;
  }

  // присваиваем классу контейнер
  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.container = container;
  }

  // проверка на наличие контейнера
  checkBinding() {
    if (this.container === null) {
      throw new Error('ListEditPlay not bind to DOM');
    }
  }

  // отрисовка HTML
  drawUI() {
    this.checkBinding();

    this.container.innerHTML = `
        <header class="header">
          <p>Домашнее задание к занятию "10. Geolocation, Notification, Media"</p>
          <p>Timeline</p>
        </header>
        <div class="timeline-container">
          <div class="timeline"></div>
          <form class="timeline-form">
            <input class="timeline-body-message"/>
            <div class="timeline-btns">
              <button class="timeline-btn close" data-id="media-ok" type="button">✔</button>
              <div class="timeline-media-info close" data-id="media-info">00:00</div>
              <button class="timeline-btn close" data-id="media-cancel" type="button">✘</button>
              <button class="timeline-btn" data-id="audio" type="button">🎙️</button>
              <button class="timeline-btn" data-id="video" type="button">🎥</button>
              <button class="timeline-btn" data-id="text" type="submit">✉</button>
            </div>
          </form>
          <form class="popup close">
            <div class="popup-container">
              <div class="popup-header">Что-то пошло не так</div>
              <div class="popup-text">
                К сожалению, нам не удалось определить ваше местоположение, 
                пожалуйста, дайте разрешение на использование геолокации, 
                либо введите координаты вручную.
              </div>
              <div class="popup-text">Широта и долгота через запятую</div>
              <input type="text" class="popup-geo"/>
              <div class="popup-buttons">
                <button class="popup-btn" data-id="popup-submit" type="submit" autofocus>ОК</button>
                <button class="popup-btn" data-id="popup-cansel" type="cancel">Отмена</button>
              </div>
            </div>
          </form>
        </div>
      `;

    this.timeline = this.container.querySelector('.timeline');
    this.timelineForm = this.container.querySelector('.timeline-form');
    this.timelineBody = this.container.querySelector('.timeline-body-message');

    this.popUp = this.container.querySelector('.popup');
    this.popUpGeoText = this.container.querySelector('.popup-geo');

    this.btnMediaOk = this.container.querySelector('[data-id="media-ok"]');
    this.btnMediaInfo = this.container.querySelector('[data-id="media-info"]');
    this.btnMediaCancel = this.container.querySelector('[data-id="media-cancel"]');

    this.btnAudio = this.container.querySelector('[data-id="audio"]');
    this.btnVideo = this.container.querySelector('[data-id="video"]');
    this.btnText = this.container.querySelector('[data-id="text"]');

    this.timelineForm.addEventListener('submit', (event) => this.onTextSubmit(event));
    this.btnAudio.addEventListener('click', (event) => this.onAudioClick(event));
    this.btnVideo.addEventListener('click', (event) => this.onVideoClick(event));
    this.btnText.addEventListener('click', (event) => this.onTextSubmit(event));
    this.timelineBody.addEventListener('focus', () => this.onFocusClear('timelineBody'));
    this.popUpGeoText.addEventListener('focus', () => this.onFocusClear('popUpGeoText'));

    this.btnMediaOk.addEventListener('click', (event) => this.onMediaOk(event));
    this.btnMediaCancel.addEventListener('click', (event) => this.onMediaCancel(event));

    this.popUp.addEventListener('submit', (event) => this.onPopUpSubmit(event));
  }

  /*
    *  метод для отрисовки сообщения
    *  получает объект сообщения с date, body, geo
    *  вставляет сообщение в ленту
    */
  renderMessage(message) {
    const {
      date,
      geo,
      body,
      type,
    } = message; // данные для поста/сообщения

    /* останвока метода, если тип другой */
    if (!(type === 'audio' || type === 'video' || type === 'text')) { return; }

    /* создаём контейнер для поста и присваиваем ему класс */
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    /* создаём блок для поста и присваиваем ему класс */
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');

    /* создаём блок для даты, присваеваем класс и значение даты */
    const messageDate = document.createElement('div');
    messageDate.classList.add('message-date');
    messageDate.textContent = date;

    /* создаём блок для тела поста и присваиваем ему класс */
    const messageBody = document.createElement('div');
    messageBody.classList.add('message-body');

    /*
      *  если тип поста аудио или видео, то создаётся объект медиа и включается котроль,
      *  устонавливается ссылка, задаётся класс и вставляется в тело поста
      */
    if (type === 'audio' || type === 'video') {
      const media = document.createElement(type);
      media.controls = true;
      media.preload = 'auto';
      media.classList.add(type);
      media.src = body;
      messageBody.appendChild(media);
    }

    /* если тип поста текст, то вставляется текст */
    if (type === 'text') {
      messageBody.textContent = body;
    }

    /* создаётся блок для геолокации и присваивается класс и значения */
    const messageGeo = document.createElement('div');
    messageGeo.classList.add('message-geo');
    messageGeo.textContent = `${geo} 👁`;

    /*
      *  вставка поста в контейнер,
      *  а потом вставка блока с датой, телом и геолокацией в пост
      */
    messageContainer.appendChild(messageEl);
    messageEl.appendChild(messageDate);
    messageEl.appendChild(messageBody);
    messageEl.appendChild(messageGeo);

    /* встака контейнера поста в ленту и прокрутка ленты вверх */
    this.timeline.prepend(messageContainer);
    this.timeline.scrollTo(0, -99999);
  }

  /* метод для callback метода onTextSubmit для автоматического вызова в классе TimelineControl */
  addTextSubmitListeners(callback) { this.textSubmitListeners.push(callback); }

  /*
    *  кнопка отправки тектового сообщения, передаёт введённый текст
    *  в метод onClickBtns класса TimelineControl
    */
  onTextSubmit(e) {
    e.preventDefault();
    const body = this.timelineBody.value;
    this.timelineBody.value = '';

    this.textSubmitListeners.forEach((o) => o.call(null, body));
  }

  /* метод для callback метода onPopUpSubmit для автоматического вызова в классе TimelineControl */
  addPopUpSubmitListeners(callback) { this.popUpSubmitListeners.push(callback); }

  /*
    *  метод для формы введения геолокации
    *  передаёт введённую вручную геолокацию и тип нажатой кнопки
    *  в метод onPopUpSubmit класса TimelineControl
    */
  onPopUpSubmit(e) {
    e.preventDefault();
    const submitEl = e.submitter;
    const dataID = submitEl.dataset.id;
    const geoStr = this.popUpGeoText.value;
    this.popUpSubmitListeners.forEach((o) => o.call(null, { dataID, geoStr }));
  }

  /* метод для callback метода onAudioClick для автоматического вызова в классе TimelineControl */
  addAudioClickListeners(callback) { this.audioClickListeners.push(callback); }

  /*
    *  клик по кнопке микрофона, запускает метод onAudioClick в классе TimelineControl
    */
  onAudioClick(e) {
    e.preventDefault();
    this.audioClickListeners.forEach((o) => o.call(null, ''));
  }

  /* метод для callback метода onMediaOk для автоматического вызова в классе TimelineControl */
  addMediaOkListeners(callback) { this.mediaOkListeners.push(callback); }

  /*
    *  клик по кнопке медиаОК, запускает метод onMediaOk в классе TimelineControl
    */
  onMediaOk(e) {
    e.preventDefault();
    this.mediaOkListeners.forEach((o) => o.call(null, ''));
  }

  /* метод для callback метода onMediaCancel для автоматического вызова в классе TimelineControl */
  addMediaCancelListeners(callback) { this.mediaCancelListeners.push(callback); }

  /*
    *  клик по кнопке отмены медиа, запускает метод onMediaCancel в классе TimelineControl
    */
  onMediaCancel(e) {
    e.preventDefault();
    this.mediaCancelListeners.forEach((o) => o.call(null, ''));
  }

  /* метод для callback метода onVideoClick для автоматического вызова в классе TimelineControl */
  addVideoClickListeners(callback) { this.videoClickListeners.push(callback); }

  /*
    *  метод для формы введения геолокации
    *  передаёт введённую вручную геолокацию
    *  в метод onVideoClick класса TimelineControl
    */
  onVideoClick(e) {
    e.preventDefault();
    this.videoClickListeners.forEach((o) => o.call(null, ''));
  }

  /*
    *  изменяет содержимое медиа блока, то есть отображает длительность записи медиа
    */
  setTimeMediaInfo(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    this.btnMediaInfo.textContent = timeStr;
  }

  /*
    * создаёт окно предпросмотра записи видео
    */
  createStreamVideo(stream) {
    this.watchVideo = document.createElement('video');
    this.watchVideo.classList.add('stream');
    // video.dataset.id = 'video';
    this.watchVideo.srcObject = stream;
    this.watchVideo.muted = true;
    this.timelineForm.appendChild(this.watchVideo);
    this.watchVideo.play();
  }

  /*
    *  удаляет окно предпросмотра записи видео
    */
  removeStreamVideo() {
    if (this.watchVideo !== undefined) {
      this.watchVideo.remove();
    }
  }

  /*
    *  прячет кнопки микро, камеры и письма
    *  и отображает панель медиа ок, инфо, отмена
    */
  mediaOpenMedia() {
    this.timelineBody.setAttribute('readonly', 'true');
    this.timelineBody.classList.add('read-only');

    this.btnMediaOk.classList.remove('close');
    this.btnMediaInfo.classList.remove('close');
    this.btnMediaCancel.classList.remove('close');

    this.btnAudio.classList.add('close');
    this.btnVideo.classList.add('close');
    this.btnText.classList.add('close');
  }

  /*
    *  отображает кнопки микро, камеры и письма
    *  и прячет панель медиа ок, инфо, отмена
    */
  mediaCloseMedia() {
    this.timelineBody.removeAttribute('readonly');
    this.timelineBody.classList.remove('read-only');

    this.btnMediaOk.classList.add('close');
    this.btnMediaInfo.classList.add('close');
    this.btnMediaCancel.classList.add('close');

    this.btnAudio.classList.remove('close');
    this.btnVideo.classList.remove('close');
    this.btnText.classList.remove('close');
  }

  /*
    *  метод для вывода сообщения в placeholder внутри input
    *  используется для вывода ошибки
    *  принимает имя переменной и текст
    */
  message(input, text) {
    this[input].placeholder = text;
  }

  /*
    *  метод для удаления текста ошибки и класса ошибки у инпута
    *  срабатывает автоматически при фокусировке инпута
    */
  onFocusClear(input) {
    this.message(input, '');
    this[input].classList.remove('error-add');
  }

  /*
    *  метод добавляет текст ошибки и класс ошибки инпута
    */
  errorInputAdd(input, text) {
    this[input].value = '';
    this.message(input, text);
    this[input].classList.add('error-add');
  }

  /*
    *  метод для открытия попапа
    */
  popupOpen() {
    this.message('popUpGeoText', '00.00000, 00.00000');
    this.popUp.classList.remove('close');
  }

  /*
    *  метод для закрытия попапа
    */
  popupClose() {
    this.onFocusClear('popUpGeoText');
    this.popUpGeoText.value = '';
    this.popUp.classList.add('close');
  }
}
