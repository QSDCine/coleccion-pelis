// js/db.js
const DB_NAME = "coleccionPelisDB";
const DB_VERSION = 1;
const STORE = "peliculas";

// --------------------
// IndexedDB base
// --------------------
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, {
          keyPath: "id",
          autoIncrement: true
        });
        store.createIndex("titulo", "titulo", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, mode = "readonly") {
  return db.transaction(STORE, mode).objectStore(STORE);
}

// --------------------
// CRUD
// --------------------
export async function addMovie(movie) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, "readwrite");
    const req = store.add(movie);
    req.onsuccess = () => resolve(req.result); // id nuevo
    req.onerror = () => reject(req.error);
  });
}

export async function getMovie(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db);
    const req = store.get(Number(id));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllMovies() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function updateMovie(id, patch) {
  const db = await openDB();
  const current = await getMovie(id);
  if (!current) throw new Error("No existe la película para actualizar.");

  const updated = { ...current, ...patch, id: Number(id) };

  return new Promise((resolve, reject) => {
    const store = tx(db, "readwrite");
    const req = store.put(updated);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteMovie(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, "readwrite");
    const req = store.delete(Number(id));
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// --------------------
// Imagen: compresión (Blob) + thumb
// --------------------
async function fileToResizedBlob(file, maxW, quality = 0.82) {
  // Recomendación: guardar en jpeg para reducir tamaño y compatibilidad
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxW / img.width);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.drawImage(img, 0, 0, w, h);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      quality
    );
  });
}

export async function buildCoverBlobs(file) {
  if (!file) return { coverBlob: null, thumbBlob: null };

  // “Portada” razonable para ver en detalle
  const coverBlob = await fileToResizedBlob(file, 900, 0.82);

  // Thumb para catálogo (carga rápida)
  const thumbBlob = await fileToResizedBlob(file, 320, 0.80);

  return { coverBlob, thumbBlob };
}

export function blobToObjectURL(blob) {
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
