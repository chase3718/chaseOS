import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { KernelClient } from './kernel/kernelClient';
import { Terminal } from './kernel/terminal';

const kernel = new KernelClient();
const term = new Terminal(kernel, { prompt: 'phantomos', cwd: '/' });

if (import.meta.env.DEV) {
	(window as any).os = {
		kernel,
		term,
		exec: async (line: string) => {
			const res = await term.exec(line);
			if (res.stdout) console.log(res.stdout);
			if (res.stderr) console.error(res.stderr);
			return res;
		},
		help: () => console.log('Try: await os.exec("help")'),
	};
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
