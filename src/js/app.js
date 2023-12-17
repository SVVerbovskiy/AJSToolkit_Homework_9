/* eslint-disable no-console */
import TimelineControl from './TimelineControl';
import TimelineDOM from './TimelineDOM';
import TimelineGEO from './TimelineGEO';
import TimelineMemory from './TimelineMemory';
import TimelineMedia from './TimelineMedia';

/* элемент блока div в DOM */
const hw = document.querySelector('#hw');

/*
*  создание класса отвечающего за DOM
*  и присвоение ему div элемента
*/
const timelineDOM = new TimelineDOM();
timelineDOM.bindToDOM(hw);

/* создание класса отвечающего за GEO  */
const timelineGEO = new TimelineGEO();

/* создание класс управления хранилищем */
const storage = new TimelineMemory();

/* создание класс отвечающего за медиа  */
const recorder = new TimelineMedia();

/* создание класса отвечающего за контрольт и инициализация класса */
const timelineControl = new TimelineControl(timelineDOM, timelineGEO, storage, recorder);
timelineControl.init();

console.log('app started');
