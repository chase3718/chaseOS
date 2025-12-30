import type { KernelClient } from './kernel/kernelClient';

declare global {
	interface Window {
		os?: {
			kernel: KernelClient;
			help: () => void;
			hello: (name: string) => Promise<string>;
			// later: ls/cat/write/etc
		};
	}
}

export {};
