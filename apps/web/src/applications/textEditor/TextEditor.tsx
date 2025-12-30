import { useEffect, useState } from 'react';
import { useKernel } from '../../contexts/useKernel';

interface TextEditorProps {
	filePath?: string;
}

export function TextEditor({ filePath }: TextEditorProps) {
	const { kernel } = useKernel();
	const [currentFile, setCurrentFile] = useState<string>(filePath || '/home/notes/new.txt');
	const [content, setContent] = useState<string>('');
	const [status, setStatus] = useState<string>('Ready');
	const [error, setError] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const loadFile = async (path: string) => {
		setLoading(true);
		setError('');
		setStatus('Loading...');
		try {
			const data = await kernel.fs_read_file(path);
			const decoder = new TextDecoder();
			setContent(decoder.decode(data));
			setStatus(`Opened ${path}`);
			setCurrentFile(path);
		} catch (err) {
			const e = err instanceof Error ? err : new Error(String(err));
			setError(`Failed to open file: ${e.message}`);
			setStatus('Open failed');
		} finally {
			setLoading(false);
		}
	};

	const saveFile = async () => {
		setError('');
		setStatus('Saving...');
		try {
			const encoder = new TextEncoder();
			await kernel.fs_write_file(currentFile, encoder.encode(content));
			setStatus(`Saved ${currentFile}`);
		} catch (err) {
			const e = err instanceof Error ? err : new Error(String(err));
			setError(`Failed to save file: ${e.message}`);
			setStatus('Save failed');
		}
	};

	useEffect(() => {
		if (filePath) {
			loadFile(filePath);
		}
	}, [filePath]);

	useEffect(() => {
		if (!filePath) {
			setStatus('Ready');
		}
	}, [filePath]);

	return (
		<div className="text-editor">
			<div className="text-editor-header">
				<input
					type="text"
					className="text-editor-input"
					value={currentFile}
					onChange={(e) => setCurrentFile(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							loadFile(currentFile);
						}
					}}
					placeholder="Enter file path..."
				/>
				<div className="text-editor-actions">
					<button className="text-editor-button" onClick={() => loadFile(currentFile)} disabled={loading}>
						Open
					</button>
					<button
						className="text-editor-button primary"
						onClick={saveFile}
						disabled={loading}
						onKeyDown={(e) => {
							if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
								e.preventDefault();
								saveFile();
							}
						}}
					>
						Save
					</button>
				</div>
			</div>

			<div className="text-editor-status">
				<span>{status}</span>
				{error && <span className="error">{error}</span>}
			</div>

			<textarea
				className="text-editor-area"
				value={content}
				onChange={(e) => setContent(e.target.value)}
				onKeyDown={(e) => {
					if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
						e.preventDefault();
						saveFile();
					}
				}}
				spellCheck={false}
				placeholder="Start typing..."
			/>
		</div>
	);
}
