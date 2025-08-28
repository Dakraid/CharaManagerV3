export const useUploadStore = defineStore('uploads', {
	state: () => {
		return {
			files: [] as Upload[],
			urls: [] as string[],
		};
	},
	getters: {},
	actions: {
		async add(file: File | Upload, origin?: string) {
			if (file instanceof File) {
				if (!this.files.some((f) => f.file === file)) {
					this.files.push({ file: file, origin: origin ?? 'local', public: false });
				}
			} else {
				if (!this.files.some((f) => f === file)) {
					this.files.push(file);
				}
			}
		},
		async addMany(files: File[] | Upload[]) {
			if (files.length === 0) {
				return;
			}

			const isFileArray = files[0] instanceof File;
			this.files = files.map((f) => {
				if (isFileArray) {
					return { file: f as File, origin: 'local', public: false };
				}
				return f as Upload;
			});
		},
		async remove(file: File | Upload) {
			if (file instanceof File) {
				this.files = this.files.filter((f) => f.file !== file);
			} else {
				this.files = this.files.filter((f) => f !== file);
			}
		},
		async clear() {
			this.files = [];
		},
	},
});
