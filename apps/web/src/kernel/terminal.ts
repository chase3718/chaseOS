import type { KernelClient } from './kernelClient';

export type TerminalResult = {
	stdout: string;
	stderr: string;
	code: number;
};

export type TerminalOptions = {
	cwd?: string;
	prompt?: string;
};

type CommandHandler = (args: string[]) => Promise<TerminalResult>;

export class Terminal {
	private kernel: KernelClient;
	private cwd: string;
	private promptStr: string;
	private handlers: Map<string, CommandHandler> = new Map();
	private history: string[] = [];

	constructor(kernel: KernelClient, opts: TerminalOptions = {}) {
		this.kernel = kernel;
		this.cwd = normalizePath(opts.cwd ?? '/');
		this.promptStr = opts.prompt ?? 'os';
		this.registerBuiltins();
	}

	get prompt(): string {
		return `${this.promptStr}:${this.cwd}$`;
	}

	getHistory(): readonly string[] {
		return this.history;
	}

	async exec(line: string): Promise<TerminalResult> {
		const trimmed = line.trim();
		if (!trimmed) return ok('');

		this.history.push(trimmed);

		const tokens = tokenize(trimmed);
		if (tokens.length === 0) return ok('');

		const cmd = tokens[0];
		const args = tokens.slice(1);

		const handler = this.handlers.get(cmd);
		if (!handler) return fail(`command not found: ${cmd}`);

		try {
			return await handler(args);
		} catch (e) {
			const err = e instanceof Error ? e : new Error(String(e));
			return fail(err.message);
		}
	}

	private registerBuiltins() {
		this.handlers.set('help', async () => {
			return ok(
				[
					'Commands:',
					'  help                   - Show this help message',
					'  clear                  - Clear the terminal',
					'  hello <name>           - Greet someone',
					'  pwd                    - Print working directory',
					'  cd <path>              - Change directory',
					'  ls [path]              - List directory contents',
					'  mkdir <path>           - Create a directory',
					'  cat <file>             - Display file contents',
					'  echo <text> > <file>   - Write text to file',
					'  rm <file>              - Remove a file',
					'  rmdir <dir>            - Remove an empty directory',
					'  mv <from> <to>         - Move/rename file or directory',
					'  cp <from> <to>         - Copy a file',
					'  stat <path>            - Show file/directory information',
					'',
					'Examples:',
					'  mkdir /docs',
					'  echo "Hello World" > /docs/hello.txt',
					'  cat /docs/hello.txt',
					'  ls /docs',
				].join('\n')
			);
		});

		this.handlers.set('clear', async () => {
			return ok('\u001b[2J\u001b[H');
		});

		this.handlers.set('hello', async (args) => {
			const name = args.join(' ') || 'world';
			const res = await this.kernel.hello(name);
			return ok(res);
		});

		this.handlers.set('pwd', async () => ok(this.cwd));

		this.handlers.set('cd', async (args) => {
			const target = args[0] ?? '/';
			const newPath = normalizePath(resolvePath(this.cwd, target));

			// Validate directory exists
			try {
				const stat = await this.kernel.fs_stat(newPath);
				if (!stat.is_dir) {
					return fail(`not a directory: ${newPath}`);
				}
				this.cwd = newPath;
				return ok('');
			} catch {
				return fail(`directory not found: ${newPath}`);
			}
		});

		this.handlers.set('ls', async (args) => {
			const target = args[0] ? normalizePath(resolvePath(this.cwd, args[0])) : this.cwd;

			try {
				const entries = await this.kernel.fs_readdir(target);
				if (entries.length === 0) {
					return ok('');
				}
				return ok(entries.join('\n'));
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				return fail(e.message);
			}
		});

		this.handlers.set('mkdir', async (args) => {
			if (args.length === 0) {
				return fail('usage: mkdir <path>');
			}

			const path = normalizePath(resolvePath(this.cwd, args[0]));

			try {
				await this.kernel.fs_mkdir(path);
				return ok('');
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				return fail(e.message);
			}
		});

		this.handlers.set('cat', async (args) => {
			if (args.length === 0) {
				return fail('usage: cat <file>');
			}

			const path = normalizePath(resolvePath(this.cwd, args[0]));

			try {
				const data = await this.kernel.fs_read_file(path);
				const text = new TextDecoder().decode(data);
				return ok(text);
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				return fail(e.message);
			}
		});

		this.handlers.set('echo', async (args) => {
			// Handle: echo text > file
			const redirectIndex = args.indexOf('>');

			if (redirectIndex === -1) {
				// Just print to stdout
				return ok(args.join(' '));
			}

			if (redirectIndex === args.length - 1) {
				return fail('usage: echo <text> > <file>');
			}

			const text = args.slice(0, redirectIndex).join(' ');
			const file = args[redirectIndex + 1];
			const path = normalizePath(resolvePath(this.cwd, file));

			try {
				const data = new TextEncoder().encode(text);
				await this.kernel.fs_write_file(path, data);
				return ok('');
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				return fail(e.message);
			}
		});

		this.handlers.set('rm', async (args) => {
			if (args.length === 0) {
				return fail('usage: rm <file>');
			}

			const path = normalizePath(resolvePath(this.cwd, args[0]));

			try {
				await this.kernel.fs_rm(path);
				return ok('');
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				return fail(e.message);
			}
		});

		this.handlers.set('rmdir', async (args) => {
			if (args.length === 0) {
				return fail('usage: rmdir <directory>');
			}

			const path = normalizePath(resolvePath(this.cwd, args[0]));

			try {
				await this.kernel.fs_rmdir(path);
				return ok('');
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				return fail(e.message);
			}
		});

		this.handlers.set('mv', async (args) => {
			if (args.length < 2) {
				return fail('usage: mv <from> <to>');
			}

			const from = normalizePath(resolvePath(this.cwd, args[0]));
			const to = normalizePath(resolvePath(this.cwd, args[1]));

			try {
				await this.kernel.fs_mv(from, to);
				return ok('');
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				return fail(e.message);
			}
		});

		this.handlers.set('cp', async (args) => {
			if (args.length < 2) {
				return fail('usage: cp <from> <to>');
			}

			const from = normalizePath(resolvePath(this.cwd, args[0]));
			const to = normalizePath(resolvePath(this.cwd, args[1]));

			try {
				await this.kernel.fs_cp(from, to);
				return ok('');
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				return fail(e.message);
			}
		});

		this.handlers.set('stat', async (args) => {
			if (args.length === 0) {
				return fail('usage: stat <path>');
			}

			const path = normalizePath(resolvePath(this.cwd, args[0]));

			try {
				const stat = await this.kernel.fs_stat(path);
				const type = stat.is_dir ? 'directory' : 'file';
				const lines = [`Path: ${path}`, `Type: ${type}`, `Size: ${stat.size} bytes`];
				return ok(lines.join('\n'));
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				return fail(e.message);
			}
		});
	}
}

// -------- helpers --------

function ok(stdout: string): TerminalResult {
	return { stdout, stderr: '', code: 0 };
}

function fail(stderr: string, code = 1): TerminalResult {
	return { stdout: '', stderr, code };
}

export function tokenize(input: string): string[] {
	const out: string[] = [];
	let cur = '';
	let i = 0;
	let mode: 'none' | 'single' | 'double' = 'none';

	while (i < input.length) {
		const ch = input[i];

		if (mode === 'none') {
			if (/\s/.test(ch)) {
				if (cur) {
					out.push(cur);
					cur = '';
				}
				i++;
				continue;
			}
			if (ch === "'") {
				mode = 'single';
				i++;
				continue;
			}
			if (ch === '"') {
				mode = 'double';
				i++;
				continue;
			}
			cur += ch;
			i++;
			continue;
		}

		if (mode === 'single') {
			if (ch === "'") {
				mode = 'none';
				i++;
				continue;
			}
			cur += ch;
			i++;
			continue;
		}

		// double quotes
		if (ch === '"') {
			mode = 'none';
			i++;
			continue;
		}
		if (ch === '\\') {
			const next = input[i + 1] ?? '';
			if (next === 'n') cur += '\n';
			else if (next === 't') cur += '\t';
			else if (next === '"' || next === '\\') cur += next;
			else cur += next;
			i += 2;
			continue;
		}
		cur += ch;
		i++;
	}

	if (cur) out.push(cur);
	return out;
}

function resolvePath(cwd: string, p: string): string {
	if (!p || p === '.') return cwd;
	if (p.startsWith('/')) return p;
	return `${cwd.replace(/\/+$/, '')}/${p}`;
}

function normalizePath(path: string): string {
	const parts = path.split('/').filter((x) => x.length > 0);
	const stack: string[] = [];

	for (const part of parts) {
		if (part === '.') continue;
		if (part === '..') {
			stack.pop();
			continue;
		}
		stack.push(part);
	}

	return '/' + stack.join('/');
}
