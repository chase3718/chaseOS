// apps/web/src/kernel/kernelFsAdapter.ts
import type { KernelFS } from './terminal';
import type { KernelClient } from './kernelClient';

export function createKernelFS(kernel: KernelClient): KernelFS {
	return {
		readdir: (path) => kernel.readdir(path),
		readFile: (path) => kernel.readFile(path),
		writeFile: (path, data) => kernel.writeFile(path, data),
		mkdir: (path, opts) => kernel.mkdir(path, opts),
		unlink: (path) => kernel.unlink(path),
		stat: (path) => kernel.stat(path),
	};
}
