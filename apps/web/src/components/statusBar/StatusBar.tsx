import type { WindowItem } from '../../App';
import './StatusBar.css';
import Clock from './widgets/clock';

export type StatusBarProps = {
	windows: Array<WindowItem>;
	setWindowMinimized: (id: string, minimized: boolean) => void;
};

export default function StatusBar({ windows, setWindowMinimized }: StatusBarProps) {
	return (
		<div id="status-bar">
			Status Bar
			<span className="status-bar-spacer" />
			<span className="status-bar-task-items-container">
				{windows.map((win) => (
					<button key={win.id} className="status-bar-task-item" onClick={() => setWindowMinimized(win.id, false)}>
						{win.title}
					</button>
				))}
			</span>
			<span className="status-bar-spacer" />
			<Clock />
		</div>
	);
}
