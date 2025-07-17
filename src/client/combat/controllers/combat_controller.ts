import { Controller, type OnStart } from '@flamework/core';
import type { CharacterAnimationController } from 'client/character/controllers/character_animaton_controller';
import type { CharacterController } from 'client/character/controllers/character_controller';
import { InputManager } from 'client/shared/utils/input_manager';
import wooden_sword from 'shared/features/weapons/data/medium/wooden_sword';
import type { Weapon } from 'shared/features/weapons/types';

@Controller()
export class CombatController implements OnStart {
	private readonly inputManager: InputManager;
	private equippedWeapon: Weapon;
	private isAttacking: boolean = false;

	constructor(
		private characterController: CharacterController,
		private characterAnimationController: CharacterAnimationController,
	) {
		this.inputManager = new InputManager();
		this.equippedWeapon = wooden_sword;
	}

	public onStart(): void {
		this.inputManager.mapAction(Enum.UserInputType.MouseButton1, () => this.handleAttack());
		this.inputManager.listen();
		print('CombatController initialized');
	}

	public handleAttack(): void {
		if (this.isAttacking) return;

		const character = this.characterController.getCharacter();

		if (!character) {
			warn("[CombatController]: Couldn't find character");
			return;
		}

		const track = this.characterAnimationController.loadAnimation('rbxassetid://82296932537283');
		if (track) {
			track.Play();
		} else {
			warn("[CombatController]: Animation track couldn't be played");
		}
	}
}
