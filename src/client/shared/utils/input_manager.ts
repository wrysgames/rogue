import { UserInputService } from '@rbxts/services';

export class InputManager {
	private readonly inputs: Map<Enum.UserInputType | Enum.KeyCode, (() => void)[]>;
	private readonly connections: RBXScriptConnection[];
	private isActive: boolean;

	constructor() {
		this.inputs = new Map();
		this.connections = [];
		this.isActive = false;
	}

	public mapAction(keybind: Enum.KeyCode | Enum.UserInputType, func: () => void): void {
		const keybindKey = this.inputs.get(keybind);
		if (keybindKey) {
			keybindKey.push(func);
		} else {
			this.inputs.set(keybind, [func]);
		}
	}

	public unmapAction(keybind: Enum.KeyCode | Enum.UserInputType, func?: () => void): void {
		const keybindKey = this.inputs.get(keybind);
		if (keybindKey) {
			if (func) {
				keybindKey.filter((val) => val !== func);
			} else {
				keybindKey.clear();
			}
		}
	}

	public listen(): void {
		if (this.isActive) {
			return;
		}

		this.connections.push(
			UserInputService.InputBegan.Connect((input, gameProcessed) => {
				if (!gameProcessed) {
					// determine if it was a keypress or an input
					let actionList: (() => void)[] | undefined;
					if (input.UserInputType === Enum.UserInputType.Keyboard) {
						actionList = this.inputs.get(input.KeyCode);
					} else {
						actionList = this.inputs.get(input.UserInputType);
					}

					if (actionList) {
						for (const action of actionList) {
							action();
						}
					}
				}
			}),
		);

		this.isActive = true;
	}

	public stop(): void {
		this.isActive = false;
	}

	public cleanUp(): void {
		this.connections.forEach((connection) => {
			connection.Disconnect();
		});
		this.isActive = false;
	}
}
