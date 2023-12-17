export default class TimelineMedia {
  constructor() {
    this.stream = null; // переменная стрим медиа
    this.mediaRecorder = null; // переменная медиа рекорде
    this.chunks = []; // массив для огрызков стрима
    this.type = null; // переменная для типа видео
    this.status = true; // статус поддержки API
  }

  /*
    *  метод для начала записи медиа
    */
  async startRecording(options) {
    this.chunks = []; // очищаем массив перед записью

    /* устонавливаем тип медиа в переменную */
    if (!options.video) { this.type = 'audio'; }
    if (options.video) { this.type = 'video'; }

    /*
      *  оборачиваем в try catch так как нужно обработать ошибку при отсутствии доступа к медиа.
      *  если доступ есть, возвращается стрим,
      *  если доступа нет, то устонавливается статус ложь и возвращается ложь, выводится ошибка
      */
    try {
      /* установка настроек по опциям и если опций нет, то установка дефолтных настроек */
      const audio = options.audio || false;
      const width = options.width || 640;
      const height = options.height || 480;
      const video = options.video ? { width, height } : false;
      const constraints = { audio, video };

      /* запуск стрима и передача его в MediaRecorder */
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.mediaRecorder = new MediaRecorder(this.stream);

      /* собираем огрызки потока в массив по событию */
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start(); // старт записи mediaRecorder

      return this.stream; // если всё хорошо, то возвращается метод возвращает стрим
    } catch (error) {
      this.status = false;
      // eslint-disable-next-line no-console
      console.error('Error starting recording:', error);
      return false; // если ошибка, то возвращается ложь
    }
  }

  /*
    *  метод для остановки записи и остановки стрима
    */
  stopRecording() {
    if (!this.status) { return; }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }

  /*
    *  метод возвращает blob ссылку на записанное медиа и тип медиа
    */
  async getRecordingAsBlob() {
    if (!this.status) { return false; }
    return new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = () => {
        if (this.chunks.length === 0) {
          reject(new Error('No data recorded.'));
          return;
        }

        const blob = new Blob(this.chunks, { type: this.stream.getTracks()[0].kind });
        const url = URL.createObjectURL(blob);
        const { type } = this;

        resolve({ url, type });
      };
    });
  }
}
