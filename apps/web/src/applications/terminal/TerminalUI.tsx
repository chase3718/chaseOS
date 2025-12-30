import { useEffect, useRef, useState, useMemo } from 'react';
import { Terminal } from '../../kernel/terminal';
import { useKernel } from '../../contexts/useKernel';
import { TERMINAL_WELCOME_MESSAGE, TERMINAL_PROMPT_DEFAULT, CLEAR_SCREEN_CODE } from '../../constants';
import './TerminalUI.css';

interface OutputLine {
	type: 'input' | 'output' | 'error';
	content: string;
	prompt?: string;
}

export function TerminalUI() {
	const { kernel } = useKernel();
	const terminal = useMemo(() => new Terminal(kernel, { prompt: TERMINAL_PROMPT_DEFAULT }), [kernel]);
	const [lines, setLines] = useState<OutputLine[]>([
		{
			type: 'output',
			content: TERMINAL_WELCOME_MESSAGE,
		},
	]);
	const [input, setInput] = useState('');
	const [historyIndex, setHistoryIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLDivElement>(null);

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
				if (result.stdout === CLEAR_SCREEN_CODE) {
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

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const history = terminal.getHistory();

		if (e.key === 'ArrowUp') {
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
		} else if (e.key === 'c' && e.ctrlKey) {
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
		} else if (e.key === 'l' && e.ctrlKey) {
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
