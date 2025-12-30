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
	const [focusedWindow, setFocusedWindow] = useState<string | undefined>(windows[0]?.id || undefined);

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
				if (focusedWindow !== undefined) {
					setWindows((prev) => {
						const filtered = prev.filter((w) => w.id !== focusedWindow);
						// Set focus to first remaining non-minimized window
						const nextFocus = filtered.find((w) => !w.minimized);
						setFocusedWindow(nextFocus?.id);
						return filtered;
					});
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown, { capture: true });
		return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
	}, [focusedWindow, windows]);

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
				windows={windows}
			/>
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
