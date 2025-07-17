import express from "express";
import multer from "multer";
import cors from "cors";
import { config } from "dotenv";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

config();

const app = express();
const upload = multer();

const PORT = process.env.PORT || 3000;

// Настройка CORS — разрешаем запросы с localhost:5174 (твой фронтенд)
app.use(cors());

// Данные из .env
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!accountName || !accountKey || !containerName) {
  console.error("Ошибка: Не заданы переменные окружения для Azure Storage!");
  process.exit(1);
}

// Подключение к Azure Blob Storage
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Роут для загрузки одного файла
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Файл не передан" });
    }

    const { originalname, buffer, mimetype } = req.file;
    const blobName = `${Date.now()}-${originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: mimetype,
      },
    });

    res.json({ url: blockBlobClient.url });
  } catch (err) {
    console.error("Ошибка загрузки:", err.message);
    res.status(500).json({ error: "Ошибка загрузки файла" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
