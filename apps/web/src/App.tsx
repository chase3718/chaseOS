import { useEffect } from 'react';
import Window from './components/window/Window';
import { ConfigProvider, KernelProvider, useConfig } from './contexts';
import StatusBar from './components/statusBar/StatusBar';
import Toast from './components/toast/Toast';
import { useWindowManager } from './hooks/useWindowManager';
import { useFullscreenCheck } from './hooks/useFullscreenCheck';
import { useGlobalKeyboard } from './hooks/useGlobalKeyboard';
import { ApplicationFactory } from './services/applicationFactory';
import type { WindowItem } from './types/window';

// Re-export for backward compatibility
export type { WindowItem };

function AppContent() {
	const { config } = useConfig();
	const showFullscreenToast = useFullscreenCheck();

	// Initialize window manager with a terminal
	const initialTerminal = ApplicationFactory.createTerminal();
	const windowManager = useWindowManager([
		{
			id: crypto.randomUUID(),
			...initialTerminal,
		},
	]);

	// Set up global keyboard shortcuts
	useGlobalKeyboard([
		{
			keybind: config.keyboard.newWindow,
			handler: () => {
				const terminal = ApplicationFactory.createTerminal();
				windowManager.addWindow(terminal);
			},
			capture: true,
		},
		{
			keybind: config.keyboard.closeWindow,
			handler: () => {
				if (windowManager.focusedWindow) {
					windowManager.closeWindow(windowManager.focusedWindow);
				}
			},
			capture: true,
		},
	]);

	// File operations
	const openFile = (filePath: string) => {
		const viewer = ApplicationFactory.createTextViewer(filePath);
		windowManager.addWindow(viewer);
	};

	const openEditor = (filePath: string) => {
		const editor = ApplicationFactory.createTextEditor(filePath);
		windowManager.addWindow(editor);
	};

	// Expose to window for terminal access
	useEffect(() => {
		(window as unknown as Window & { openFile: typeof openFile }).openFile = openFile;
		(window as unknown as Window & { openEditor: typeof openEditor }).openEditor = openEditor;
	}, []);

	return (
		<>
			<div id="desktop">
				<div className="tiling-container">
					{windowManager.windows.map((win) => (
						<Window
							key={win.id}
							id={win.id}
							title={win.title}
							focused={win.id === windowManager.focusedWindow}
							onFocus={() => windowManager.setFocusedWindow(win.id)}
							closeWindow={windowManager.closeWindow}
							minimized={win.minimized}
							setWindowMinimized={windowManager.setWindowMinimized}
							maximized={win.maximized}
							setWindowMaximized={windowManager.setWindowMaximized}
						>
							{win.component}
						</Window>
					))}
				</div>
			</div>
			<StatusBar
				setFocusedWindow={windowManager.setFocusedWindow}
				focusedWindow={windowManager.focusedWindow}
				setWindowMinimized={windowManager.setWindowMinimized}
				setWindowMaximized={windowManager.setWindowMaximized}
				windows={windowManager.windows}
				addWindow={windowManager.addWindow}
			/>
			{showFullscreenToast && (
				<Toast
					message="For the best experience, press F11 to enter fullscreen mode"
					onClose={() => {}}
					duration={8000}
				/>
			)}
		</>
	);
}

export default function App() {
	return (
		<KernelProvider>
			<ConfigProvider>
				<AppContent />
			</ConfigProvider>
		</KernelProvider>
	);
}
