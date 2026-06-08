// js/app.js - Versión oficial usando la API de la lista del profesor
const galeria = document.getElementById("galeria");
const btnCargar = document.getElementById("cargar");
const inputBuscar = document.getElementById("buscar");

// 🌐 URL de la API pública elegida de la lista (Usuarios de prueba)
const API_URL = "https://jsonplaceholder.typicode.com/users";

let listaArtistas = [];

// Función asíncrona para consumir la API externa
async function cargarArtistas() {
  // 1. Estado de carga exigido por la pauta
  galeria.innerHTML =
    "<p class='status-msg'>Cargando usuarios desde la API...</p>";

  try {
    // Hacemos el fetch directo a internet (no a localhost)
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`);
    }

    // Guardamos los datos que nos entrega JSONPlaceholder
    listaArtistas = await response.json();
    renderizarTarjetas(listaArtistas);
  } catch (error) {
    // Manejo de errores en pantalla
    galeria.innerHTML =
      "<p class='status-msg error'>No se pudo conectar con el servidor de música.</p>";
    console.error("Error al consultar la API pública:", error);
  }
}

// Función para dibujar las tarjetas con la estructura de la nueva API
function renderizarTarjetas(usuarios) {
  galeria.innerHTML = "";

  if (usuarios.length === 0) {
    galeria.innerHTML =
      "<p class='status-msg'>No se encontraron registros.</p>";
    return;
  }

  usuarios.forEach((usuario) => {
    const card = document.createElement("article");
    card.className = "tarjeta";

    // Usamos un avatar gratuito de internet usando el ID del usuario para que cada uno tenga foto diferente y no salga roto
    const fotoPerfil = `https://api.dicebear.com/7.x/bottts/svg?seed=${usuario.username}`;

    // Mapeamos los campos reales que entrega JSONPlaceholder (name, email, company)
    const nombreMostrar = usuario.name;
    const emailMostrar = usuario.email;
    const tagCiudad = usuario.address.city.toUpperCase(); // Usamos la ciudad como "Tag" visual
    const fraseBiografia = `Trabaja en ${usuario.company.name}: "${usuario.company.catchPhrase}"`;

    card.innerHTML = `
            <img src="${fotoPerfil}" alt="Avatar de ${nombreMostrar}" style="background: #2a2f3b; border-radius: 8px; padding: 10px;">
            <h3>${nombreMostrar}</h3>
            <span class="genero-tag">${tagCiudad}</span>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #b3b3b3;">${emailMostrar}</p>
            <p>${fraseBiografia}</p>
        `;

    galeria.appendChild(card);
  });
}

// Buscador dinámico adaptado a los nuevos datos (busca por Ciudad/Tag)
inputBuscar.addEventListener("input", (e) => {
  const textoBusqueda = e.target.value.toLowerCase().trim();

  const filtrados = listaArtistas.filter((usuario) => {
    const ciudad = usuario.address.city.toLowerCase();
    const nombre = usuario.name.toLowerCase();
    return ciudad.includes(textoBusqueda) || nombre.includes(textoBusqueda);
  });

  renderizarTarjetas(filtrados);
});

// Evento del botón
btnCargar.addEventListener("click", cargarArtistas);
