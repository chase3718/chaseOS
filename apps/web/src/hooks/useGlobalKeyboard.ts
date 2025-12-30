import { useEffect } from 'react';
import type { Keybind } from '../config/appConfig';
import { matchesKeybind } from '../utils/keybinds';

export interface KeyboardShortcut {
	keybind: Keybind;
	handler: () => void;
	capture?: boolean;
}

export function useGlobalKeyboard(shortcuts: KeyboardShortcut[]) {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			for (const shortcut of shortcuts) {
				if (matchesKeybind(e, shortcut.keybind)) {
					e.preventDefault();
					e.stopPropagation();
					shortcut.handler();
					break;
				}
			}
		};

		const useCapture = shortcuts.some((s) => s.capture);
		window.addEventListener('keydown', handleKeyDown, { capture: useCapture });
		return () => window.removeEventListener('keydown', handleKeyDown, { capture: useCapture });
	}, [shortcuts]);
}
