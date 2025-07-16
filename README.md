# Azure Upload Server

Сервер на Node.js для загрузки фото/видео в Azure Blob Storage.

## Установка

```bash
npm install
```

## Запуск

```bash
npm start
```

## Запрос

POST `/upload`

Форма: `form-data`  
Ключ: `file`  
Тип: `File`

## Ответ

```json
{
  "url": "https://youraccount.blob.core.windows.net/uploads/..."
}
```
