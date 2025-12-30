import './Window.css';
import { WINDOW_HEADER_TITLE } from '../../constants';

export type WindowProps = {
	children: React.ReactNode;
	focused?: boolean;
	minimized?: boolean;
	id: string;
	onFocus?: () => void;
	closeWindow: (id: string) => void;
	setWindowMinimized: (id: string, minimized: boolean) => void;
};

export default function Window({
	children,
	focused,
	onFocus,
	closeWindow,
	id,
	minimized,
	setWindowMinimized,
}: WindowProps) {
	return (
		<div
			className={`window ${focused ? 'focused' : ''} ${minimized ? 'minimized' : ''}`}
			onClick={onFocus}
			tabIndex={0}
		>
			<div className="window-header">
				{WINDOW_HEADER_TITLE}
				<span className="button-group">
					<button className="window-button maximize" onClick={(e) => e.stopPropagation()}></button>
					<button
						className="window-button minimize"
						onClick={(e) => {
							e.stopPropagation();
							setWindowMinimized(id, true);
						}}
					></button>
					<button
						className="window-button close"
						onClick={(e) => {
							e.stopPropagation();
							closeWindow(id);
						}}
					></button>
				</span>
			</div>
			<div className="window-content">{children}</div>
		</div>
	);
}
