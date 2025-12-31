import type { KernelClient } from '../kernel/kernelClient';

export type Keybind = {
	key: string;
	alt?: boolean;
	ctrl?: boolean;
	shift?: boolean;
};

export interface AppConfig {
	terminal: {
		welcomeMessage: string;
		promptDefault: string;
		clearScreenCode: string;
	};
	theme: {
		stylePath: string;
	};
	layout: {
		windowGridGap: number;
		windowPadding: number;
		gridCols: number;
		gridRowHeight: number;
	};
	keyboard: {
		newWindow: Keybind;
		closeWindow: Keybind;
		clearTerminal: Keybind;
		interrupt: Keybind;
	};
	colors: {
		textPrimary: string;
		textSecondary: string;
		bgDark: string;
		bgDarker: string;
		borderLight: string;
		focusAccent: string;
	};
	idb: {
		databaseName: string;
		storeName: string;
		fsStateKey: string;
	};
	filesystem: {
		rootPath: string;
	};
	loading: {
		message: string;
		styles: Record<string, string>;
	};
}

export const CONFIG_PATH = '/etc/app-config.json';

export const defaultAppConfig: AppConfig = {
	terminal: {
		welcomeMessage: 'ChaseOS v1.0.2 - Type "help" for available commands',
		promptDefault: 'chaseos',
		clearScreenCode: '\u001b[2J\u001b[H',
	},
	theme: {
		stylePath: '/etc/theme.css',
	},
	layout: {
		windowGridGap: 8,
		windowPadding: 8,
		gridCols: 12,
		gridRowHeight: 30,
	},
	keyboard: {
		newWindow: { key: 'Enter', alt: true, ctrl: false, shift: false },
		closeWindow: { key: 'q', alt: true, ctrl: false, shift: true },
		clearTerminal: { key: 'l', ctrl: true },
		interrupt: { key: 'c', ctrl: true },
	},
	colors: {
		textPrimary: '#00ff00',
		textSecondary: '#eee',
		bgDark: '#000000',
		bgDarker: '#222',
		borderLight: '#ffffff',
		focusAccent: 'rgba(0, 200, 255, 0.8)',
	},
	idb: {
		databaseName: 'chaseos',
		storeName: 'kv',
		fsStateKey: 'fs_state_v1',
	},
	filesystem: {
		rootPath: '/',
	},
	loading: {
		message: 'Initializing kernel...',
		styles: {
			width: '100vw',
			height: '100vh',
			backgroundColor: '#000000',
			color: '#00ff00',
			fontFamily: 'Courier New, Courier, monospace',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: '14px',
		},
	},
};

function mergeSection<T extends Record<string, any>>(base: T, override?: Partial<T>): T {
	if (!override) return base;
	return { ...base, ...override } as T;
}

function mergeKeybind(base: Keybind, override?: Partial<Keybind>): Keybind {
	return mergeSection(base, override);
}

export function mergeAppConfig(base: AppConfig, override?: Partial<AppConfig>): AppConfig {
	if (!override) return base;

	return {
		terminal: mergeSection(base.terminal, override.terminal),
		layout: mergeSection(base.layout, override.layout),
		keyboard: {
			newWindow: mergeKeybind(base.keyboard.newWindow, override.keyboard?.newWindow),
			closeWindow: mergeKeybind(base.keyboard.closeWindow, override.keyboard?.closeWindow),
			clearTerminal: mergeKeybind(base.keyboard.clearTerminal, override.keyboard?.clearTerminal),
			interrupt: mergeKeybind(base.keyboard.interrupt, override.keyboard?.interrupt),
		},
		theme: mergeSection(base.theme, override.theme),
		colors: mergeSection(base.colors, override.colors),
		idb: mergeSection(base.idb, override.idb),
		filesystem: mergeSection(base.filesystem, override.filesystem),
		loading: {
			message: override.loading?.message ?? base.loading.message,
			styles: mergeSection(base.loading.styles, override.loading?.styles),
		},
	};
}

export async function loadAppConfig(kernel: KernelClient, path: string = CONFIG_PATH): Promise<AppConfig> {
	try {
		const bytes = await kernel.fs_read_file(path);
		const text = new TextDecoder().decode(bytes);
		const parsed = JSON.parse(text) as Partial<AppConfig>;
		return mergeAppConfig(defaultAppConfig, parsed);
	} catch (err) {
		console.warn('Failed to load app config; using defaults', err);
		return defaultAppConfig;
	}
}
