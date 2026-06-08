import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Cargar variables de entorno del archivo .env
dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// --- DEFINICIÓN DE RUTA DESDE CERO ---
// Creamos la ruta tipo GET directamente aquí para evitar importar archivos externos que puedan fallar
app.get("/api/artistas", async (req, res) => {
  try {
    // Accedemos directamente a la colección 'users' que ya vimos que existe en tu Atlas
    const usuarios = await mongoose.connection.db
      .collection("users")
      .find({})
      .toArray();

    // Enviamos los datos directo al frontend
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener datos de la base de datos",
        detalle: error.message,
      });
  }
});

// --- CONEXIÓN A MONGOOSE ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("=========================================");
    console.log("🚀 ¡CONECTADO EXITOSAMENTE A MONGO DB ATLAS!");
    console.log("=========================================");
  })
  .catch((error) => {
    console.log("=========================================");
    console.log("❌ ERROR AL CONECTAR A MONGO DB:", error.message);
    console.log("=========================================");
  });

// Levantar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
