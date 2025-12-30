import type { Keybind } from '../config/appConfig';

export function matchesKeybind(event: KeyboardEvent | React.KeyboardEvent, bind: Keybind): boolean {
	const expectedAlt = bind.alt ?? false;
	const expectedCtrl = bind.ctrl ?? false;
	const expectedShift = bind.shift ?? false;

	return (
		event.altKey === expectedAlt &&
		event.ctrlKey === expectedCtrl &&
		event.shiftKey === expectedShift &&
		(event.key === bind.key || event.key === bind.key.toUpperCase())
	);
}
