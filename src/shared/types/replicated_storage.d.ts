declare global {
	interface ReplicatedStorage {
		weapons: Folder & {
			light: Folder;
			medium: Folder;
			heavy: Folder;
		};
	}
}
export {};
