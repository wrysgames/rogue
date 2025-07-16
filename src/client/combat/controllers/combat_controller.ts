import { Controller, type OnStart } from '@flamework/core';

@Controller()
export class CombatController implements OnStart {
	public onStart(): void {
		print('CombatController initialized');
	}
}
