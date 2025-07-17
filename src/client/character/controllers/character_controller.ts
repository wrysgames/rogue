import { Controller, type OnStart } from '@flamework/core';
import { Players } from '@rbxts/services';
import { getClientCharacter } from 'client/shared/utils/get_character';
import type { Character } from 'shared/types/character';
import { Memoizer } from 'shared/utils/memoizer';

@Controller()
export class CharacterController implements OnStart {
	private readonly characterMemoizer: Memoizer<Character | undefined>;
	private readonly connections: RBXScriptConnection[];
	private readonly onCharacterAddedActions: ((character: Character) => void)[];

	constructor() {
		this.characterMemoizer = new Memoizer<Character | undefined>(() => getClientCharacter());
		this.connections = [];
		this.onCharacterAddedActions = [];
	}

	public onStart(): void {
		this.connections.push(
			Players.LocalPlayer.CharacterAdded.Connect((character) => {
				this.characterMemoizer.clear();
				this.onCharacterAddedActions.forEach((action) => action(character as Character));
			}),
		);
		print('Character memoization initialized');
	}

	public addCharacterAddedCallback(action: (character: Character) => void): void {
		// Prevent multiple references of the same function being added to the array
		if (!this.onCharacterAddedActions.includes(action)) {
			this.onCharacterAddedActions.push(action);
		}
	}

	public getCharacter(): Character | undefined {
		return this.characterMemoizer.get();
	}

	public mountPartToRightHand(part: BasePart, cframe?: CFrame) {
		const character = this.characterMemoizer.get();

		if (!character) {
			return undefined;
		}

		const rightHand = character.RightHand;

		const motor = new Instance('Motor6D');
		motor.Part0 = rightHand;
		motor.Part1 = part;
		motor.Parent = rightHand;

		if (cframe) {
			motor.C0 = cframe;
		}
	}
}
