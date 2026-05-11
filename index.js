import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"; // IMPORTANTE: Incluir el .js

dotenv.config({ path: "./.env" });

const app = express();
app.use(express.json());

// Prefijo para todas las rutas de usuario
app.use("/api/users", userRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conexión exitosa a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
