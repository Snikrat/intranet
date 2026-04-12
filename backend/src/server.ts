import { app } from "./app.js";
import { PORT, HOST, APP_URL } from "./config/env.js";

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em ${APP_URL}`);
});
