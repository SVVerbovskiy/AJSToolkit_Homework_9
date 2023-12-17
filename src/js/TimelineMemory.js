/* eslint-disable object-curly-newline */
import videoOne from '../video/videoOne.mp4'; // ссылка на видео
import aerials from '../video/System_Of_A_Down-Aerials.mp4'; // ссылка на видео
import audioOne from '../audio/levoe-uho-pravoe-uho-centr.mp3'; // ссылка на аудио

export default class TimelineMemory {
  constructor(storageKey = 'TimelineMemory') {
    this.storageKey = storageKey; // название ключа хранилища
    this.data = this.loadFromStorage(); // сразу подгружает данные из localStorage
  }

  /* метод в основном для примера, изначально добавляет в память три тестовых сообщения */
  init() {
    const posts = [
      { date: '04.08.2023 16:18:22', body: 'это текст сообщения 1', geo: '[51.312312, -0.12321]', type: 'text' },
      { date: '08.08.2023 20:22:26', body: videoOne, geo: '[55.312312, -0.12321]', type: 'video' },
      { date: '12.08.2023 17:19:23', body: audioOne, geo: '[52.312312, -0.12321]', type: 'audio' },
      { date: '13.10.2023 20:22:26', body: aerials, geo: '[55.312312, -0.12321]', type: 'video' },
    ];

    if (this.data.length === 0) {
      for (let i = 0; i < posts.length; i += 1) { this.addItem(posts[i]); }
    }
  }

  /* загружает данные из localStorage, если пусто, то поулчает [] */
  loadFromStorage() {
    const storedData = localStorage.getItem(this.storageKey);
    return storedData ? JSON.parse(storedData) : [];
  }

  /* сохранение текущих данных под заранее указанным ключом в localStorage */
  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  /* добавляет данные в массив и сохраняет его в localStorage */
  addItem(item) {
    this.data.push(item);
    this.saveToStorage();
  }

  /* получение массива постов */
  getAllItems() {
    return this.data;
  }

  /* удаление поста по индексе */
  removeItem(index) {
    if (index >= 0 && index < this.data.length) {
      this.data.splice(index, 1);
      this.saveToStorage();
    }
  }

  /* очистка массива данных памяти в localStorage */
  clear() {
    this.data = [];
    localStorage.removeItem(this.storageKey);
  }
}
