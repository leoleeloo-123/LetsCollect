const DATABASE_NAME = "lets-collect-render-cache";
const DATABASE_VERSION = 1;
const STORE_NAME = "toy-thumbnails";

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB unavailable"));

  databasePromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open thumbnail cache"));
  });

  return databasePromise;
}

export async function readThumbnailBlob(key: string) {
  try {
    const database = await openDatabase();
    return await new Promise<Blob | null>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
      request.onerror = () => reject(request.error ?? new Error("Unable to read thumbnail"));
    });
  } catch {
    return null;
  }
}

export async function writeThumbnailBlob(key: string, blob: Blob) {
  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(blob, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to cache thumbnail"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Thumbnail cache aborted"));
    });
  } catch {
    // Thumbnail persistence is an optimization. Rendering still succeeds when
    // private browsing or storage policy disables IndexedDB.
  }
}
