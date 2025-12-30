import { useEffect, useState } from 'react';
import { useKernel } from '../../contexts/useKernel';

interface TextViewerProps {
	filePath?: string;
}

export function TextViewer({ filePath }: TextViewerProps) {
	const { kernel } = useKernel();
	const [content, setContent] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [currentFile, setCurrentFile] = useState<string>(filePath || '/home/welcome.txt');

	const loadFile = async (path: string) => {
		setLoading(true);
		setError('');
		try {
			const data = await kernel.fs_read_file(path);
			const decoder = new TextDecoder();
			setContent(decoder.decode(data));
			setCurrentFile(path);
		} catch (err) {
			const e = err instanceof Error ? err : new Error(String(err));
			setError(`Failed to open file: ${e.message}`);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (filePath) {
			loadFile(filePath);
		}
	}, [filePath]);

	useEffect(() => {
		if (filePath === undefined) {
			loadFile('/home/welcome.txt');
		}
	}, []);

	return (
		<div className="text-viewer">
			<div className="text-viewer-header">
				<input
					type="text"
					className="text-viewer-input"
					value={currentFile}
					onChange={(e) => setCurrentFile(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							loadFile(currentFile);
						}
					}}
					placeholder="Enter file path..."
				/>
				<button className="text-viewer-button" onClick={() => loadFile(currentFile)}>
					Open
				</button>
			</div>

			{loading && <div className="text-viewer-content loading">Loading...</div>}
			{error && <div className="text-viewer-content error">{error}</div>}
			{!loading && !error && <pre className="text-viewer-content">{content}</pre>}
		</div>
	);
}
