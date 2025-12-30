import type { WindowItem } from '../../types/window';
import Clock from './widgets/clock';
import ApplicationLauncher from './widgets/applicationLauncher';

export type StatusBarProps = {
	windows: Array<WindowItem>;
	setWindowMinimized: (id: string, minimized: boolean) => void;
	setWindowMaximized: (id: string, maximized: boolean) => void;
	setFocusedWindow: (id: string | undefined) => void;
	focusedWindow?: string;
	addWindow: (window: Omit<WindowItem, 'id'>) => void;
};

export default function StatusBar({
	windows,
	setWindowMinimized,
	setWindowMaximized,
	focusedWindow,
	setFocusedWindow,
	addWindow,
}: StatusBarProps) {
	return (
		<div id="status-bar">
			<ApplicationLauncher onLaunchApp={addWindow} />
			<span className="status-bar-spacer" />
			<span className="status-bar-task-items-container">
				{windows.map((win) => (
					<button
						key={win.id}
						className={`status-bar-task-item ${win.minimized ? 'minimized' : 'active'} ${
							win.id === focusedWindow ? 'focused' : ''
						}`}
						onClick={() => {
							// Un-maximize any maximized windows
							const maximizedWindow = windows.find((w) => w.maximized);
							if (maximizedWindow) {
								setWindowMaximized(maximizedWindow.id, false);
							}

							if (win.id !== focusedWindow) {
								if (win.minimized) {
									setWindowMinimized(win.id, false);
								}
								setFocusedWindow(win.id);
							} else {
								setWindowMinimized(win.id, true);
							}
						}}
					>
						{win.title}
					</button>
				))}
			</span>
			<span className="status-bar-spacer" />
			<Clock />
		</div>
	);
}
