import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nombreArtistico: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mensajes: [
    {
      emisor: { type: String, required: true }, // Quién escribe
      correoContacto: { type: String, required: true },
      contenido: { type: String, required: true },
      fecha: { type: Date, default: Date.now },
    },
  ],
  rol: {
    type: String,
    enum: ["Artista", "Productor", "Estudio", "Oyente"], // Roles según tu plan [cite: 411]
    default: "Artista",
  },
  generoMusical: [String],
  biografia: String,
  portfolio: [
    {
      titulo: String,
      url: String,
      tipo: { type: String, enum: ["Single", "Video", "Álbum"] },
    },
  ],
  fechaRegistro: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
