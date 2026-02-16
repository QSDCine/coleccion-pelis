import { getMovie, updateMovie, buildCoverBlobs } from "./db.js";

document.addEventListener("DOMContentLoaded", async () => {
  // MODO OSCURO
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") document.body.classList.add("oscuro");

  // ID
  const params = new URLSearchParams(window.location.search);
  const idPelicula = params.get("id");

  if (!idPelicula) {
    mostrarToast("No se ha especificado ninguna película para editar.");
    return;
  }

  // REFERENCIAS
  const form = document.getElementById("form-edit");

  const inputTitulo = document.getElementById("titulo");
  const inputAño = document.getElementById("año");
  const inputDirector = document.getElementById("director");
  const inputGeneros = document.getElementById("generos");
  const selectFormato = document.getElementById("formato");
  const selectEdicionEspecial = document.getElementById("edicionEspecial");
  const selectEsParteSaga = document.getElementById("esParteSaga");

  const camposSaga = document.getElementById("campos-saga");
  const inputNombreSaga = document.getElementById("nombreSaga");
  const inputNumeroSaga = document.getElementById("numeroSaga");
  const inputTotalSaga = document.getElementById("totalSaga");

  const inputNotas = document.getElementById("notas");
  const inputPortada = document.getElementById("portada");

  // CARGAR
  const pelicula = await getMovie(idPelicula);
  if (!pelicula) {
    mostrarToast("Película no encontrada.");
    window.location.href = "catalog.html";
    return;
  }

  // RELLENAR
  inputTitulo.value = pelicula.titulo ?? "";
  inputAño.value = pelicula.año ?? "";
  inputDirector.value = Array.isArray(pelicula.director) ? pelicula.director.join(", ") : (pelicula.director ?? "");
  inputGeneros.value = Array.isArray(pelicula.generos) ? pelicula.generos.join(", ") : (pelicula.generos ?? "");
  selectFormato.value = pelicula.formato ?? "";
  selectEdicionEspecial.value = pelicula.edicionEspecial ? "true" : "false";
  inputNotas.value = pelicula.notas ?? "";

  const sagaActual = pelicula.saga || { esParte: false, nombre: "", numero: null, totalsaga: null };

  if (sagaActual.esParte) {
    selectEsParteSaga.value = "true";
    camposSaga.style.display = "block";
    inputNombreSaga.value = sagaActual.nombre ?? "";
    inputNumeroSaga.value = sagaActual.numero ?? "";
    inputTotalSaga.value = sagaActual.totalsaga ?? "";
    inputNombreSaga.required = true;
    inputNumeroSaga.required = true;
    inputTotalSaga.required = true;
  } else {
    selectEsParteSaga.value = "false";
    camposSaga.style.display = "none";
  }

  // MOSTRAR/OCULTAR SAGA
  selectEsParteSaga.addEventListener("change", () => {
    const on = selectEsParteSaga.value === "true";
    camposSaga.style.display = on ? "block" : "none";
    inputNombreSaga.required = on;
    inputNumeroSaga.required = on;
    inputTotalSaga.required = on;

    if (!on) {
      inputNombreSaga.value = "";
      inputNumeroSaga.value = "";
      inputTotalSaga.value = "";
    }
  });

  // GUARDAR CAMBIOS
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      mostrarToast("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const directores = inputDirector.value
      .split(",")
      .map(d => d.trim())
      .filter(Boolean);

    const generos = inputGeneros.value
      .split(",")
      .map(g => g.trim())
      .filter(Boolean);

    const saga = {
      esParte: selectEsParteSaga.value === "true",
      nombre: selectEsParteSaga.value === "true" ? inputNombreSaga.value.trim() : "",
      numero: selectEsParteSaga.value === "true" ? Number(inputNumeroSaga.value) : null,
      totalsaga: selectEsParteSaga.value === "true" ? Number(inputTotalSaga.value) : null
    };

    const file = inputPortada.files?.[0] || null;

    const patch = {
      titulo: inputTitulo.value.trim(),
      año: Number(inputAño.value),
      director: directores, // ✅ ARRAY
      generos: generos,     // ✅ ARRAY
      formato: selectFormato.value,
      edicionEspecial: selectEdicionEspecial.value === "true",
      saga,
      notas: inputNotas.value.trim()
    };

    if (file) {
      const { coverBlob, thumbBlob } = await buildCoverBlobs(file);
      patch.portadaBlob = coverBlob;
      patch.portadaThumbBlob = thumbBlob;
    }

    try {
      await updateMovie(idPelicula, patch);
      mostrarToast("Cambios guardados correctamente.");
      window.location.href = `movie.html?id=${idPelicula}`;
    } catch (err) {
      console.error(err);
      mostrarToast("Error al guardar cambios.");
    }
  });

  function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.add("mostrar");
    setTimeout(() => toast.classList.remove("mostrar"), 2500);
  }
});
