import { Worker } from 'node:worker_threads';

export class WorkerTaskManager {
	async runWorker(workerCode: string, data: any): Promise<any> {
		return new Promise((resolve, reject) => {
			const worker = new Worker(workerCode, {
				eval: true,
				workerData: data,
			});

			let messageReceived = false;

			worker.on('message', (result) => {
				messageReceived = true;
				resolve(result);
			});

			worker.on('error', (error) => {
				console.error('Worker error:', error);
				reject(error);
			});

			worker.on('exit', (code) => {
				if (code !== 0 && !messageReceived) {
					reject(new Error(`Worker stopped with exit code ${code}`));
				}
			});
		});
	}

	// Helper to create worker code from function
	createWorkerCode(fn: (workerData: any) => Promise<any>): string {
		return `
			const { parentPort, workerData } = require('node:worker_threads');
			
			const workerFunction = ${fn.toString()};
			
			workerFunction(workerData)
				.then(result => parentPort.postMessage(result))
				.catch(error => parentPort.postMessage({ 
					success: false, 
					error: error.message || 'Unknown error' 
				}));
		`;
	}
}

export const workerTaskManager = new WorkerTaskManager();
