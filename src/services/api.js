// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://capex-back.onrender.com/api", // cambia al puerto donde corre tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
