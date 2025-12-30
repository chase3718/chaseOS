import type { ReactNode } from 'react';
import { TerminalUI } from '../applications/terminal/TerminalUI';
import { TextViewer } from '../applications/textViewer/TextViewer';
import { TextEditor } from '../applications/textEditor/TextEditor';

export type ApplicationType = 'terminal' | 'textViewer' | 'textEditor';

export interface ApplicationConfig {
	type: ApplicationType;
	title?: string;
	props?: Record<string, unknown>;
}

export class ApplicationFactory {
	static create(config: ApplicationConfig): { title: string; component: ReactNode } {
		switch (config.type) {
			case 'terminal':
				return {
					title: config.title || 'Terminal',
					component: <TerminalUI />,
				};
			case 'textViewer':
				return {
					title: config.title || 'Text Viewer',
					component: <TextViewer {...(config.props as { filePath?: string })} />,
				};
			case 'textEditor':
				return {
					title: config.title || 'Text Editor',
					component: <TextEditor {...(config.props as { filePath?: string })} />,
				};
			default:
				throw new Error(`Unknown application type: ${config.type}`);
		}
	}

	static createTerminal(): ReturnType<typeof ApplicationFactory.create> {
		return this.create({ type: 'terminal' });
	}

	static createTextViewer(filePath: string): ReturnType<typeof ApplicationFactory.create> {
		return this.create({
			type: 'textViewer',
			title: `Viewer - ${filePath}`,
			props: { filePath },
		});
	}

	static createTextEditor(filePath: string): ReturnType<typeof ApplicationFactory.create> {
		return this.create({
			type: 'textEditor',
			title: `Editor - ${filePath}`,
			props: { filePath },
		});
	}
}
