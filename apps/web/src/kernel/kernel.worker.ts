/// <reference lib="webworker" />

import type { KernelRequest, KernelResponse } from './protocol';
import { installIdbGlobals } from './idbDriver';
import { IDB_FS_STATE_KEY } from '../constants';

const FS_KEY = IDB_FS_STATE_KEY;

interface KernelAPI {
	hello(name: string): string;
	fs_init_from_bytes(bytes: Uint8Array | undefined): void;
	fs_dump_state(): Uint8Array;
	fs_mkdir(path: string): void;
	fs_read_file(path: string): Uint8Array;
	fs_readdir(path: string): Array<string>;
	fs_write_file(path: string, data: Uint8Array): void;
	fs_stat(path: string): { is_dir: boolean; is_file: boolean; size: number };
	fs_rm(path: string): void;
	fs_rmdir(path: string): void;
	fs_mv(from: string, to: string): void;
	fs_cp(from: string, to: string): void;
}

async function idbGetBytes(key: string): Promise<Uint8Array | undefined> {
	return (globalThis as any).__idb_get_bytes?.(key);
}

async function idbSetBytes(key: string, bytes: Uint8Array): Promise<void> {
	return (globalThis as any).__idb_set_bytes?.(key, bytes);
}

// Install IndexedDB globals before importing kernel
installIdbGlobals();

let api: KernelAPI | null = null;

// Initialize the kernel WASM module
(async () => {
	try {
		console.log('[kernel] Starting initialization...');

		// Import the kernel module
		console.log('[kernel] Importing kernel module...');
		const kernelModule = await import('kernel');
		console.log('[kernel] Kernel module imported');

		// Initialize WASM using the default export (init function)
		console.log('[kernel] Initializing WASM...');
		await kernelModule.default();
		console.log('[kernel] WASM initialized');

		// Store the API for use in message handlers
		api = kernelModule as KernelAPI;

		// Load persisted state from IndexedDB and initialize filesystem
		console.log('[kernel] Loading persisted state...');
		const persisted = await idbGetBytes(FS_KEY);
		console.log('[kernel] Initializing filesystem...');
		api.fs_init_from_bytes(persisted ?? undefined);

		console.log('[kernel] Filesystem initialized');

		self.postMessage({ type: 'ready' });
		console.log('[kernel] Ready message sent');
	} catch (err) {
		console.error('[kernel] Initialization failed:', err);
		const e = err instanceof Error ? err : new Error(String(err));
		self.postMessage({ type: 'fatal', error: { message: e.message, stack: e.stack } });
	}
})();

// Helper to persist after any mutating op
async function persist() {
	if (!api) throw new Error('Kernel not initialized');
	const bytes: Uint8Array = api.fs_dump_state();
	await idbSetBytes(FS_KEY, bytes);
}

// Handle incoming RPC requests from the main thread
self.onmessage = async (ev: MessageEvent<KernelRequest>) => {
	const req = ev.data;

	if (!req || !req.id || !req.type) {
		return; // Invalid request
	}

	try {
		if (!api) {
			throw new Error('Kernel not initialized');
		}

		let result: unknown;
		let needsPersist = false;

		switch (req.type) {
			case 'hello':
				result = api.hello(req.name);
				break;

			case 'fs_mkdir':
				api.fs_mkdir(req.path);
				needsPersist = true;
				break;

			case 'fs_readdir':
				result = api.fs_readdir(req.path);
				break;

			case 'fs_write_file':
				api.fs_write_file(req.path, req.data);
				needsPersist = true;
				break;

			case 'fs_read_file':
				result = api.fs_read_file(req.path);
				break;

			case 'fs_stat':
				result = api.fs_stat(req.path);
				break;

			case 'fs_rm':
				api.fs_rm(req.path);
				needsPersist = true;
				break;

			case 'fs_rmdir':
				api.fs_rmdir(req.path);
				needsPersist = true;
				break;

			case 'fs_mv':
				api.fs_mv(req.from, req.to);
				needsPersist = true;
				break;

			case 'fs_cp':
				api.fs_cp(req.from, req.to);
				needsPersist = true;
				break;

			default: {
				const exhaustiveCheck: never = req;
				throw new Error(`Unknown request type: ${JSON.stringify(exhaustiveCheck)}`);
			}
		}

		// Persist filesystem state after mutating operations
		if (needsPersist) {
			await persist();
		}

		const response: KernelResponse = {
			id: req.id,
			ok: true,
			result,
		};
		self.postMessage(response);
	} catch (err) {
		const e = err instanceof Error ? err : new Error(String(err));
		const response: KernelResponse = {
			id: req.id,
			ok: false,
			error: {
				message: e.message,
				stack: e.stack,
			},
		};
		self.postMessage(response);
	}
};
