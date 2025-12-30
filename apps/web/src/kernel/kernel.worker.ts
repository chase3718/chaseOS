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

interface IdbGlobal {
	__idb_get_bytes?(key: string): Promise<Uint8Array | undefined>;
	__idb_set_bytes?(key: string, bytes: Uint8Array): Promise<void>;
}

async function idbGetBytes(key: string): Promise<Uint8Array | undefined> {
	return (globalThis as unknown as IdbGlobal).__idb_get_bytes?.(key);
}

async function idbSetBytes(key: string, bytes: Uint8Array): Promise<void> {
	return (globalThis as unknown as IdbGlobal).__idb_set_bytes?.(key, bytes);
}

installIdbGlobals();

let api: KernelAPI | null = null;

(async () => {
	try {
		console.log('[kernel] Starting initialization...');

		const kernelModule = await import('kernel');
		console.log('[kernel] Kernel module imported');

		await kernelModule.default();
		console.log('[kernel] WASM initialized');

		api = kernelModule as KernelAPI;

		console.log('[kernel] Loading persisted state...');
		const persisted = await idbGetBytes(FS_KEY);
		api.fs_init_from_bytes(persisted ?? undefined);

		if (!persisted) {
			console.log('[kernel] No existing filesystem found, creating base structure...');
			try {
				const baseDirs = ['/home', '/bin', '/etc', '/tmp', '/var', '/usr', '/usr/local', '/opt', '/dev', '/apps'];

				for (const dir of baseDirs) {
					api.fs_mkdir(dir);
				}

				const appDirs = ['/apps/terminal', '/apps/textviewer', '/apps/filebrowser', '/apps/notes'];
				for (const dir of appDirs) {
					api.fs_mkdir(dir);
				}

				const welcomeText = [
					'=============================================================',
					'                    Welcome to ChaseOS!',
					'=============================================================',
					'',
					'ChaseOS is a browser-based Unix-like operating system built with',
					'React, TypeScript, and WebAssembly (Rust). It provides a fully',
					'functional terminal environment with persistent file storage.',
					'',
					'PROJECT OVERVIEW:',
					'',
					'This is a portfolio project showcasing:',
					'  • React 19 with functional components and hooks',
					'  • TypeScript for type safety and developer experience',
					'  • WebAssembly (Rust) kernel for filesystem operations',
					'  • Web Workers for background processing',
					'  • IndexedDB for persistent data storage',
					'  • CSS animations and transitions for UI polish',
					'  • Responsive window management system',
					'',
					'FEATURES:',
					'',
					'Terminal:',
					'  • 18 built-in commands (help, ls, cd, cat, mkdir, etc.)',
					'  • Tab completion for commands and file paths',
					'  • Command history navigation (arrow keys)',
					'  • Real-time filesystem operations',
					'  • Tree view for directory exploration',
					'',
					'Filesystem:',
					'  • Full filesystem hierarchy under /home, /bin, /etc, /opt, etc.',
					'  • Persistent storage using IndexedDB',
					'  • File and directory operations (create, read, delete, move)',
					'  • Directory traversal and stat information',
					'',
					'User Interface:',
					'  • Multi-window desktop environment',
					'  • Draggable, resizable windows',
					'  • Window maximize/minimize functionality',
					'  • Taskbar for window switching',
					'  • Smooth animations on all interactions',
					'  • Text file viewer application',
					'',
					'GETTING STARTED:',
					'',
					'1. Type "help" to see all available commands',
					'2. Use "ls" or "tree" to explore the filesystem',
					'3. Try "cat /home/welcome.txt" to read this file',
					'4. Use "open <filename>" to view files in the text viewer',
					'5. Type "mkdir <dirname>" to create new directories',
					'',
					'COMMAND EXAMPLES:',
					'',
					'  pwd                    # Show current directory',
					'  cd /home               # Change directory',
					'  ls                     # List directory contents',
					'  tree /home             # Show directory tree',
					'  mkdir projects         # Create a new directory',
					'  cat /home/welcome.txt  # Read this file',
					'  echo "Hello" > file.txt # Create a file',
					'  stat /home             # Show file information',
					'',
					'PERSISTENCE:',
					'',
					'All files and directories you create are automatically saved to',
					"your browser's IndexedDB. Your data persists across browser",
					'sessions. To reset everything, type:',
					'',
					'  sudo reset --confirm',
					'',
					'DATA & PRIVACY:',
					'',
					'• All data is stored locally in your browser (IndexedDB)',
					'• No data is sent to any server',
					'• Data is cleared when you clear your browser cache',
					'• Use "sudo reset --confirm" to manually clear all data',
					'',
					'ARCHITECTURE:',
					'',
					'Frontend: React 19 + TypeScript with Vite',
					'  - App.tsx: Main application and window management',
					'  - TerminalUI.tsx: Terminal interface with tab completion',
					'  - TextViewer.tsx: File viewing application',
					'  - StatusBar.tsx: Taskbar and window controls',
					'',
					'Backend: Rust compiled to WebAssembly',
					'  - kernel.worker.ts: Web Worker running WASM kernel',
					'  - KernelClient: RPC interface to WASM backend',
					'  - Filesystem implementation in Rust VFS',
					'',
					'Storage: Browser IndexedDB',
					'  - idbDriver.ts: Abstraction layer for IndexedDB operations',
					'  - Automatic persistence after each filesystem operation',
					'',
					'=============================================================',
					'',
					'Enjoy exploring ChaseOS!',
				].join('\n');
				const encoder = new TextEncoder();
				api.fs_write_file('/home/welcome.txt', encoder.encode(welcomeText));

				const terminalInfo = [
					'Terminal Application',
					'',
					'A Unix-like shell with support for:',
					'- File operations (mkdir, rm, cp, mv)',
					'- Text processing (cat, echo)',
					'- Directory navigation (cd, ls, pwd)',
					'- File inspection (stat, tree)',
					'- Filesystem reset (sudo reset --confirm)',
				].join('\n');
				api.fs_write_file('/apps/terminal/README.txt', encoder.encode(terminalInfo));

				const textviewerInfo = [
					'Text Viewer Application',
					'',
					'View and read text files from the filesystem.',
					'Usage: open <filepath>',
					'',
					'Supports any text file in the system.',
				].join('\n');
				api.fs_write_file('/apps/textviewer/README.txt', encoder.encode(textviewerInfo));

				const filebrowserInfo = [
					'File Browser Application',
					'',
					'Navigate and explore the filesystem visually.',
					'Features:',
					'- Directory tree navigation',
					'- File preview',
					'- Quick access to common directories',
				].join('\n');
				api.fs_write_file('/apps/filebrowser/README.txt', encoder.encode(filebrowserInfo));

				const notesInfo = [
					'Notes Application',
					'',
					'Simple note-taking application.',
					'Create and manage text notes across sessions.',
					'Notes are stored in /home/notes/',
				].join('\n');
				api.fs_write_file('/apps/notes/README.txt', encoder.encode(notesInfo));

				await persist();
				console.log('[kernel] Filesystem initialized');
			} catch (err) {
				console.error('[kernel] Failed to create base filesystem:', err);
			}
		}

		console.log('[kernel] Filesystem initialized');

		self.postMessage({ type: 'ready' });
		console.log('[kernel] Ready');
	} catch (err) {
		console.error('[kernel] Initialization failed:', err);
		const e = err instanceof Error ? err : new Error(String(err));
		self.postMessage({ type: 'fatal', error: { message: e.message, stack: e.stack } });
	}
})();

async function persist() {
	if (!api) throw new Error('Kernel not initialized');
	const bytes: Uint8Array = api.fs_dump_state();
	await idbSetBytes(FS_KEY, bytes);
}

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
