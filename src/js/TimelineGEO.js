/* eslint-disable no-console */
export default class TimelineGEO {
  constructor() {
    this.status = false; // статус поддержки API geolocation
  }

  /* проверка поддержки браузеров API геолокации */
  checkSupportGEO() {
    if (navigator.geolocation) { this.status = true; }
  }

  /* получение текущей геолокации */
  async getPosition() {
    if (!this.status) { return false; } // если не поддерживается, то завершаем метод

    /*
    *  Оборачиваем в try catch, так как нужно обработать ошибку при отсутствии доступа к геолокации.
    *  если доступ есть, возвращается широта и долгота и статус истина
    *  если доступа нет, то возвращается объект ошибки
    */
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (data) => {
            const { latitude, longitude } = data.coords;
            resolve({ latitude, longitude, status: true });
          },
          (err) => {
            reject(err);
          },
          { enableHighAccuracy: true },
        );
      });
      return position;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting  geolocation:', error);
      return false;
    }
  }
}
