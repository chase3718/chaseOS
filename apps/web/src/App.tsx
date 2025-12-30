import { useState, useEffect } from 'react';
import { TerminalUI } from './applications/terminal/TerminalUI';
import { TextViewer } from './applications/textViewer/TextViewer';
import { TextEditor } from './applications/textEditor/TextEditor';
import Window from './components/window/Window';
import { ConfigProvider, KernelProvider, useConfig } from './contexts';
import type { Keybind } from './config/appConfig';
import type { ReactNode } from 'react';
import StatusBar from './components/statusBar/StatusBar';
import Toast from './components/toast/Toast';

export interface WindowItem {
	id: string;
	title: string;
	minimized?: boolean;
	maximized?: boolean;
	component: ReactNode;
}

function AppContent() {
	const { config } = useConfig();
	const [windows, setWindows] = useState<WindowItem[]>([
		{ id: crypto.randomUUID(), title: 'Terminal', component: <TerminalUI /> },
	]);
	const [focusedWindow, setFocusedWindow] = useState<string | undefined>(windows[0]?.id || undefined);
	const [showFullscreenToast, setShowFullscreenToast] = useState(false);

	const matchesKeybind = (event: KeyboardEvent, bind: Keybind) => {
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

	// Check if fullscreen on mount
	useEffect(() => {
		const checkFullscreen = () => {
			const isFullScreenAPI = Boolean(
				document.fullscreenElement ||
					(document as Document & { webkitFullscreenElement: Element | null }).webkitFullscreenElement ||
					(document as Document & { mozFullScreenElement: Element | null }).mozFullScreenElement ||
					(document as Document & { msFullscreenElement: Element | null }).msFullscreenElement
			);

			// Also check window dimensions (F11 fullscreen)
			const isFullScreenWindow =
				window.innerHeight === window.screen.height && window.innerWidth === window.screen.width;

			return isFullScreenAPI || isFullScreenWindow;
		};

		// Small delay to ensure page is fully loaded
		const timer = setTimeout(() => {
			if (!checkFullscreen()) {
				setShowFullscreenToast(true);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (matchesKeybind(e, config.keyboard.newWindow)) {
				e.preventDefault();
				e.stopPropagation();
				const newWindow: WindowItem = {
					id: crypto.randomUUID(),
					title: 'Terminal',
					component: <TerminalUI />,
				};
				setWindows((prev) => [...prev, newWindow]);
				setFocusedWindow(newWindow.id);
			} else if (matchesKeybind(e, config.keyboard.closeWindow)) {
				e.preventDefault();
				e.stopPropagation();
				if (focusedWindow !== undefined) {
					setWindows((prev) => {
						const filtered = prev.filter((w) => w.id !== focusedWindow);
						const nextFocus = filtered.find((w) => !w.minimized);
						setFocusedWindow(nextFocus?.id);
						return filtered;
					});
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown, { capture: true });
		return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
	}, [focusedWindow, windows, config.keyboard.closeWindow, config.keyboard.newWindow]);

	const closeWindow = (id: string) => {
		setWindows((prev) => prev.filter((w) => w.id !== id));
		if (focusedWindow === id) {
			const remaining = windows.filter((w) => w.id !== id) || undefined;
			setFocusedWindow(remaining[0]?.id || undefined);
		}
	};

	const setWindowMinimized = (id: string, minimized: boolean = true) => {
		console.log('Setting window', id, 'minimized to', minimized);
		if (minimized && focusedWindow === id) {
			const remaining = windows.filter((w) => w.id !== id && !w.minimized);
			setFocusedWindow(remaining[0]?.id || undefined);
		}
		setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized } : w)));
	};

	const setWindowMaximized = (id: string, maximized: boolean = true) => {
		setWindows((prev) =>
			prev.map((w) => {
				// If maximizing this window, un-maximize all others
				if (w.id === id) {
					return { ...w, maximized };
				} else if (maximized) {
					// Un-maximize other windows when one is maximized
					return { ...w, maximized: false };
				}
				return w;
			})
		);
	};

	const openFile = (filePath: string) => {
		const newWindow: WindowItem = {
			id: crypto.randomUUID(),
			title: `Viewer - ${filePath}`,
			component: <TextViewer filePath={filePath} />,
		};
		setWindows((prev) => [...prev, newWindow]);
		setFocusedWindow(newWindow.id);
	};

	const openEditor = (filePath: string) => {
		const newWindow: WindowItem = {
			id: crypto.randomUUID(),
			title: `Editor - ${filePath}`,
			component: <TextEditor filePath={filePath} />,
		};
		setWindows((prev) => [...prev, newWindow]);
		setFocusedWindow(newWindow.id);
	};

	// Expose openFile to window for terminal access
	useEffect(() => {
		(window as unknown as Window & { openFile: typeof openFile }).openFile = openFile;
		(window as unknown as Window & { openEditor: typeof openEditor }).openEditor = openEditor;
	}, []);

	return (
		<>
			<div id="desktop">
				<div className="tiling-container">
					{windows.map((win) => (
						<Window
							key={win.id}
							id={win.id}
							title={win.title}
							focused={win.id === focusedWindow}
							onFocus={() => setFocusedWindow(win.id)}
							closeWindow={closeWindow}
							minimized={win.minimized}
							setWindowMinimized={setWindowMinimized}
							maximized={win.maximized}
							setWindowMaximized={setWindowMaximized}
						>
							{win.component}
						</Window>
					))}
				</div>
			</div>
			<StatusBar
				setFocusedWindow={setFocusedWindow}
				focusedWindow={focusedWindow}
				setWindowMinimized={setWindowMinimized}
				setWindowMaximized={setWindowMaximized}
				windows={windows}
			/>
			{showFullscreenToast && (
				<Toast
					message="For the best experience, press F11 to enter fullscreen mode"
					onClose={() => setShowFullscreenToast(false)}
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
