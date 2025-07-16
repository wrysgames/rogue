import { Controller, type OnStart } from '@flamework/core'

@Controller()
export class CombatController implements OnStart {
	constructor() {
		this.connections = []
	}

	public onStart(): void {
		print('CombatController initialized')
	}
}
