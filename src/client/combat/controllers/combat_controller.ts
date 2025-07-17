import { Controller, type OnStart } from '@flamework/core';
import { InputManager } from 'client/shared/utils/input_manager';

@Controller()
export class CombatController implements OnStart {
	private readonly inputManager: InputManager;

	constructor() {
		this.inputManager = new InputManager();
	}

	public onStart(): void {
		this.inputManager.listen();
		print('CombatController initialized');
	}

    
}
