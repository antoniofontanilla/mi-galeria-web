import express from "express";
import user from "../models/user.js"; // Importado como 'user'
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// --- RUTA: Registro de usuarios ---
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
    const rolesValidos = ["Artista", "Productor", "Estudio", "Oyente"];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({
        mensaje: "Rol no válido. Debe ser Artista, Productor, Estudio u Oyente",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    const nuevoUsuario = new user({
      // Usando 'user' según tu import
      nombre,
      nombreArtistico,
      correo,
      password: passwordEncriptada,
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

// --- RUTA: Login ---
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await user.findOne({ correo });
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida)
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    // MEJORA B: Usando variable de entorno para la firma
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
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

// --- RUTA: Subir foto de perfil ---
router.post("/:id/foto", upload.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;
    const rutaImagen = req.file.path;

    // MEJORA C: Corregido de 'User' a 'user' para que coincida con tu import
    await user.findByIdAndUpdate(id, { biografia: `Foto: ${rutaImagen}` });

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

// ... (El resto de tus rutas GET, PATCH y DELETE se mantienen igual,
// solo asegúrate de usar 'user' en minúscula)

router.get("/discovery", async (req, res) => {
  try {
    const { genero } = req.query;
    let filtro = { rol: "Artista" };

    if (genero) {
      filtro.generoMusical = genero;
    }

    // Asegúrate de usar 'user' aquí también
    const artistas = await user.find(filtro).sort({ fechaRegistro: -1 });
    res.status(200).json(artistas);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al buscar talentos", error: error.message });
  }
});

// --- GESTIÓN DE PORTAFOLIO ---

// 1. Agregar material (CREATE/UPDATE)
// PATCH: http://localhost:3000/api/users/:id/portfolio
router.patch("/:id/portfolio", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, url, tipo } = req.body; // Ejemplo: { "titulo": "California", "url": "...", "tipo": "Video" }

    const usuarioActualizado = await user.findByIdAndUpdate(
      id,
      { $push: { portfolio: { titulo, url, tipo } } },
      { new: true }, // Para que devuelva el usuario con el cambio ya hecho
    );

    res.status(200).json({
      mensaje: "Material añadido al portafolio",
      portfolio: usuarioActualizado.portfolio,
    });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al añadir material", error: error.message });
  }
});

// 2. Eliminar material (DELETE/UPDATE)
// DELETE: http://localhost:3000/api/users/:id/portfolio/:materialId
router.delete("/:id/portfolio/:materialId", auth, async (req, res) => {
  try {
    const { id, materialId } = req.params;

    const usuarioActualizado = await user.findByIdAndUpdate(
      id,
      { $pull: { portfolio: { _id: materialId } } }, // Saca el objeto que coincida con el ID del material
      { new: true },
    );

    res.status(200).json({
      mensaje: "Material eliminado correctamente",
      portfolio: usuarioActualizado.portfolio,
    });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al eliminar material", error: error.message });
  }
});

// --- RUTA: Actualizar Biografía y Género Musical (PROTEGIDA) ---
// PUT: http://localhost:3000/api/perfil
router.put("/perfil", auth, async (req, res) => {
  const { biografia, generoMusical } = req.body;

  try {
    // Usamos 'user' en minúscula y req.user.id que viene del token extraído por tu middleware
    const usuarioActualizado = await user
      .findByIdAndUpdate(
        req.user.id,
        { $set: { biografia, generoMusical } },
        { new: true }, // Para que devuelva el documento ya modificado
      )
      .select("-password"); // Por seguridad, no devolvemos la contraseña encriptada

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({
      mensaje: "¡Perfil actualizado con éxito!",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        mensaje: "Hubo un error al actualizar el perfil",
        error: error.message,
      });
  }
});

export default router;
