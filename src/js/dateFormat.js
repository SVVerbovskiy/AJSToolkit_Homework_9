export default function dateFormat() {
  const dateObj = new Date(); // текущая дата и время
  const date = dateObj.toLocaleDateString(); // дата
  const time = dateObj.toLocaleTimeString(); // время

  return `${date} ${time}`; // возврат строки в виде DD.MM.YYYY HH:MM:SS
}
