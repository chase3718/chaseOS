/**
 * Minimal IndexedDB key-value store for persisting kernel state.
 * Provides global functions that can be called from the WASM kernel.
 */
import { IDB_DATABASE_NAME, IDB_STORE_NAME } from '../constants';

const DB_NAME = IDB_DATABASE_NAME;
const STORE_NAME = IDB_STORE_NAME;

/**
 * Opens or creates the IndexedDB database.
 */
function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);

		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};

		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'));
	});
}

/**
 * Helper to execute a transaction on the object store.
 */
async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
	const db = await openDb();
	return new Promise<T>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, mode);
		const store = tx.objectStore(STORE_NAME);
		const req = fn(store);

		req.onsuccess = () => resolve(req.result as T);
		req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
		tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
	});
}

/**
 * Retrieves bytes from IndexedDB for a given key.
 */
async function getBytes(key: string): Promise<Uint8Array | undefined> {
	const result = await withStore<ArrayBuffer | Uint8Array | undefined>('readonly', (store) => store.get(key));

	if (result == null) {
		return undefined;
	}

	// Handle both ArrayBuffer and Uint8Array (for cross-browser compatibility)
	if (result instanceof ArrayBuffer) {
		return new Uint8Array(result);
	}

	if (result instanceof Uint8Array) {
		return result;
	}

	throw new Error(`Unexpected value type for key "${key}"`);
}

/**
 * Stores bytes in IndexedDB for a given key.
 */
async function setBytes(key: string, bytes: Uint8Array): Promise<void> {
	// Store as ArrayBuffer for consistency
	const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
	await withStore<void>('readwrite', (store) => store.put(buffer, key));
}

/**
 * Installs global functions that the WASM kernel can call.
 * Must be called before importing the kernel module.
 */
export function installIdbGlobals(): void {
	(globalThis as any).__idb_get_bytes = getBytes;
	(globalThis as any).__idb_set_bytes = setBytes;
}
