import { getAllMovies } from "./db.js";

document.addEventListener("DOMContentLoaded", () => {

  // (Opcional) Como ya no hay login, hacemos visible “Añadir”
  document.body.classList.add("admin"); // así se verá lo .solo-admin por tu CSS

  const btnCatalog = document.getElementById("btn-catalog");
  const btnAdd = document.getElementById("btn-add");
  const btnTheme = document.getElementById("toggle-theme");
  const btnRandom = document.getElementById("btn-random");

  btnCatalog.addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  btnAdd.addEventListener("click", () => {
    window.location.href = "add.html";
  });

  // ¿QUÉ VEMOS HOY? (offline con IndexedDB)
  btnRandom.addEventListener("click", async () => {
    try {
      const peliculas = await getAllMovies();

      if (!peliculas || peliculas.length === 0) {
        mostrarToast("No hay películas en la colección.");
        return;
      }

      const random = peliculas[Math.floor(Math.random() * peliculas.length)];
      window.location.href = `movie.html?id=${random.id}`;
    } catch (error) {
      console.error(error);
      mostrarToast("Error al obtener una película aleatoria.");
    }
  });

  // TEMA
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") {
    document.body.classList.add("oscuro");
    btnTheme.textContent = "☀️";
  } else {
    btnTheme.textContent = "🌙";
  }

  btnTheme.addEventListener("click", () => {
    document.body.classList.toggle("oscuro");

    if (document.body.classList.contains("oscuro")) {
      localStorage.setItem("tema", "oscuro");
      btnTheme.textContent = "☀️";
    } else {
      localStorage.setItem("tema", "claro");
      btnTheme.textContent = "🌙";
    }
  });

  function mostrarToast(mensaje) {
    // Si no tienes toast en index, usa alert como fallback
    const toast = document.getElementById("toast");
    if (!toast) { alert(mensaje); return; }
    toast.textContent = mensaje;
    toast.classList.add("mostrar");
    setTimeout(() => toast.classList.remove("mostrar"), 2500);
  }
});
