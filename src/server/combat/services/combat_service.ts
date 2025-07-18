import { OnStart, Service } from '@flamework/core';
import { ServerEvents } from 'server/shared/utils/networking/events';

@Service()
export class CombatService implements OnStart {
	public onStart(): void {
		ServerEvents.hitHumanoid.connect((player, humanoid) => {
			print(player, humanoid);
		});
	}
}
