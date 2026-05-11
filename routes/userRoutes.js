import express from "express";
// 1. Asegúrate de que el nombre del archivo sea idéntico al de tu carpeta models (ej: User.js)
import user from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// --- RUTA POST (Para registrar usuarios) ---

router.post("/register", async (req, res) => {
  try {
    const {
      nombre,
      nombreArtistico,
      correo,
      password,
      rol,
      generoMusical,
      biografia,
    } = req.body;

    // 1. Encriptamos la contraseña (10 es el nivel de seguridad)
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 2. Creamos el usuario con la contraseña secreta
    const nuevoUsuario = new user({
      nombre,
      nombreArtistico,
      correo,
      password: passwordEncriptada, // Aquí se guarda el código secreto, no el texto plano
      rol,
      generoMusical,
      biografia,
    });

    await nuevoUsuario.save();
    res.status(201).json({
      mensaje: "Usuario creado con éxito",
      usuario: { nombreArtistico, correo },
    });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al registrar usuario", error: error.message });
  }
});

// --- RUTA GET (Para el Módulo de Descubrimiento) ---
router.get("/discovery", async (req, res) => {
  try {
    const { genero } = req.query;
    let filtro = { rol: "Artista" }; // Por defecto buscamos artistas

    if (genero) {
      filtro.generoMusical = genero;
    }

    const artistas = await user.find(filtro).sort({ fechaRegistro: -1 });
    res.status(200).json(artistas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al buscar talentos",
      error: error.message,
    });
  }
});

// Ruta para añadir material al portafolio: PATCH http://localhost:3000/api/users/:id/portfolio
router.patch("/:id/portfolio", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const nuevoMaterial = req.body; // Ejemplo: { "titulo": "California", "url": "...", "tipo": "Video" }

    const usuarioActualizado = await user.findByIdAndUpdate(
      id,
      { $push: { portfolio: nuevoMaterial } }, // Usamos $push para no borrar lo que ya existe
      { new: true },
    );

    res.status(200).json({
      mensaje: "Portafolio actualizado con éxito",
      portfolio: usuarioActualizado.portfolio,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar portafolio",
      error: error.message,
    });
  }
});

// RUTA DE LOGIN
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    // 1. Buscar si el usuario existe
    const usuario = await user.findOne({ correo });
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    // 2. Verificar la contraseña (comparar la que envías con la encriptada)
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida)
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    // 3. Crear el Token (el "pase" que dura 24 horas)
    const token = jwt.sign({ id: usuario._id }, "TU_FIRMA_SECRETA", {
      expiresIn: "24h",
    });

    res.status(200).json({
      mensaje: "Login exitoso",
      token,
      nombreArtistico: usuario.nombreArtistico,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
});

// ... (aquí termina tu ruta de login)

// NUEVA RUTA: Pegar aquí abajo
router.post("/:id/mensaje", async (req, res) => {
  try {
    const { emisor, correoContacto, contenido } = req.body;
    const { id } = req.params;

    await user.findByIdAndUpdate(id, {
      $push: { mensajes: { emisor, correoContacto, contenido } },
    });

    res.status(200).json({ mensaje: "Mensaje enviado con éxito al artista" });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al enviar mensaje", error: error.message });
  }
});

// Ruta para eliminar un elemento del portafolio: DELETE http://localhost:3000/api/users/:id/portfolio/:materialId
router.delete("/:id/portfolio/:materialId", auth, async (req, res) => {
  try {
    const { id, materialId } = req.params;

    const usuarioActualizado = await user.findByIdAndUpdate(
      id,
      { $pull: { portfolio: { _id: materialId } } }, // $pull saca el objeto que coincida con el ID
      { new: true },
    );

    res.status(200).json({
      mensaje: "Material eliminado correctamente",
      portfolio: usuarioActualizado.portfolio,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al eliminar material",
      error: error.message,
    });
  }
});

// Ruta para subir foto de perfil: POST http://localhost:3000/api/users/:id/foto
router.post("/:id/foto", upload.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;
    const rutaImagen = req.file.path; // Aquí se guarda la ruta del archivo

    await User.findByIdAndUpdate(id, { biografia: `Foto: ${rutaImagen}` });

    res.status(200).json({
      mensaje: "Imagen subida con éxito",
      archivo: req.file,
    });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al subir imagen", error: error.message });
  }
});

export default router;
