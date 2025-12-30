import type { ReactNode } from 'react';

export interface WindowItem {
	id: string;
	title: string;
	minimized?: boolean;
	maximized?: boolean;
	component: ReactNode;
}
