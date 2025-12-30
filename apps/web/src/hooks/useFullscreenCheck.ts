import { useEffect, useState } from 'react';

export function useFullscreenCheck(delay: number = 500): boolean {
	const [isNotFullscreen, setIsNotFullscreen] = useState(false);

	useEffect(() => {
		const checkFullscreen = () => {
			const isFullScreenAPI = Boolean(
				document.fullscreenElement ||
					(document as Document & { webkitFullscreenElement: Element | null }).webkitFullscreenElement ||
					(document as Document & { mozFullScreenElement: Element | null }).mozFullScreenElement ||
					(document as Document & { msFullscreenElement: Element | null }).msFullscreenElement
			);

			const isFullScreenWindow =
				window.innerHeight === window.screen.height && window.innerWidth === window.screen.width;

			return isFullScreenAPI || isFullScreenWindow;
		};

		const timer = setTimeout(() => {
			if (!checkFullscreen()) {
				setIsNotFullscreen(true);
			}
		}, delay);

		return () => clearTimeout(timer);
	}, [delay]);

	return isNotFullscreen;
}
