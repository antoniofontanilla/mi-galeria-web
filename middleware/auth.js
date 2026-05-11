import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  // 1. Buscamos el token en los encabezados (headers)
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ mensaje: "No hay token, permiso denegado" });
  }

  try {
    // 2. Verificamos si el token es válido
    const cifrado = jwt.verify(
      token.replace("Bearer ", ""),
      "TU_FIRMA_SECRETA",
    );
    req.user = cifrado; // Guardamos los datos del usuario en la petición
    next(); // ¡Pase libre!
  } catch (error) {
    res.status(401).json({ mensaje: "Token no es válido" });
  }
};

export default auth;
