// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // cambia al puerto donde corre tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
