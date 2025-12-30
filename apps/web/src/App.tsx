import { useState, useEffect } from 'react';
import { TerminalUI } from './applications/terminal/TerminalUI';
import Window from './components/window/Window';
import { KernelProvider } from './contexts';
import { KEYBIND_NEW_WINDOW, KEYBIND_CLOSE_WINDOW } from './constants';
import './App.css';
import type { ReactNode } from 'react';
import StatusBar from './components/statusBar/StatusBar';

export interface WindowItem {
	id: string;
	title: string;
	minimized?: boolean;
	component: ReactNode;
}

function AppContent() {
	const [windows, setWindows] = useState<WindowItem[]>([
		{ id: crypto.randomUUID(), title: 'Terminal', component: <TerminalUI /> },
	]);
	const [focusedWindow, setFocusedWindow] = useState<string | null>(windows[0]?.id || null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Alt+Enter: Open new terminal
			if (e.altKey && !e.ctrlKey && !e.shiftKey && e.key === KEYBIND_NEW_WINDOW.key) {
				e.preventDefault();
				e.stopPropagation();
				const newWindow: WindowItem = {
					id: crypto.randomUUID(),
					title: 'Terminal',
					component: <TerminalUI />,
				};
				setWindows((prev) => [...prev, newWindow]);
				setFocusedWindow(newWindow.id);
			}
			// Alt+Shift+Q: Close focused window
			else if (
				e.altKey &&
				e.shiftKey &&
				(e.key === KEYBIND_CLOSE_WINDOW.key || e.key === KEYBIND_CLOSE_WINDOW.key.toUpperCase())
			) {
				e.preventDefault();
				e.stopPropagation();
				if (focusedWindow) {
					setWindows((prev) => {
						const filtered = prev.filter((w) => w.id !== focusedWindow);
						// Set focus to first remaining window
						if (filtered.length > 0) {
							setFocusedWindow(filtered[0].id);
						} else {
							setFocusedWindow(null);
						}
						return filtered;
					});
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown, { capture: true });
		return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
	}, [focusedWindow, windows.length]);

	const closeWindow = (id: string) => {
		setWindows((prev) => prev.filter((w) => w.id !== id));
		if (focusedWindow === id) {
			const remaining = windows.filter((w) => w.id !== id);
			setFocusedWindow(remaining[0]?.id || null);
		}
	};

	const setWindowMinimized = (id: string, minimized: boolean = true) => {
		console.log('Setting window', id, 'minimized to', minimized);
		setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized } : w)));
	};

	return (
		<>
			<StatusBar setWindowMinimized={setWindowMinimized} windows={windows} />
			<div id="desktop">
				<div className="tiling-container">
					{windows.map((win) => (
						<Window
							key={win.id}
							id={win.id}
							focused={win.id === focusedWindow}
							onFocus={() => setFocusedWindow(win.id)}
							closeWindow={closeWindow}
							minimized={win.minimized}
							setWindowMinimized={setWindowMinimized}
						>
							{win.component}
						</Window>
					))}
				</div>
			</div>
		</>
	);
}

export default function App() {
	return (
		<KernelProvider>
			<AppContent />
		</KernelProvider>
	);
}
