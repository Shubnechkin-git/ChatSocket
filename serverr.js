const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable.
const genAI = new GoogleGenerativeAI("AIzaSyB62pmxP_NUEHMNAziX7qC_gHgc763q_Ho");

async function run(prompt) {
  // Choose a model that's appropriate for your use case.
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(text);
    return text;
  } catch (err) {
    console.log(err);
  }
}

app.use(express.static("./")); // Сервировка статических файлов

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, `./client.html`));
});

const messages = []; // Массив для хранения сообщений
// Server (index.js)
const users = {}; // Объект для хранения пользователей и их имен

let index = 1;
try {
  io.on("connection", (socket) => {
    console.log("Новый пользователь подключился:", socket.id);

    // Запрос имени пользователя
    socket.emit("request username");

    socket.on("username", (username) => {
      users[socket.id] = username; // Сохранение имени пользователя
      username = !username ? "user" + index : username;
      index++;
      console.log("Имя пользователя:", username, " (ID:", socket.id, ")");

      // Отправка истории сообщений
      socket.emit("chat history", messages);

      // Отправка сообщения о подключении
      socket.emit("user joined", username); // Сообщение всем, кроме нового пользователя
      socket.broadcast.emit("user joined", username); // Сообщение всем, кроме нового пользователя

      socket.on("chat message", (msg) => {
        console.log("Сообщение:", msg);
        run(msg);
        messages.push({ username: username, message: msg }); // Добавление сообщения с именем
        io.emit("chat message", { username: username, message: msg });
      });

      socket.on("disconnect", () => {
        console.log("Пользователь отключился:", socket.id);
        delete users[socket.id]; // Удаление пользователя из списка
        socket.broadcast.emit("user left", username); // Сообщение всем о выходе
      });
    });
  });
} catch (err) {
  console.log(err);
}

http.listen(8080, () => {
  console.log("Сервер запущен на http://localhost:8080");
});
