import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { defaultAppConfig, loadAppConfig, type AppConfig } from '../config/appConfig';
import { useKernel } from './useKernel';
import { applyFsTheme } from '../theme/applyFsTheme';

interface ConfigContextValue {
	config: AppConfig;
	reload: () => Promise<void>;
	loading: boolean;
	error?: string;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
	const { kernel, isReady } = useKernel();
	const [config, setConfig] = useState<AppConfig>(defaultAppConfig);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | undefined>();

	const load = async () => {
		if (!isReady) return;
		setLoading(true);
		try {
			const cfg = await loadAppConfig(kernel);
			setConfig(cfg);
			setError(undefined);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			setError(message);
			setConfig(defaultAppConfig);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isReady) {
			load();
		}
	}, [isReady]);

	useEffect(() => {
		if (!isReady || loading) return;
		applyFsTheme(kernel, config.theme.stylePath);
	}, [isReady, loading, config.theme.stylePath, kernel]);

	const value = useMemo(
		() => ({
			config,
			reload: load,
			loading,
			error,
		}),
		[config, loading, error]
	);

	if (!isReady || loading) {
		return <div style={defaultAppConfig.loading.styles}>{defaultAppConfig.loading.message}</div>;
	}

	return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
	const ctx = useContext(ConfigContext);
	if (!ctx) {
		throw new Error('useConfig must be used within a ConfigProvider');
	}
	return ctx;
}
