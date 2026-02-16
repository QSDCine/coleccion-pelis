import { getMovie, deleteMovie, blobToObjectURL } from "./db.js";

document.addEventListener("DOMContentLoaded", async () => {
  // MODO OSCURO
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") document.body.classList.add("oscuro");

  // ID
  const params = new URLSearchParams(window.location.search);
  const idPelicula = params.get("id");
  if (!idPelicula) {
    alert("No se ha especificado ninguna película.");
    return;
  }

  // CARGAR
  const pelicula = await getMovie(idPelicula);
  if (!pelicula) {
    alert("Película no encontrada.");
    window.location.href = "catalog.html";
    return;
  }

  // RELLENAR
  document.getElementById("titulo-pelicula").textContent = pelicula.titulo;

  const portada = document.getElementById("portada");
  const fallback = "img/default.jpg";
  const portadaUrl = blobToObjectURL(pelicula.portadaBlob) || fallback;

  portada.src = portadaUrl;
  portada.alt = pelicula.titulo;

  // LIGHTBOX
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  portada.addEventListener("click", () => {
    lightboxImg.src = portada.src;
    lightbox.classList.add("visible");
  });

  lightbox.addEventListener("click", () => {
    lightbox.classList.remove("visible");
  });

  document.getElementById("año").textContent = pelicula.año;
  document.getElementById("director").textContent = (pelicula.director || []).join(", ");
  document.getElementById("generos").textContent = (pelicula.generos || []).join(", ");
  document.getElementById("formato").textContent = pelicula.formato;
  document.getElementById("edicionEspecial").textContent = pelicula.edicionEspecial ? "Sí" : "No";

  const sagaSpan = document.getElementById("saga");
  const saga = pelicula.saga || {};
  sagaSpan.textContent = saga.esParte ?
     `Película ${saga.numero} de ${saga.totalsaga} de ${saga.nombre}`
    : "No pertenece a ninguna saga";

  document.getElementById("notas").textContent = pelicula.notas;

  // BOTÓN VER SAGA
  const btnSaga = document.getElementById("btn-ver-saga");
  if (saga?.esParte && saga?.nombre?.trim()) {
    btnSaga.classList.remove("oculto");
    btnSaga.addEventListener("click", () => {
      sessionStorage.setItem("catalogo_saga", saga.nombre);
      window.location.href = `catalog.html?saga=${encodeURIComponent(saga.nombre)}`;
    });
  } else {
    btnSaga.classList.add("oculto");
  }

  // OTRAS EDICIONES
  document.getElementById("btn-otras-ediciones").addEventListener("click", () => {
    window.location.href = `catalog.html?edicionExacta=${encodeURIComponent(pelicula.titulo)}`;
  });

  // ATRÁS
  document.getElementById("btn-atras").addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  // EDITAR
  document.getElementById("btn-editar").addEventListener("click", () => {
    window.location.href = `edit.html?id=${idPelicula}`;
  });

  // ELIMINAR
  document.getElementById("btn-eliminar").addEventListener("click", async () => {
    if (!confirm("¿Seguro que quieres eliminar esta película?")) return;

    try {
      await deleteMovie(idPelicula);
      alert("Película eliminada correctamente.");
      window.location.href = "catalog.html";
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar la película.");
    }
  });

  // VOLVER TOP
  document.getElementById("btn-volver-top").addEventListener("click", () => {
    window.location.href = "catalog.html";
  });

  // Limpieza de objectURL (evita fugas)
  window.addEventListener("beforeunload", () => {
    if (pelicula.portadaBlob && portadaUrl && portadaUrl.startsWith("blob:")) {
      URL.revokeObjectURL(portadaUrl);
    }
  });
});
