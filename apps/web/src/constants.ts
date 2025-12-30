// App-wide constants

// Terminal UI
export const TERMINAL_WELCOME_MESSAGE = 'ChaseOS v1.0.0 - Type "help" for available commands';
export const TERMINAL_PROMPT_DEFAULT = 'chaseos';
export const CLEAR_SCREEN_CODE = '\u001b[2J\u001b[H';

// Window layout
export const WINDOW_HEADER_TITLE = 'Terminal';
export const WINDOW_GRID_GAP = 8;
export const WINDOW_PADDING = 8;
export const GRID_COLS = 12;
export const GRID_ROW_HEIGHT = 30;

// Keyboard shortcuts
export const KEYBIND_NEW_WINDOW = { key: 'Enter', alt: true, ctrl: false, shift: false };
export const KEYBIND_CLOSE_WINDOW = { key: 'q', alt: true, ctrl: false, shift: true };
export const KEYBIND_CLEAR_TERMINAL = { key: 'l', ctrl: true };
export const KEYBIND_INTERRUPT = { key: 'c', ctrl: true };

// Colors & Styling
export const COLOR_TEXT_PRIMARY = '#00ff00';
export const COLOR_TEXT_SECONDARY = '#eee';
export const COLOR_BG_DARK = '#000000';
export const COLOR_BG_DARKER = '#222';
export const COLOR_BORDER_LIGHT = '#ffffff';
export const COLOR_FOCUS_ACCENT = 'rgba(0, 200, 255, 0.8)';

// IndexedDB
export const IDB_DATABASE_NAME = 'chaseos';
export const IDB_STORE_NAME = 'kv';
export const IDB_FS_STATE_KEY = 'fs_state_v1';

// Filesystem
export const FS_ROOT_PATH = '/';
