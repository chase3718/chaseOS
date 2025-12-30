import { useEffect, useState } from 'react';

export default function Clock() {
	const [time, setTime] = useState<string>('');

	useEffect(() => {
		// Set initial time
		const updateTime = () => {
			const now = new Date();
			const formatted = now.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				second: '2-digit',
				hour12: true,
			});
			setTime(formatted);
		};

		updateTime();

		// Update every second
		const interval = setInterval(updateTime, 1000);

		return () => clearInterval(interval);
	}, []);

	return <div id="clock-widget">{time}</div>;
}
