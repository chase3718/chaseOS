import { createContext } from 'react';
import { KernelClient } from '../kernel/kernelClient';

export interface KernelContextValue {
	kernel: KernelClient;
	isReady: boolean;
}

export const KernelContext = createContext<KernelContextValue | null>(null);
