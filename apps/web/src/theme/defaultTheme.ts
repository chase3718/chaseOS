// Master stylesheet. Users can edit /etc/theme.css to override everything.
export const defaultThemeCss = `
:root {
  /* Layout */
  --status-bar-height: 32px;
  --status-bar-height-mobile: 40px;
  --window-grid-gap: 8px;
  --window-grid-gap-mobile: 4px;
  --window-grid-padding: 8px;
  --window-grid-padding-mobile: 4px;
  
  /* Colors */
  --color-primary: #00ff00;
  --color-accent: rgba(0, 200, 255, 0.8);
  --color-accent-hover: rgba(0, 200, 255, 0.5);
  --color-accent-light: rgba(0, 200, 255, 0.3);
  --color-accent-lighter: rgba(0, 200, 255, 0.1);
  --color-orange: rgba(255, 165, 0, 0.5);
  --color-orange-light: rgba(255, 165, 0, 0.3);
  --color-error: #ff4444;
  --color-text: #eee;
  --color-bg-dark: #000000;
  --color-bg-gray: rgba(34, 34, 34, 0.95);
  --color-bg-medium: rgba(40, 40, 40, 0.95);
  --color-bg-light: rgba(60, 60, 60, 0.95);
  --color-border: rgba(255, 255, 255, 0.3);
  --color-border-light: rgba(255, 255, 255, 0.2);
  
  /* Window buttons */
  --color-close: #ff5f57;
  --color-minimize: #ffbd2e;
  --color-maximize: #28c840;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 6px;
  --spacing-md: 8px;
  --spacing-lg: 12px;
  --spacing-xl: 16px;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 50%;
  
  /* Typography */
  --font-family: 'Courier New', Courier, monospace;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-md: 13px;
  --font-size-lg: 14px;
  --font-size-xl: 16px;
  --font-size-icon: 32px;
  --font-size-icon-mobile: 28px;
  
  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease-out;
  --transition-slow: 0.3s ease-in;
  
  /* Shadows */
  --shadow-sm: 0 2px 5px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.7);
  --shadow-glow-accent: 0 0 20px rgba(0, 200, 255, 0.3);
  --shadow-glow-small: 0 0 8px rgba(0, 200, 255, 0.3);
  --shadow-glow-medium: 0 0 10px rgba(0, 200, 255, 0.5);
  
  /* Z-index */
  --z-window-maximized: 999;
  --z-status-bar: 1000;
  --z-launcher-backdrop: 9998;
  --z-launcher-menu: 9999;
  --z-toast: 10000;
  
  /* Scrollbar */
  --scrollbar-width: 8px;
  --scrollbar-track: #1a1a1a;
  --scrollbar-thumb-hover: #00cc00;
}

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 767px) {
  body {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
}

body {
  font-family: var(--font-family);
  background-image: url('https://i0.wp.com/picjumbo.com/wp-content/uploads/dark-abstract-background-wallpaper-black-and-orange-free-photo.jpg?w=2210&quality=100');
  color: var(--color-primary);
}

#root {
  width: 100vw;
  height: 100vh;
}

@media (max-width: 767px) {
  #root {
    height: auto;
    min-height: 100vh;
  }
}

/* App layout */
#desktop {
  height: calc(100vh - var(--status-bar-height));
  width: 100%;
  overflow: hidden;
}

@media (max-width: 767px) {
  #desktop {
    height: calc(100vh - var(--status-bar-height-mobile));
    overflow: visible;
  }
}

.tiling-container {
  height: 100%;
  width: 100%;
  position: relative;
  display: grid;
  gap: var(--window-grid-gap);
  padding: var(--window-grid-padding);
  overflow: hidden;
  transition: grid-template-columns var(--transition-normal), grid-template-rows var(--transition-normal);
}

@media (max-width: 767px) {
  .tiling-container {
    height: auto;
    min-height: 100%;
    overflow: visible;
    gap: var(--window-grid-gap-mobile);
    padding: var(--window-grid-padding-mobile);
  }
}

.tiling-container:has(> :not(.minimized):nth-child(1):last-child),
.tiling-container:has(> :not(.minimized):only-child) {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.tiling-container:has(> :not(.minimized):nth-of-type(2):last-of-type) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}

.tiling-container:has(> :not(.minimized):nth-of-type(3):last-of-type) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.tiling-container:has(> :not(.minimized):nth-of-type(3):last-of-type) > :not(.minimized):nth-of-type(1) {
  grid-row: 1 / 3;
}

.tiling-container:has(> :not(.minimized):nth-of-type(4):last-of-type) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.tiling-container:has(> :not(.minimized):nth-of-type(5)) {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  grid-auto-rows: 1fr;
}

@media (max-width: 767px) {
  .tiling-container > .window:not(.minimized) {
    min-height: 400px;
    height: auto !important;
    grid-row: auto !important;
    grid-column: 1 !important;
  }

  .tiling-container:has(> :not(.minimized):nth-of-type(1)),
  .tiling-container:has(> :not(.minimized):nth-of-type(2)),
  .tiling-container:has(> :not(.minimized):nth-of-type(3)),
  .tiling-container:has(> :not(.minimized):nth-of-type(4)),
  .tiling-container:has(> :not(.minimized):nth-of-type(5)) {
    grid-template-columns: 1fr !important;
    grid-template-rows: auto !important;
    grid-auto-rows: auto !important;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .tiling-container:has(> :not(.minimized):nth-of-type(3):last-of-type) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }

  .tiling-container:has(> :not(.minimized):nth-of-type(3):last-of-type) > :not(.minimized):nth-of-type(1) {
    grid-row: auto;
  }

  .tiling-container:has(> :not(.minimized):nth-of-type(5)) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-auto-rows: minmax(250px, 1fr);
  }
}

/* Window */
.window {
  display: flex;
  flex-direction: column;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  height: 100%;
  outline: none;
  transition: all var(--transition-normal), width var(--transition-normal), height var(--transition-normal), transform var(--transition-normal),
    grid-column var(--transition-normal), grid-row var(--transition-normal), visibility 0s linear 0s;
  transform-origin: center;
  animation: windowAppear var(--transition-normal);
}

@keyframes windowAppear {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.window.minimized {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.7) translateY(30px);
  transition: all 0.25s ease-in, visibility 0s linear 0.25s;
}

.window.maximized {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100vw !important;
  height: calc(100vh - var(--status-bar-height)) !important;
  z-index: var(--z-window-maximized);
  border-radius: 0;
  grid-column: unset !important;
  grid-row: unset !important;
  animation: maximizeWindow var(--transition-normal);
}

@keyframes maximizeWindow {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.window.focused {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-glow-accent), var(--shadow-md);
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-bg-medium), var(--color-bg-light));
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-lg);
  font-weight: 500;
}

@media (max-width: 767px) {
  .window-header {
    padding: var(--spacing-lg) var(--spacing-xl);
    font-size: var(--font-size-xl);
  }

  .window-button {
    width: 24px;
    height: 24px;
  }

  .button-group {
    gap: var(--spacing-lg);
  }
}

.window-content {
  flex: 1;
  overflow: auto;
}

.button-group {
  display: flex;
  gap: var(--spacing-md);
}

.window-button {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  display: inline-block;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  transform: scale(1);
}

.window-button:hover {
  opacity: 0.8;
  transform: scale(1.2);
}

.window-button:active {
  transform: scale(0.9);
}

.window-button.close { background-color: var(--color-close); }
.window-button.minimize { background-color: var(--color-minimize); }
.window-button.maximize { background-color: var(--color-maximize); }

/* Status bar */
#status-bar {
  width: 100%;
  height: var(--status-bar-height);
  background-color: var(--color-bg-gray);
  color: var(--color-text);
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: var(--z-status-bar);
}

.status-bar-spacer { flex: 1; }

.status-bar-task-items-container { display: flex; gap: var(--spacing-md); }

.status-bar-task-item {
  padding: 2px var(--spacing-lg);
  background-color: var(--color-accent-light);
  border: 1px solid var(--color-accent-hover);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  transform: scale(1);
}

.status-bar-task-item:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 2px 6px var(--color-accent-light);
}

.status-bar-task-item:active { transform: scale(0.95); }
.status-bar-task-item.minimized { opacity: 0.55; transform: scale(0.92); }
.status-bar-task-item.focused {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-glow-medium);
}

@media (max-width: 767px) {
  #status-bar { height: var(--status-bar-height-mobile); padding: 0 var(--spacing-md); font-size: var(--font-size-lg); }
  .status-bar-task-item { padding: var(--spacing-xs) 10px; font-size: var(--font-size-lg); }
  .status-bar-task-items-container { gap: var(--spacing-sm); }
  .status-bar-clock { font-size: var(--font-size-md); }
}

/* Application Launcher */
.app-launcher {
  position: relative;
}

.app-launcher-button {
  padding: 2px var(--spacing-md);
  background-color: var(--color-orange-light);
  border: 1px solid var(--color-orange);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.app-launcher-button:hover {
  background-color: var(--color-orange);
  transform: translateY(-2px);
  box-shadow: 0 2px 6px var(--color-orange-light);
}

.app-launcher-button:active {
  transform: scale(0.95);
}

.app-launcher-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-launcher-backdrop);
  backdrop-filter: blur(2px);
}

.app-launcher-menu {
  position: fixed;
  bottom: calc(var(--status-bar-height) + var(--spacing-xs));
  left: 10px;
  background-color: rgba(34, 34, 34, 0.98);
  border: 1px solid var(--color-accent-hover);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  z-index: var(--z-launcher-menu);
  box-shadow: var(--shadow-lg);
  min-width: 300px;
  max-width: 400px;
}

.app-launcher-header {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-accent-light);
}

.app-launcher-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--spacing-lg);
}

.app-launcher-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-md);
  background-color: var(--color-accent-lighter);
  border: 1px solid var(--color-accent-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.app-launcher-item:hover {
  background-color: rgba(0, 200, 255, 0.25);
  border-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px var(--color-accent-light);
}

.app-launcher-item:active {
  transform: scale(0.95);
}

.app-launcher-icon {
  font-size: var(--font-size-icon);
}

.app-launcher-name {
  font-size: var(--font-size-xs);
  color: var(--color-text);
  text-align: center;
  word-wrap: break-word;
}

@media (max-width: 767px) {
  .app-launcher-menu {
    left: var(--spacing-md);
    bottom: calc(var(--status-bar-height-mobile) + var(--spacing-xs));
    min-width: 280px;
    max-width: 90vw;
  }
  
  .app-launcher-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 10px;
  }
  
  .app-launcher-icon {
    font-size: var(--font-size-icon-mobile);
  }
}


/* Terminal */
.terminal {
  width: 100%;
  height: 100%;
  background-color: var(--color-bg-dark);
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-lg);
  line-height: 1.5;
  padding: var(--spacing-xl);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  cursor: text;
  overflow: hidden;
  user-select: none;
}

.terminal-output {
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-bottom: var(--spacing-md);
}

.terminal-output::-webkit-scrollbar { width: var(--scrollbar-width); }
.terminal-output::-webkit-scrollbar-track { background: var(--scrollbar-track); }
.terminal-output::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: var(--radius-sm); }
.terminal-output::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }

.terminal-line { margin-bottom: 2px; }
.terminal-line-input { color: var(--color-primary); }
.terminal-line-output { color: var(--color-primary); }
.terminal-line-error { color: var(--color-error); }

.terminal-prompt { color: var(--color-primary); font-weight: bold; user-select: none; }
.terminal-content { color: inherit; }

.terminal-input-form { display: flex; gap: var(--spacing-md); align-items: center; flex-shrink: 0; }

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-lg);
  padding: 0;
  margin: 0;
  caret-color: var(--color-primary);
}

.terminal-input::selection { background-color: var(--color-primary); color: var(--color-bg-dark); }

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.terminal-input:focus { outline: none; }

@media (max-width: 767px) {
  .terminal { padding: var(--spacing-lg); font-size: var(--font-size-sm); }
  .terminal-input { font-size: var(--font-size-sm); min-height: 20px; }
  .terminal-prompt { font-size: var(--font-size-sm); }
}

/* Text Viewer */
.text-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--color-bg-dark);
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  overflow: hidden;
}

.text-viewer-header {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-medium);
  border-bottom: 1px solid var(--color-accent-light);
  flex-shrink: 0;
}

.text-viewer-input {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  color: var(--color-primary);
  border: 1px solid rgba(0, 200, 255, 0.4);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) 10px;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  outline: none;
  transition: border-color var(--transition-fast);
}

.text-viewer-input:focus {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-glow-small);
}

.text-viewer-input::placeholder { color: var(--color-primary); opacity: 0.5; }

.text-viewer-button {
  background-color: var(--color-accent-light);
  color: var(--color-primary);
  border: 1px solid var(--color-accent-hover);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  transition: all var(--transition-fast);
}

.text-viewer-button:hover { background-color: var(--color-accent-hover); }
.text-viewer-button:active { transform: scale(0.95); }

.text-viewer-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-xl);
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

.text-viewer-content.loading,
.text-viewer-content.error {
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-viewer-content.error { color: var(--color-error); }

.text-viewer-content::-webkit-scrollbar { width: var(--scrollbar-width); }
.text-viewer-content::-webkit-scrollbar-track { background: var(--scrollbar-track); }
.text-viewer-content::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: var(--radius-sm); }
.text-viewer-content::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }

/* Text Editor */
.text-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--color-bg-dark);
  color: var(--color-primary);
  font-family: var(--font-family);
}

.text-editor-header {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-medium);
  border-bottom: 1px solid var(--color-accent-light);
  flex-shrink: 0;
}

.text-editor-input {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  color: var(--color-primary);
  border: 1px solid rgba(0, 200, 255, 0.4);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) 10px;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  outline: none;
  transition: border-color var(--transition-fast);
}

.text-editor-input:focus { border-color: var(--color-accent); box-shadow: var(--shadow-glow-small); }
.text-editor-input::placeholder { color: var(--color-primary); opacity: 0.5; }
.text-editor-actions { display: flex; gap: var(--spacing-md); }

.text-editor-button {
  background-color: var(--color-accent-light);
  color: var(--color-primary);
  border: 1px solid var(--color-accent-hover);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) 14px;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  transition: all var(--transition-fast);
}

.text-editor-button.primary { background-color: var(--color-accent-hover); border-color: rgba(0, 200, 255, 0.7); }
.text-editor-button:hover { background-color: var(--color-accent-hover); }
.text-editor-button:active { transform: scale(0.95); }
.text-editor-button:disabled { opacity: 0.6; cursor: not-allowed; }

.text-editor-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: rgba(20, 20, 20, 0.9);
  border-bottom: 1px solid rgba(0, 200, 255, 0.2);
  font-size: var(--font-size-sm);
}

.text-editor-status .error { color: var(--color-error); }

.text-editor-area {
  flex: 1;
  background-color: var(--color-bg-dark);
  color: var(--color-primary);
  border: none;
  padding: var(--spacing-xl);
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  line-height: 1.5;
  resize: none;
  outline: none;
}

.text-editor-area::selection { background-color: var(--color-primary); color: var(--color-bg-dark); }
.text-editor-area::-webkit-scrollbar { width: var(--scrollbar-width); }
.text-editor-area::-webkit-scrollbar-track { background: var(--scrollbar-track); }
.text-editor-area::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: var(--radius-sm); }
.text-editor-area::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }

/* Toast */
.toast {
  position: fixed;
  bottom: 40px;
  right: 20px;
  background: var(--color-bg-medium);
  color: var(--color-text);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-accent-hover);
  box-shadow: var(--shadow-md), 0 0 20px rgba(0, 200, 255, 0.2);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--font-size-md);
  z-index: var(--z-toast);
  opacity: 0;
  transform: translateY(20px);
  transition: all var(--transition-normal);
  pointer-events: none;
  max-width: 350px;
}

.toast.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.toast-message { flex: 1; line-height: 1.4; }

.toast-close {
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.toast-close:hover { opacity: 1; }

/* End of stylesheet */
`;
