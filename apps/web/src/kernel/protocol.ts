/**
 * Filesystem stat result.
 */
export interface FsStat {
	is_dir: boolean;
	is_file: boolean;
	size: number;
}

/**
 * RPC request sent from main thread to kernel worker.
 */
export type KernelRequest =
	| {
			id: string;
			type: 'hello';
			name: string;
	  }
	| {
			id: string;
			type: 'fs_mkdir';
			path: string;
	  }
	| {
			id: string;
			type: 'fs_readdir';
			path: string;
	  }
	| {
			id: string;
			type: 'fs_write_file';
			path: string;
			data: Uint8Array;
	  }
	| {
			id: string;
			type: 'fs_read_file';
			path: string;
	  }
	| {
			id: string;
			type: 'fs_stat';
			path: string;
	  }
	| {
			id: string;
			type: 'fs_rm';
			path: string;
	  }
	| {
			id: string;
			type: 'fs_rmdir';
			path: string;
	  }
	| {
			id: string;
			type: 'fs_mv';
			from: string;
			to: string;
	  }
	| {
			id: string;
			type: 'fs_cp';
			from: string;
			to: string;
	  };

/**
 * RPC response sent from kernel worker to main thread.
 */
export type KernelResponse =
	| {
			id: string;
			ok: true;
			result: unknown;
	  }
	| {
			id: string;
			ok: false;
			error: {
				message: string;
				stack?: string;
			};
	  };

/**
 * Control messages for kernel lifecycle events.
 */
export type KernelControlMessage =
	| { type: 'ready' }
	| {
			type: 'fatal';
			error: {
				message: string;
				stack?: string;
			};
	  };
