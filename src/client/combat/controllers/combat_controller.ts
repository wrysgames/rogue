import { Controller, type OnStart } from '@flamework/core';
import type { CharacterAnimationController } from 'client/character/controllers/character_animaton_controller';
import type { CharacterController } from 'client/character/controllers/character_controller';
import { InputManager } from 'client/shared/utils/input_manager';
import wooden_sword from 'shared/features/weapons/data/medium/wooden_sword';
import type { Weapon } from 'shared/features/weapons/types';

@Controller()
export class CombatController implements OnStart {
	private readonly inputManager: InputManager;
	private equippedWeapon: Weapon | undefined;
	private isAttacking: boolean = false;

	constructor(
		private characterController: CharacterController,
		private characterAnimationController: CharacterAnimationController,
	) {
		this.inputManager = new InputManager();
		this.equippedWeapon = undefined;
	}

	public onStart(): void {
		this.inputManager.mapAction(Enum.UserInputType.MouseButton1, () => this.handleAttack());
		this.inputManager.mapAction(Enum.KeyCode.Q, () => {
			if (!this.equippedWeapon) {
				this.equipWeapon(wooden_sword);
			}
		});
		this.inputManager.listen();
		print('CombatController initialized');
	}

	public equipWeapon(weapon: Weapon): void {
		const character = this.characterController.getCharacter();
		if (!character) {
			warn('[CombatController]: Character not found');
			return;
		}

		const model = weapon.model;
		if (!model) {
			warn(`[CombatController]: Weapon \'${weapon.id} does not have a model attribute`);
			return;
		}

		const clonedWeapon = model.Clone();
		clonedWeapon.Parent = character;

		const handle = clonedWeapon.Handle;
		const grip = handle.RightGripAttachment;
		const hand = character.RightHand;
		const weld = new Instance('Motor6D');
		weld.Name = 'SwordWeld';
		weld.Part0 = hand;
		weld.Part1 = handle;
		weld.C0 = grip.CFrame;
		weld.Parent = hand;

		this.equippedWeapon = weapon;
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
