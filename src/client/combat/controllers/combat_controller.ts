import { Controller, type OnStart } from '@flamework/core';
import { RunService, Workspace } from '@rbxts/services';
import type { CharacterAnimationController } from 'client/character/controllers/character_animation_controller';
import type { CharacterController } from 'client/character/controllers/character_controller';
import { InputManager } from 'client/shared/utils/input_manager';
import { ClientEvents } from 'client/shared/utils/networking/events';
import wooden_sword from 'shared/features/weapons/data/medium/wooden_sword';
import type { Weapon, WeaponModel } from 'shared/features/weapons/types';
import { addHighlightToModel } from 'shared/utils/highlight';

@Controller()
export class CombatController implements OnStart {
	private readonly inputManager: InputManager;
	private equippedWeapon: Weapon | undefined;
	private equippedWeaponModel: WeaponModel | undefined;
	private isAttacking: boolean = false;

	// Hitbox attributes
	private isHitboxActive: boolean = false;
	private hitboxConnection: RBXScriptConnection | undefined;

	// Combo attributes
	private comboIndex: number = 0;

	constructor(
		private characterController: CharacterController,
		private characterAnimationController: CharacterAnimationController,
	) {
		this.inputManager = new InputManager();
		this.equippedWeapon = undefined;
		this.equippedWeaponModel = undefined;
	}

	private enableWeaponHitbox(): void {
		if (this.isHitboxActive) return;

		const hits = new Set<Model>();

		this.hitboxConnection = RunService.RenderStepped.Connect((dt) => {
			if (!this.equippedWeaponModel) return;
			const character = this.characterController.getCharacter();

			// for each attachment in the weapon's hitbox folder, draw a sphere and detect parts inside of that sphere
			for (const attachment of this.equippedWeaponModel.Handle.Hitboxes.GetChildren()) {
				if (attachment.IsA('Attachment')) {
					const overlapParams = new OverlapParams();
					overlapParams.FilterDescendantsInstances = character ? [character] : [];
					overlapParams.FilterType = Enum.RaycastFilterType.Exclude;
					const parts = Workspace.GetPartBoundsInRadius(attachment.WorldPosition, 2, overlapParams);

					for (const part of parts) {
						const model = part.FindFirstAncestorOfClass('Model');
						if (model && model.FindFirstChild('Humanoid')) {
							const humanoid = model.FindFirstChild('Humanoid') as Humanoid;

							if (!hits.has(model)) {
								hits.add(model);
								ClientEvents.hitHumanoid.fire(humanoid);

								const highlight = addHighlightToModel(model);
								task.delay(0.085, () => highlight.Destroy());
							}
						}
					}
				}
			}
		});

		this.isHitboxActive = true;
	}

	private disableWeaponHitbox(): void {
		if (!this.isHitboxActive) return;
		if (this.hitboxConnection) this.hitboxConnection.Disconnect();

		this.isHitboxActive = false;
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
		const handleGrip = handle.RightGripAttachment;

		this.characterController.mountPartToRightHand(handle, handleGrip.CFrame);
		this.equippedWeapon = weapon;
		this.equippedWeaponModel = clonedWeapon;
	}

	public handleAttack(): void {
		if (this.isAttacking) return;
		if (!this.equippedWeapon) return;

		const character = this.characterController.getCharacter();

		if (!character) {
			warn("[CombatController]: Couldn't find character");
			return;
		}

		const ATTACK_ANIMATIONS = [
			'rbxassetid://82296932537283', // Slash 1
			'rbxassetid://103056715653246', // Slash 2
		];

		if (this.comboIndex >= ATTACK_ANIMATIONS.size()) {
			this.comboIndex = 0;
		}

		const track = this.characterAnimationController.loadAnimation(ATTACK_ANIMATIONS[this.comboIndex]);
		this.comboIndex++;

		if (track) {
			this.isAttacking = true;
			track.Play();

			track.KeyframeReached.Connect((keyframe) => {
				if (keyframe === 'Hit') {
					this.enableWeaponHitbox();
				}
			});

			track.Ended.Connect(() => {
				this.isAttacking = false;
				this.disableWeaponHitbox();
				track.Destroy();
			});
		} else {
			warn("[CombatController]: Animation track couldn't be played");
		}
	}
}
