import { useEffect, useMemo, useRef, useState } from 'react';
import { Terminal } from '../../kernel/terminal';
import { useKernel } from '../../contexts/useKernel';
import { useConfig } from '../../contexts';
import type { Keybind } from '../../config/appConfig';

interface OutputLine {
	type: 'input' | 'output' | 'error';
	content: string;
	prompt?: string;
}

interface FileEntry {
	name: string;
	isDir: boolean;
}

export function TerminalUI() {
	const { kernel } = useKernel();
	const { config } = useConfig();
	const terminal = useMemo(
		() =>
			new Terminal(kernel, {
				prompt: config.terminal.promptDefault,
				clearScreenCode: config.terminal.clearScreenCode,
			}),
		[kernel, config.terminal.promptDefault, config.terminal.clearScreenCode]
	);
	const [lines, setLines] = useState<OutputLine[]>([
		{
			type: 'output',
			content: config.terminal.welcomeMessage,
		},
	]);
	const [input, setInput] = useState('');
	const [historyIndex, setHistoryIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLDivElement>(null);

	const matchesKeybind = (event: React.KeyboardEvent<HTMLInputElement>, bind: Keybind) => {
		const expectedAlt = bind.alt ?? false;
		const expectedCtrl = bind.ctrl ?? false;
		const expectedShift = bind.shift ?? false;
		return (
			event.altKey === expectedAlt &&
			event.ctrlKey === expectedCtrl &&
			event.shiftKey === expectedShift &&
			(event.key === bind.key || event.key === bind.key.toUpperCase())
		);
	};

	// Auto-scroll to bottom when new lines are added
	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [lines]);

	// Focus input on mount and when clicking terminal
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		setLines([
			{
				type: 'output',
				content: config.terminal.welcomeMessage,
			},
		]);
		setInput('');
		setHistoryIndex(-1);
	}, [config.terminal.welcomeMessage]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const trimmed = input.trim();
		if (!trimmed) return;

		// Add input line to output
		setLines((prev) => [
			...prev,
			{
				type: 'input',
				content: trimmed,
				prompt: terminal.prompt,
			},
		]);

		// Clear input
		setInput('');
		setHistoryIndex(-1);

		// Execute command
		try {
			const result = await terminal.exec(trimmed);

			// Add output
			if (result.stdout) {
				if (result.stdout === config.terminal.clearScreenCode) {
					// Handle clear screen command
					setLines(() => []);
				} else {
					setLines((prev) => [
						...prev,
						{
							type: 'output',
							content: result.stdout,
						},
					]);
				}
			}

			// Add error output
			if (result.stderr) {
				setLines((prev) => [
					...prev,
					{
						type: 'error',
						content: result.stderr,
					},
				]);
			}

			// Force re-render to update prompt with new cwd
			setLines((prev) => [...prev]);
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			setLines((prev) => [
				...prev,
				{
					type: 'error',
					content: `Error: ${error.message}`,
				},
			]);
		}
	};

	const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		const history = terminal.getHistory();

		if (e.key === 'Tab') {
			e.preventDefault();

			const trimmedInput = input.trim();
			const tokens = trimmedInput ? trimmedInput.split(/\s+/) : [];
			const command = tokens[0] || '';

			// All available commands
			const availableCommands = [
				'help',
				'clear',
				'hello',
				'pwd',
				'cd',
				'ls',
				'tree',
				'mkdir',
				'cat',
				'echo',
				'edit',
				'rm',
				'rmdir',
				'mv',
				'cp',
				'stat',
				'open',
				'reset',
				'sudo',
			];

			// Commands that accept file/directory arguments
			// Maps command to which argument positions accept files/dirs
			// -1 means all arguments accept files/dirs
			const filesystemCommands: Record<string, number[]> = {
				cd: [-1], // Only directories
				ls: [-1], // Optional directory
				tree: [-1], // Optional directory
				mkdir: [-1], // Only directories
				cat: [-1], // Files
				edit: [-1], // Files
				rm: [-1], // Files or directories
				rmdir: [-1], // Only directories
				mv: [-1], // Source and destination
				cp: [-1], // Source and destination
				stat: [-1], // Files or directories
				open: [-1], // Files
			};

			// If only command is being completed (no arguments yet)
			if (tokens.length <= 1) {
				const matches = availableCommands.filter((cmd) => cmd.startsWith(trimmedInput));

				if (matches.length === 1) {
					setInput(matches[0] + ' ');
				} else if (matches.length > 1) {
					setLines((prev) => [
						...prev,
						{
							type: 'output',
							content: matches.join('  '),
						},
					]);
				} else if (matches.length === 0 && trimmedInput === '') {
					// If empty input, show all commands
					setLines((prev) => [
						...prev,
						{
							type: 'output',
							content: availableCommands.join('  '),
						},
					]);
				}
				return;
			}

			const commandKey = command.toLowerCase();
			const acceptsFiles = filesystemCommands[commandKey];

			if (!acceptsFiles) {
				return;
			}

			const partialPath = tokens[tokens.length - 1] || '';

			try {
				const lastSlashIndex = partialPath.lastIndexOf('/');
				let searchDir: string;
				let partialName: string;
				let pathPrefix: string;

				if (lastSlashIndex >= 0) {
					pathPrefix = partialPath.substring(0, lastSlashIndex + 1);
					partialName = partialPath.substring(lastSlashIndex + 1);

					const cwd = terminal.getCwd();
					if (pathPrefix.startsWith('/')) {
						searchDir = pathPrefix;
					} else {
						searchDir = `${cwd === '/' ? '' : cwd}/${pathPrefix}`;
					}
				} else {
					pathPrefix = '';
					partialName = partialPath;
					searchDir = terminal.getCwd();
				}

				const entries = await kernel.fs_readdir(searchDir);

				const matchingEntries: FileEntry[] = [];
				for (const entry of entries) {
					if (partialName && !entry.startsWith(partialName)) continue;

					const fullPath = `${searchDir === '/' ? '' : searchDir}/${entry}`;
					try {
						const stat = await kernel.fs_stat(fullPath);
						matchingEntries.push({
							name: entry,
							isDir: stat.is_dir,
						});
					} catch {
						// Silently skip entries we can't stat
					}
				}

				matchingEntries.sort((a: FileEntry, b: FileEntry) => {
					if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
					return a.isDir ? -1 : 1;
				});

				const matchingNames = matchingEntries.map((e: FileEntry) => e.name);

				if (matchingNames.length === 1) {
					// Single match: autocomplete with full path and add trailing slash if directory
					const isDir = matchingEntries[0].isDir;
					const completion = isDir ? `${pathPrefix}${matchingNames[0]}/` : `${pathPrefix}${matchingNames[0]}`;

					// Replace just the last token
					const beforeLastToken = tokens.slice(0, -1).join(' ');
					setInput(beforeLastToken ? `${beforeLastToken} ${completion}` : completion);
				} else if (matchingNames.length > 1) {
					const displayEntries = matchingEntries.map((e: FileEntry) => (e.isDir ? `${e.name}/` : e.name));
					const maxDisplayMatches = 50;

					let outputContent = '';
					if (displayEntries.length > maxDisplayMatches) {
						const shown = displayEntries.slice(0, maxDisplayMatches);
						const remaining = displayEntries.length - maxDisplayMatches;
						outputContent = `${shown.join('  ')}\n(and ${remaining} more...)`;
					} else {
						outputContent = displayEntries.join('  ');
					}

					setLines((prev) => [
						...prev,
						{
							type: 'output',
							content: outputContent,
						},
					]);
				} else if (matchingNames.length === 0 && partialName === '') {
					const displayEntries = matchingEntries.map((e: FileEntry) => (e.isDir ? `${e.name}/` : e.name));
					const maxDisplayMatches = 50;

					let outputContent = '';
					if (displayEntries.length > maxDisplayMatches) {
						const shown = displayEntries.slice(0, maxDisplayMatches);
						const remaining = displayEntries.length - maxDisplayMatches;
						outputContent = `${shown.join('  ')}\n(and ${remaining} more...)`;
					} else {
						outputContent = displayEntries.length > 0 ? displayEntries.join('  ') : '(empty directory)';
					}

					setLines((prev) => [
						...prev,
						{
							type: 'output',
							content: outputContent,
						},
					]);
				}
			} catch (err) {
				// Silently fail if directory reading fails
			}
			return;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (history.length === 0) return;

			const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
			setHistoryIndex(newIndex);
			setInput(history[newIndex]);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex === -1) return;

			const newIndex = historyIndex + 1;
			if (newIndex >= history.length) {
				setHistoryIndex(-1);
				setInput('');
			} else {
				setHistoryIndex(newIndex);
				setInput(history[newIndex]);
			}
		} else if (matchesKeybind(e, config.keyboard.interrupt)) {
			e.preventDefault();
			setInput('');
			setLines((prev) => [
				...prev,
				{
					type: 'input',
					content: '^C',
					prompt: terminal.prompt,
				},
			]);
		} else if (matchesKeybind(e, config.keyboard.clearTerminal)) {
			e.preventDefault();
			setLines([]);
		}
	};

	const handleTerminalClick = () => {
		inputRef.current?.focus();
	};

	return (
		<div className="terminal" onClick={handleTerminalClick}>
			<div className="terminal-output" ref={outputRef}>
				{lines.map((line, index) => (
					<div key={index} className={`terminal-line terminal-line-${line.type}`}>
						{line.type === 'input' && <span className="terminal-prompt">{line.prompt} </span>}
						<span className="terminal-content">{line.content}</span>
					</div>
				))}
			</div>

			<form onSubmit={handleSubmit} className="terminal-input-form">
				<span className="terminal-prompt">{terminal.prompt} </span>
				<input
					ref={inputRef}
					type="text"
					className="terminal-input"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					spellCheck={false}
					autoComplete="off"
					autoCapitalize="off"
				/>
			</form>
		</div>
	);
}
