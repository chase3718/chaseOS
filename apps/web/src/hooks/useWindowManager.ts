import { useState, useCallback } from 'react';
import type { WindowItem } from '../types/window';

export interface WindowManagerState {
	windows: WindowItem[];
	focusedWindow: string | undefined;
}

export interface WindowManagerActions {
	addWindow: (window: Omit<WindowItem, 'id'>) => string;
	closeWindow: (id: string) => void;
	setFocusedWindow: (id: string | undefined) => void;
	setWindowMinimized: (id: string, minimized: boolean) => void;
	setWindowMaximized: (id: string, maximized: boolean) => void;
	getWindow: (id: string) => WindowItem | undefined;
	getAllWindows: () => WindowItem[];
}

export function useWindowManager(initialWindows: WindowItem[] = []): WindowManagerState & WindowManagerActions {
	const [windows, setWindows] = useState<WindowItem[]>(initialWindows);
	const [focusedWindow, setFocusedWindowState] = useState<string | undefined>(initialWindows[0]?.id);

	const addWindow = useCallback((window: Omit<WindowItem, 'id'>) => {
		const id = crypto.randomUUID();
		const newWindow: WindowItem = { ...window, id };
		setWindows((prev) => [...prev, newWindow]);
		setFocusedWindowState(id);
		return id;
	}, []);

	const closeWindow = useCallback(
		(id: string) => {
			setWindows((prev) => {
				const filtered = prev.filter((w) => w.id !== id);
				if (focusedWindow === id) {
					const nextFocus = filtered.find((w) => !w.minimized);
					setFocusedWindowState(nextFocus?.id);
				}
				return filtered;
			});
		},
		[focusedWindow]
	);

	const setFocusedWindow = useCallback((id: string | undefined) => {
		setFocusedWindowState(id);
	}, []);

	const setWindowMinimized = useCallback(
		(id: string, minimized: boolean = true) => {
			if (minimized && focusedWindow === id) {
				const remaining = windows.filter((w) => w.id !== id && !w.minimized);
				setFocusedWindowState(remaining[0]?.id);
			}
			setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized } : w)));
		},
		[focusedWindow, windows]
	);

	const setWindowMaximized = useCallback((id: string, maximized: boolean = true) => {
		setWindows((prev) =>
			prev.map((w) => {
				if (w.id === id) {
					return { ...w, maximized };
				} else if (maximized) {
					return { ...w, maximized: false };
				}
				return w;
			})
		);
	}, []);

	const getWindow = useCallback((id: string) => windows.find((w) => w.id === id), [windows]);

	const getAllWindows = useCallback(() => windows, [windows]);

	return {
		windows,
		focusedWindow,
		addWindow,
		closeWindow,
		setFocusedWindow,
		setWindowMinimized,
		setWindowMaximized,
		getWindow,
		getAllWindows,
	};
}
