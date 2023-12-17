import geoValidation from '../geoValidation';

test.each([
  ['Валидный', '51.50851444, -0.1257', { latitude: 51.50851444, longitude: -0.1257 }],
  ['Валидный', '[51.50851, -0.12572]', { latitude: 51.50851, longitude: -0.12572 }],
  ['Валидный', '51.50851,-0.12572', { latitude: 51.50851, longitude: -0.12572 }],
  ['Валидный', '51.50851,0.12573', { latitude: 51.50851, longitude: 0.12573 }],
  ['Невалидный', '511.50851, -0.12572', false],
  ['Невалидный', '51.50851.-0.12572', false],
  ['Невалидный', '51,50851', false],
  ['Невалидный', '[51.50851, -0.12572', false],
  ['Невалидный', '-251.50851, -0.12572', false],
  ['Невалидный', '51.50851, -900.12572', false],
])(
  ('test geoValidation, value = %s: %s'),
  (_, geoStr, expected) => {
    const received = geoValidation(geoStr);

    expect(received).toEqual(expected);
  },
);
