import { addMovie, buildCoverBlobs } from "./db.js";

document.addEventListener("DOMContentLoaded", () => {
  // MODO OSCURO
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "oscuro") document.body.classList.add("oscuro");

  // REFERENCIAS
  const form = document.getElementById("form-add");

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

  // GUARDAR
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
    const { coverBlob, thumbBlob } = await buildCoverBlobs(file);

    const nuevaPelicula = {
      titulo: inputTitulo.value.trim(),
      año: Number(inputAño.value),
      director: directores,   // ✅ ARRAY
      generos: generos,       // ✅ ARRAY
      formato: selectFormato.value,
      edicionEspecial: selectEdicionEspecial.value === "true",
      saga,
      notas: inputNotas.value.trim(),
      portadaBlob: coverBlob,
      portadaThumbBlob: thumbBlob,
      createdAt: Date.now()
    };

    try {
      const newId = await addMovie(nuevaPelicula);
      mostrarToast("Película añadida correctamente.");
      window.location.href = `movie.html?id=${newId}`;
    } catch (error) {
      console.error("Error al guardar:", error);
      mostrarToast("Error al guardar la película.");
    }
  });

  function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.add("mostrar");
    setTimeout(() => toast.classList.remove("mostrar"), 2500);
  }
});
