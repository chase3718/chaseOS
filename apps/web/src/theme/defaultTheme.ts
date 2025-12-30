// Master stylesheet. Users can edit /etc/theme.css to override everything.
export const defaultThemeCss = `
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
  font-family: 'Courier New', Courier, monospace;
  background-color: #000000;
  color: #00ff00;
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
  height: calc(100vh - 24px);
  width: 100%;
  overflow: hidden;
}

@media (max-width: 767px) {
  #desktop {
    height: calc(100vh - 32px);
    overflow: visible;
  }
}

.tiling-container {
  height: 100%;
  width: 100%;
  position: relative;
  display: grid;
  gap: 8px;
  padding: 8px;
  overflow: hidden;
  transition: grid-template-columns 0.3s ease-out, grid-template-rows 0.3s ease-out;
}

@media (max-width: 767px) {
  .tiling-container {
    height: auto;
    min-height: 100%;
    overflow: visible;
    gap: 4px;
    padding: 4px;
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
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  height: 100%;
  outline: none;
  transition: all 0.3s ease-out, width 0.3s ease-out, height 0.3s ease-out, transform 0.3s ease-out,
    grid-column 0.3s ease-out, grid-row 0.3s ease-out, visibility 0s linear 0s;
  transform-origin: center;
  animation: windowAppear 0.3s ease-out;
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
  height: calc(100vh - 24px) !important;
  z-index: 999;
  border-radius: 0;
  grid-column: unset !important;
  grid-row: unset !important;
  animation: maximizeWindow 0.3s ease-out;
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
  border-color: rgba(0, 200, 255, 0.8);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3);
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(40, 40, 40, 0.95), rgba(60, 60, 60, 0.95));
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 767px) {
  .window-header {
    padding: 12px 16px;
    font-size: 16px;
  }

  .window-button {
    width: 24px;
    height: 24px;
  }

  .button-group {
    gap: 12px;
  }
}

.window-content {
  flex: 1;
  overflow: auto;
}

.button-group {
  display: flex;
  gap: 8px;
}

.window-button {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  transform: scale(1);
}

.window-button:hover {
  opacity: 0.8;
  transform: scale(1.2);
}

.window-button:active {
  transform: scale(0.9);
}

.window-button.close { background-color: #ff5f57; }
.window-button.minimize { background-color: #ffbd2e; }
.window-button.maximize { background-color: #28c840; }

/* Status bar */
#status-bar {
  width: 100%;
  height: 24px;
  background-color: rgba(34, 34, 34, 0.95);
  color: #eee;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1000;
}

.status-bar-spacer { flex: 1; }

.status-bar-task-items-container { display: flex; gap: 8px; }

.status-bar-task-item {
  padding: 2px 12px;
  background-color: rgba(0, 200, 255, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 4px;
  color: #eee;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  transform: scale(1);
}

.status-bar-task-item:hover {
  background-color: rgba(0, 200, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 200, 255, 0.4);
}

.status-bar-task-item:active { transform: scale(0.95); }
.status-bar-task-item.minimized { opacity: 0.55; transform: scale(0.92); }
.status-bar-task-item.focused {
  background-color: rgba(0, 200, 255, 0.8);
  border-color: rgba(0, 200, 255, 0.9);
  box-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
}

@media (max-width: 767px) {
  #status-bar { height: 32px; padding: 0 8px; font-size: 14px; }
  .status-bar-task-item { padding: 4px 10px; font-size: 14px; }
  .status-bar-task-items-container { gap: 6px; }
  .status-bar-clock { font-size: 13px; }
}

/* Terminal */
.terminal {
  width: 100%;
  height: 100%;
  background-color: #000000;
  color: #00ff00;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 16px;
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
  margin-bottom: 8px;
}

.terminal-output::-webkit-scrollbar { width: 8px; }
.terminal-output::-webkit-scrollbar-track { background: #1a1a1a; }
.terminal-output::-webkit-scrollbar-thumb { background: #00ff00; border-radius: 4px; }
.terminal-output::-webkit-scrollbar-thumb:hover { background: #00cc00; }

.terminal-line { margin-bottom: 2px; }
.terminal-line-input { color: #00ff00; }
.terminal-line-output { color: #00ff00; }
.terminal-line-error { color: #ff4444; }

.terminal-prompt { color: #00ff00; font-weight: bold; user-select: none; }
.terminal-content { color: inherit; }

.terminal-input-form { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #00ff00;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  padding: 0;
  margin: 0;
  caret-color: #00ff00;
}

.terminal-input::selection { background-color: #00ff00; color: #000000; }

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.terminal-input:focus { outline: none; }

@media (max-width: 767px) {
  .terminal { padding: 12px; font-size: 12px; }
  .terminal-input { font-size: 12px; min-height: 20px; }
  .terminal-prompt { font-size: 12px; }
}

/* Text Viewer */
.text-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #000000;
  color: #00ff00;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  overflow: hidden;
}

.text-viewer-header {
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: rgba(40, 40, 40, 0.95);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  flex-shrink: 0;
}

.text-viewer-input {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  color: #00ff00;
  border: 1px solid rgba(0, 200, 255, 0.4);
  border-radius: 4px;
  padding: 6px 10px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.text-viewer-input:focus {
  border-color: rgba(0, 200, 255, 0.8);
  box-shadow: 0 0 8px rgba(0, 200, 255, 0.3);
}

.text-viewer-input::placeholder { color: #00ff00; opacity: 0.5; }

.text-viewer-button {
  background-color: rgba(0, 200, 255, 0.3);
  color: #00ff00;
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 4px;
  padding: 6px 16px;
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  transition: all 0.2s ease;
}

.text-viewer-button:hover { background-color: rgba(0, 200, 255, 0.5); }
.text-viewer-button:active { transform: scale(0.95); }

.text-viewer-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
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

.text-viewer-content.error { color: #ff4444; }

.text-viewer-content::-webkit-scrollbar { width: 8px; }
.text-viewer-content::-webkit-scrollbar-track { background: #1a1a1a; }
.text-viewer-content::-webkit-scrollbar-thumb { background: #00ff00; border-radius: 4px; }
.text-viewer-content::-webkit-scrollbar-thumb:hover { background: #00cc00; }

/* Text Editor */
.text-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #000000;
  color: #00ff00;
  font-family: 'Courier New', Courier, monospace;
}

.text-editor-header {
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: rgba(40, 40, 40, 0.95);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  flex-shrink: 0;
}

.text-editor-input {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  color: #00ff00;
  border: 1px solid rgba(0, 200, 255, 0.4);
  border-radius: 4px;
  padding: 6px 10px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.text-editor-input:focus { border-color: rgba(0, 200, 255, 0.8); box-shadow: 0 0 8px rgba(0, 200, 255, 0.3); }
.text-editor-input::placeholder { color: #00ff00; opacity: 0.5; }
.text-editor-actions { display: flex; gap: 8px; }

.text-editor-button {
  background-color: rgba(0, 200, 255, 0.3);
  color: #00ff00;
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 4px;
  padding: 6px 14px;
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  transition: all 0.2s ease;
}

.text-editor-button.primary { background-color: rgba(0, 200, 255, 0.5); border-color: rgba(0, 200, 255, 0.7); }
.text-editor-button:hover { background-color: rgba(0, 200, 255, 0.5); }
.text-editor-button:active { transform: scale(0.95); }
.text-editor-button:disabled { opacity: 0.6; cursor: not-allowed; }

.text-editor-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: rgba(20, 20, 20, 0.9);
  border-bottom: 1px solid rgba(0, 200, 255, 0.2);
  font-size: 12px;
}

.text-editor-status .error { color: #ff4444; }

.text-editor-area {
  flex: 1;
  background-color: #000000;
  color: #00ff00;
  border: none;
  padding: 16px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  outline: none;
}

.text-editor-area::selection { background-color: #00ff00; color: #000000; }
.text-editor-area::-webkit-scrollbar { width: 8px; }
.text-editor-area::-webkit-scrollbar-track { background: #1a1a1a; }
.text-editor-area::-webkit-scrollbar-thumb { background: #00ff00; border-radius: 4px; }
.text-editor-area::-webkit-scrollbar-thumb:hover { background: #00cc00; }

/* Toast */
.toast {
  position: fixed;
  bottom: 40px;
  right: 20px;
  background: rgba(40, 40, 40, 0.95);
  color: #eee;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 200, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 200, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  z-index: 10000;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease-out;
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
  color: #eee;
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
  transition: opacity 0.2s ease;
}

.toast-close:hover { opacity: 1; }

/* End of stylesheet */
`;
