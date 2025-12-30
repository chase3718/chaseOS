import type { KernelClient } from '../kernel/kernelClient';
import { defaultThemeCss } from './defaultTheme';

const STYLE_ELEMENT_ID = 'fs-theme-style';

function ensureStyleElement(): HTMLStyleElement {
	let el = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
	if (!el) {
		el = document.createElement('style');
		el.id = STYLE_ELEMENT_ID;
		document.head.appendChild(el);
	}
	return el;
}

function applyDefaultThemeOnce(styleEl: HTMLStyleElement) {
	if (!styleEl.textContent || styleEl.textContent.trim() === '') {
		styleEl.textContent = defaultThemeCss;
	}
}

// Seed default theme immediately so the UI is styled before FS config loads.
const initialStyleEl = ensureStyleElement();
applyDefaultThemeOnce(initialStyleEl);

export async function applyFsTheme(kernel: KernelClient, path: string): Promise<void> {
	const styleEl = ensureStyleElement();
	applyDefaultThemeOnce(styleEl);

	try {
		const bytes = await kernel.fs_read_file(path);
		const css = new TextDecoder().decode(bytes);
		styleEl.textContent = css;
	} catch (err) {
		console.warn(`Failed to load theme from ${path}; keeping previous styles`, err);
		applyDefaultThemeOnce(styleEl);
	}
}
