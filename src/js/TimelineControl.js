import geoValidation from './geoValidation'; // функция для валидации строки с гео данными
import dateFormat from './dateFormat'; // функция выводит текущую дату в нужнмо формате

export default class TimelineControl {
  constructor(timelineDOM, timelineGEO, storage, recorder) {
    /* переменные с другими классами */
    this.timelineDOM = timelineDOM;
    this.timelineGEO = timelineGEO;
    this.storage = storage;
    this.recorder = recorder;

    this.lastMessage = {}; // хранит данные поста для отправки после ввода гео данных
  }

  /*
  *  инициализация класса и отрисовывка DOM
  *  прослушивает callback-и методов из других классов
  *  и проверяет работоспособность сервера
  */
  init() {
    this.storage.init(); // инициализация класса с паматью
    this.timelineDOM.drawUI(); // отрисовка DOM
    this.timelineGEO.checkSupportGEO(); // проверка поддержки определения местоположения

    /*
    *  передаём методы в колбек, они будут вызваны в класе TimelineDOM
    *  с сохранением контекста класса TimelineControl
    */
    this.timelineDOM.addTextSubmitListeners(this.onTextSubmit.bind(this));
    this.timelineDOM.addPopUpSubmitListeners(this.onPopUpSubmit.bind(this));
    this.timelineDOM.addVideoClickListeners(this.onVideoClick.bind(this));
    this.timelineDOM.addAudioClickListeners(this.onAudioClick.bind(this));
    this.timelineDOM.addMediaOkListeners(this.onMediaOk.bind(this));
    this.timelineDOM.addMediaCancelListeners(this.onMediaCancel.bind(this));

    /* отрисовка постов в ленте из памяти при загрузке страницы */
    const allItems = this.storage.getAllItems();
    for (let i = 0; i < allItems.length; i += 1) { this.timelineDOM.renderMessage(allItems[i]); }
  }

  /*
  *  обработка кнопки отправить сообщение
  */
  async onTextSubmit(body) {
    if (!body) {
      this.timelineDOM.errorInputAdd('timelineBody', 'Введите текст');
      return;
    }
    const date = dateFormat(); // текущая дата и время
    const type = 'text'; // тип сообщения

    this.sendPostWithGeo({ date, body, type }); // отправка сообщения с обработкой геоданных
  }

  /*
  *  метод запускает запись медиа (видео или аудио)
  *  выводит ошибку, если запись не началась
  */
  async mediaStartRecord(option, errorText) {
    this.timelineDOM.onFocusClear('timelineBody'); // очистка ошибки

    const stream = await this.recorder.startRecording(option); // запуск записи
    if (!stream) { // если разрешения к микрофону нет, то вывод ошибки
      this.timelineDOM.errorInputAdd('timelineBody', errorText);
      return;
    }

    this.timelineDOM.mediaOpenMedia(); // открытие панели медиа

    /* вывод секунд на медиа панели */
    let seconds = 0;
    this.timelineDOM.setTimeMediaInfo(seconds);
    this.secondMediaID = setInterval(() => {
      seconds += 1;
      this.timelineDOM.setTimeMediaInfo(seconds);
    }, 1000);

    /* если тип видео, то открываем предпросмотр видео */
    if (option.video) { this.timelineDOM.createStreamVideo(stream); }
  }

  /*
  * клик по микрофону, записывает аудио
  */
  async onAudioClick() {
    const option = { audio: true }; // опции для видео
    const errorText = 'разрешите использование микрофона и камеры'; // текст ошибки
    this.mediaStartRecord(option, errorText); // запуск записи
  }

  /*
  *  клик по камере, записывает видео
  */
  async onVideoClick() {
    const option = { audio: true, video: true }; // опции для видео
    const errorText = 'разрешите использование микрофона и камеры'; // текст ошибки
    this.mediaStartRecord(option, errorText); // запуск записи
  }

  /*
  *  обработка формы с ручным вводом геолокации
  */
  async onPopUpSubmit(value) {
    const { dataID, geoStr } = value; // dataID кнопки и строка с гео данными
    if (!dataID) { return; } // если dataID нету, то заканчиваем

    /* если нажата кнопка отмена, закрываем попап */
    if (dataID === 'popup-cansel') { this.timelineDOM.popupClose(); }

    /* если нажата кнопка ОК, то обрабатываем */
    if (dataID === 'popup-submit') {
      const message = {
        date: dateFormat(), // текущая дата,
        body: this.lastMessage.body,
        type: this.lastMessage.type,
      };

      /*
      *  Если строка пустая, пытаемся получить данные с браузера,
      *  если поулчилось, то разрешаем отправку сообщения
      */
      if (geoStr === '') {
        message.post = true; // обозначение, что сообщение из формы

        // отправка сообщения с обработкой геоданных
        const sendPost = await this.sendPostWithGeo(message);
        if (sendPost) { // если сообщение отправилось
          this.timelineDOM.popupClose(); // закрываем форму ввода гео данных
          return; // заканчиваем обработку метода
        }
      }

      const geoObj = geoValidation(geoStr); // валидация введёных значений

      /* если строка не прошла валидацию, то выводим ошибку валидации */
      if (!geoObj) {
        this.timelineDOM.errorInputAdd('popUpGeoText', 'Неверный формат [00.00000, 00.00000]');
        return;
      }

      /* если строка прошла валидацию, то отправляем сообщение и рисуем пост */
      if (geoObj) {
        this.timelineDOM.popupClose(); // закрываем форму ввода гео данных
        message.geo = `[${geoObj.latitude.toFixed(5)}, ${geoObj.longitude.toFixed(5)}]`;
        this.storage.addItem(message); // сохраняем пост в памяти
        this.timelineDOM.renderMessage(message); // отрисовываем пост в DOM
      }
    }
  }

  /*
  *  кноопка ОК на панели медиа, обрабатывает записанное медиа в пост
  */
  async onMediaOk() {
    clearInterval(this.secondMediaID); // останвока счётчика времени на панели инфо
    this.timelineDOM.mediaCloseMedia(); // закрытие медиа панели

    const date = dateFormat(); // текущая дата
    this.recorder.stopRecording(); // остановка записи
    const { url, type } = await this.recorder.getRecordingAsBlob(); // получаем блоб ссылку и тип

    // если тип видео, то удаляем предпросмотр видео
    if (type === 'video') { this.timelineDOM.removeStreamVideo(); }

    this.sendPostWithGeo({ date, body: url, type }); // отправка сообщения с обработкой геоданных
  }

  /*
  *  кнопка отмена на панели медиа, отменяет записанное медиа
  */
  onMediaCancel() {
    clearInterval(this.secondMediaID); // останвока счётчика времени на панели инфо
    this.recorder.stopRecording(); // стоп записи
    this.timelineDOM.mediaCloseMedia(); // закрытие медиа панели
    this.timelineDOM.removeStreamVideo(); // удаление предпросмотра видео, если оно было
  }

  /*
  *  метод отправляет пост в ленту с обработкой геопозиции
  */
  async sendPostWithGeo(option) {
    const message = option; // перезаписываем так как ругается eslint
    const position = await this.timelineGEO.getPosition(); // получаем гео данные

    /* если гео данные вернулись со статусом ОК, то отправляется сообщение */
    if (position && position.status) {
      const { latitude, longitude } = position;
      message.geo = `[${parseFloat(latitude.toFixed(5))}, ${parseFloat(longitude.toFixed(5))}]`;
      this.storage.addItem(message); // сохраняем пост в память
      this.timelineDOM.renderMessage(message); // отрисовываем пост в ленте
      return true;
    }

    /*
    * если гео данные вернулись с ошибкой, то данные сообщения сохраняются без отправки.
    * Вызывают форму для ручного ввода, если вызывалась не из формы
    */
    if (!position && !message.form) {
      this.lastMessage = message;
      this.timelineDOM.popupOpen();
      return false;
    }

    return false;
  }
}
