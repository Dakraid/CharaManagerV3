// server/utils/taskManager.ts
import { CronJob } from 'cron';
import type { H3Event } from 'h3';

export interface Task {
	name: string;
	handler?: () => Promise<void>;
	workerPath?: string; // Path to worker file
	workerData?: any; // Data to pass to worker
	schedule?: string; // Cron format
	runAtStartup?: boolean;
	useWorker?: boolean; // Flag to use worker thread
}

class TaskManager {
	private tasks: Map<string, Task> = new Map();
	private cronJobs: Map<string, CronJob> = new Map();
	private runningTasks: Set<string> = new Set();

	register(task: Task) {
		// Validate task has either handler or worker config
		if (!task.handler && !task.workerPath) {
			throw new Error(`Task ${task.name} must have either a handler or workerPath`);
		}

		this.tasks.set(task.name, task);
		console.log(`Task registered: ${task.name}`);
	}

	async run(taskName: string, event?: H3Event): Promise<void> {
		const task = this.tasks.get(taskName);
		if (!task) {
			throw new Error(`Task not found: ${taskName}`);
		}

		// Prevent duplicate runs
		if (this.runningTasks.has(taskName)) {
			console.log(`Task already running: ${taskName}`);
			return;
		}

		this.runningTasks.add(taskName);

		const executeTask = async () => {
			try {
				console.log(`Task started: ${taskName}`);

				if (task.useWorker && task.workerPath) {
					// Run in worker thread
					const workerData = typeof task.workerData === 'function' ? await task.workerData() : task.workerData;

					await workerTaskManager.runWorker(task.workerPath, {
						taskName,
						...workerData,
					});
				} else if (task.handler) {
					// Run normally
					await task.handler();
				}

				console.log(`Task completed: ${taskName}`);
			} catch (error) {
				console.error(`Task failed: ${taskName}`, error);
			} finally {
				this.runningTasks.delete(taskName);
			}
		};

		// If we have an event context, use waitUntil for true fire & forget
		if (event) {
			event.waitUntil(executeTask());
		} else {
			// Otherwise, just run it asynchronously
			executeTask().catch(console.error);
		}
	}

	async runAll(event?: H3Event): Promise<void> {
		const promises = Array.from(this.tasks.keys()).map((name) => this.run(name, event));

		if (event) {
			event.waitUntil(Promise.allSettled(promises));
		} else {
			await Promise.allSettled(promises);
		}
	}

	setupScheduledTasks() {
		for (const [name, task] of this.tasks.entries()) {
			if (task.schedule) {
				const job = new CronJob(
					task.schedule,
					() => this.run(name),
					null,
					true, // Start immediately
					'UTC'
				);
				this.cronJobs.set(name, job);
				console.log(`Scheduled task setup: ${name} (${task.schedule})`);
			}
		}
	}

	async runStartupTasks() {
		const startupTasks = Array.from(this.tasks.values()).filter((task) => task.runAtStartup);

		for (const task of startupTasks) {
			await this.run(task.name);
		}
	}

	stopScheduledTasks() {
		for (const job of this.cronJobs.values()) {
			job.stop();
		}
		this.cronJobs.clear();
	}
}

export const taskManager = new TaskManager();
