import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { KernelClient } from '../kernel/kernelClient';
import { KernelContext } from './kernelContext';
import { KERNEL_LOADING_STYLES, KERNEL_LOADING_MESSAGE } from './constants';

interface KernelProviderProps {
	children: ReactNode;
}

export function KernelProvider({ children }: KernelProviderProps) {
	const [kernel, setKernel] = useState<KernelClient | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const kernelInstance = new KernelClient();
		setKernel(kernelInstance);

		kernelInstance.ready
			.then(() => {
				setIsReady(true);
			})
			.catch((err) => {
				console.error('Kernel failed to initialize:', err);
			});

		return () => {
			kernelInstance.dispose();
			setIsReady(false);
		};
	}, []);

	const value = useMemo(() => (kernel ? { kernel, isReady } : null), [kernel, isReady]);

	if (!kernel || !isReady) {
		return <div style={KERNEL_LOADING_STYLES}>{KERNEL_LOADING_MESSAGE}</div>;
	}

	return <KernelContext.Provider value={value}>{children}</KernelContext.Provider>;
}
