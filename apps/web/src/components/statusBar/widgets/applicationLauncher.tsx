import { useState } from 'react';
import { ApplicationRegistry } from '../../../services/applicationRegistry';

interface ApplicationLauncherProps {
	onLaunchApp: (appWindow: { title: string; component: React.ReactNode }) => void;
}

export default function ApplicationLauncher({ onLaunchApp }: ApplicationLauncherProps) {
	const [isOpen, setIsOpen] = useState(false);
	const apps = ApplicationRegistry.getAll();

	const launchApp = (appId: string) => {
		const app = ApplicationRegistry.get(appId);
		if (app) {
			const appWindow = app.create();
			onLaunchApp(appWindow);
			setIsOpen(false);
		}
	};

	return (
		<div className="app-launcher">
			<button
				className="app-launcher-button"
				onClick={() => setIsOpen(!isOpen)}
				title="Applications"
				aria-label="Application Launcher"
			>
				☰
			</button>
			{isOpen && (
				<>
					<div className="app-launcher-backdrop" onClick={() => setIsOpen(false)} />
					<div className="app-launcher-menu">
						<div className="app-launcher-header">Applications</div>
						<div className="app-launcher-grid">
							{apps.map((app) => (
								<button key={app.id} className="app-launcher-item" onClick={() => launchApp(app.id)} title={app.name}>
									<span className="app-launcher-icon">{app.icon}</span>
									<span className="app-launcher-name">{app.name}</span>
								</button>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
