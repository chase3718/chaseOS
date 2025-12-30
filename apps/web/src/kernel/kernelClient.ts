import type { KernelRequest, KernelResponse, KernelControlMessage } from './protocol';

interface PendingRequest {
	resolve: (value: unknown) => void;
	reject: (error: Error) => void;
	timeoutId: number;
}

function randomId(): string {
	return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

/**
 * Client for communicating with the kernel Web Worker.
 * Provides an RPC-style interface for calling kernel functions.
 */
export class KernelClient {
	private worker: Worker;
	private pending = new Map<string, PendingRequest>();
	private readyResolve!: () => void;
	private readyReject!: (error: Error) => void;

	/**
	 * Promise that resolves when the kernel is fully initialized.
	 */
	public readonly ready: Promise<void>;

	constructor() {
		this.worker = new Worker(new URL('./kernel.worker.ts', import.meta.url), {
			type: 'module',
		});

		this.ready = new Promise<void>((resolve, reject) => {
			this.readyResolve = resolve;
			this.readyReject = reject;
		});

		this.worker.onerror = (ev) => {
			const err = new Error(`Worker error: ${ev.message ?? 'unknown error'}`);
			this.failAll(err);
			this.readyReject(err);
		};

		this.worker.onmessageerror = () => {
			const err = new Error('Worker message error (structured clone failed)');
			this.failAll(err);
			this.readyReject(err);
		};

		this.worker.onmessage = (ev: MessageEvent<KernelResponse | KernelControlMessage>) => {
			const msg = ev.data;

			// Handle control messages
			if ('type' in msg) {
				if (msg.type === 'ready') {
					this.readyResolve();
					return;
				}
				if (msg.type === 'fatal') {
					const err = new Error(`Kernel fatal error: ${msg.error.message}`);
					err.stack = msg.error.stack ?? err.stack;
					this.failAll(err);
					this.readyReject(err);
					return;
				}
			}

			// Handle RPC responses
			const response = msg as KernelResponse;
			const entry = this.pending.get(response.id);
			if (!entry) return;

			clearTimeout(entry.timeoutId);
			this.pending.delete(response.id);

			if (response.ok) {
				entry.resolve(response.result);
			} else {
				const err = new Error(response.error.message);
				err.stack = response.error.stack ?? err.stack;
				entry.reject(err);
			}
		};
	}

	private failAll(err: Error): void {
		for (const entry of this.pending.values()) {
			clearTimeout(entry.timeoutId);
			entry.reject(err);
		}
		this.pending.clear();
	}

	/**
	 * Terminates the worker and rejects all pending requests.
	 */
	dispose(): void {
		this.failAll(new Error('KernelClient disposed'));
		this.worker.terminate();
	}

	private async request<T>(payload: Omit<KernelRequest, 'id'>, timeoutMs = 10_000): Promise<T> {
		// Wait for kernel to be ready before making requests
		await this.ready;

		const id = randomId();
		return new Promise<T>((resolve, reject) => {
			const timeoutId = window.setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`Kernel request timed out after ${timeoutMs}ms: ${payload.type}`));
			}, timeoutMs);

			this.pending.set(id, {
				resolve: resolve as (value: unknown) => void,
				reject,
				timeoutId,
			});

			const message: KernelRequest = { ...payload, id } as KernelRequest;
			this.worker.postMessage(message);
		});
	}

	/**
	 * Calls the kernel's hello function.
	 */
	hello(name: string): Promise<string> {
		return this.request<string>({ type: 'hello', name } as Omit<KernelRequest, 'id'>);
	}

	/**
	 * Creates a directory at the specified path.
	 */
	fs_mkdir(path: string): Promise<void> {
		return this.request<void>({ type: 'fs_mkdir', path } as Omit<KernelRequest, 'id'>);
	}

	/**
	 * Lists the contents of a directory.
	 */
	fs_readdir(path: string): Promise<string[]> {
		return this.request<string[]>({ type: 'fs_readdir', path } as Omit<KernelRequest, 'id'>);
	}

	/**
	 * Writes data to a file.
	 */
	fs_write_file(path: string, data: Uint8Array): Promise<void> {
		return this.request<void>({ type: 'fs_write_file', path, data } as Omit<KernelRequest, 'id'>);
	}

	/**
	 * Reads the contents of a file.
	 */
	fs_read_file(path: string): Promise<Uint8Array> {
		return this.request<Uint8Array>({ type: 'fs_read_file', path } as Omit<KernelRequest, 'id'>);
	}

	/**
	 * Gets information about a file or directory.
	 */
	fs_stat(path: string): Promise<import('./protocol').FsStat> {
		return this.request<import('./protocol').FsStat>({ type: 'fs_stat', path } as Omit<KernelRequest, 'id'>);
	}

	/**
	 * Removes a file.
	 */
	fs_rm(path: string): Promise<void> {
		return this.request<void>({ type: 'fs_rm', path } as Omit<KernelRequest, 'id'>);
	}

	/**
	 * Removes an empty directory.
	 */
	fs_rmdir(path: string): Promise<void> {
		return this.request<void>({ type: 'fs_rmdir', path } as Omit<KernelRequest, 'id'>);
	}

	/**
	 * Moves/renames a file or directory.
	 */
	fs_mv(from: string, to: string): Promise<void> {
		return this.request<void>({ type: 'fs_mv', from, to } as Omit<KernelRequest, 'id'>);
	}

	/**
	 * Copies a file.
	 */
	fs_cp(from: string, to: string): Promise<void> {
		return this.request<void>({ type: 'fs_cp', from, to } as Omit<KernelRequest, 'id'>);
	}
}
