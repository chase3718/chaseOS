import { ApplicationFactory } from './applicationFactory';

export interface AppDefinition {
	id: string;
	name: string;
	icon?: string;
	category?: string;
	create: (props?: Record<string, unknown>) => { title: string; component: React.ReactNode };
}

export class ApplicationRegistry {
	private static apps: Map<string, AppDefinition> = new Map([
		[
			'terminal',
			{
				id: 'terminal',
				name: 'Terminal',
				icon: '💻',
				category: 'System',
				create: () => ApplicationFactory.createTerminal(),
			},
		],
		[
			'textEditor',
			{
				id: 'textEditor',
				name: 'Text Editor',
				icon: '📝',
				category: 'Editors',
				create: (props?: Record<string, unknown>) =>
					ApplicationFactory.createTextEditor((props?.filePath as string) || '/home/notes/new.txt'),
			},
		],
		[
			'textViewer',
			{
				id: 'textViewer',
				name: 'Text Viewer',
				icon: '📄',
				category: 'Viewers',
				create: (props?: Record<string, unknown>) =>
					ApplicationFactory.createTextViewer((props?.filePath as string) || '/home/welcome.txt'),
			},
		],
	]);

	static getAll(): AppDefinition[] {
		return Array.from(this.apps.values());
	}

	static getByCategory(category: string): AppDefinition[] {
		return this.getAll().filter((app) => app.category === category);
	}

	static get(id: string): AppDefinition | undefined {
		return this.apps.get(id);
	}

	static register(app: AppDefinition): void {
		this.apps.set(app.id, app);
	}

	static unregister(id: string): boolean {
		return this.apps.delete(id);
	}

	static has(id: string): boolean {
		return this.apps.has(id);
	}
}
