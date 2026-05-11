import multer from "multer";
import path from "path";

// Configurar cómo se guardan los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Los archivos irán a la carpeta uploads
  },
  filename: (req, file, cb) => {
    // Le pone la fecha actual al nombre para que no se repitan
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
export default upload;
