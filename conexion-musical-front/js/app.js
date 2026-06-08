// Referencias limpias al DOM
const galeria = document.getElementById("galeria");
const btnCargar = document.getElementById("cargar");
const inputBuscar = document.getElementById("buscar");

// URL de la API exacta definida en nuestro index.js
const API_URL = "http://localhost:5000/api/artistas";

let listaArtistas = [];

// Función para consumir los datos
async function cargarArtistas() {
  // Limpiamos mensajes anteriores y ponemos el estado de carga obligatorio
  galeria.innerHTML =
    "<p class='status-msg'>Cargando talentos emergentes...</p>";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    listaArtistas = await response.json();
    renderizarTarjetas(listaArtistas);
  } catch (error) {
    // En caso de error real, se muestra el aviso en rojo
    galeria.innerHTML =
      "<p class='status-msg error'>No se pudo conectar con el servidor de música.</p>";
    console.error("Error en la petición:", error);
  }
}

// Función para dibujar las tarjetas en el HTML
function renderizarTarjetas(artistas) {
  galeria.innerHTML = "";

  if (artistas.length === 0) {
    galeria.innerHTML =
      "<p class='status-msg'>No se encontraron artistas registrados.</p>";
    return;
  }

  artistas.forEach((artista) => {
    // Validación estricta: si no viene el campo, saltamos el registro
    if (!artista || !artista.nombreArtistico) return;

    const card = document.createElement("article");
    card.className = "tarjeta";

    // Manejo seguro de campos vacíos o arreglos de género
    const fotoPerfil =
      artista.imagenPerfil || "https://via.placeholder.com/250";
    const biografiaText =
      artista.biografia || "Este artista aún no ha agregado una biografía.";

    // Como vimos que generoMusical es un Array en tu Atlas, lo unimos con comas si es un arreglo, o lo dejamos como texto si viene plano
    const generoText = Array.isArray(artista.generoMusical)
      ? artista.generoMusical.join(", ")
      : artista.generoMusical || "Urbano";

    card.innerHTML = `
            <img src="${fotoPerfil}" alt="Foto de ${artista.nombreArtistico}">
            <h3>${artista.nombreArtistico}</h3>
            <span class="genero-tag">${generoText}</span>
            <p>${biografiaText}</p>
        `;

    galeria.appendChild(card);
  });
}

// Buscador dinámico por género
inputBuscar.addEventListener("input", (e) => {
  const textoBusqueda = e.target.value.toLowerCase().trim();

  const artistasFiltrados = listaArtistas.filter((artista) => {
    // Manejo seguro si es array o string para el filtro
    let generoStr = "";
    if (Array.isArray(artista.generoMusical)) {
      generoStr = artista.generoMusical.join(" ").toLowerCase();
    } else if (artista.generoMusical) {
      generoStr = artista.generoMusical.toLowerCase();
    }
    return generoStr.includes(textoBusqueda);
  });

  renderizarTarjetas(artistasFiltrados);
});

// Evento del botón para gatillar la carga
btnCargar.addEventListener("click", cargarArtistas);
