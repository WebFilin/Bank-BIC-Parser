const jsonBicName = "BIC.json";

export default Object.freeze({
  PORT: 5000,
  url: "http://www.cbr.ru/s/newbik",
  getFilePath: `DB/get_BIC/`,
  jsonFilePath: `DB/BIC_json/${jsonBicName}`,

  messanges: [
    "Сервер запущенн на порту",
    "Фаил получен от ЦБ РФ, код HTTP: ",
    "Фаил распакован из ZIP в ",
    "Парсинг XML - успех",
    "Создан JSON с БИК, названием банка и аккаунтом",
    "JSON сохранен в ",
  ],

  errors: [
    "Ошибка HTTP",
    "Ошибка распаковки фаила",
    "Ошибка парсинга XML",
    "Ошибка создания JSON",
    "Ошибка сохранения JSON",
  ],
});
