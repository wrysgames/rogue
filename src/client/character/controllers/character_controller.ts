import { Controller, type OnStart } from '@flamework/core';
import { Players } from '@rbxts/services';
import { getClientCharacter } from 'client/shared/utils/get_character';
import type { Character } from 'shared/types/character';
import { Memoizer } from 'shared/utils/memoizer';

@Controller()
export class CharacterController implements OnStart {
	private characterMemoizer: Memoizer<Character | undefined>;
	private connections: RBXScriptConnection[];

	constructor() {
		this.characterMemoizer = new Memoizer<Character | undefined>(() => getClientCharacter());
		this.connections = [];
	}

	public onStart(): void {
		this.connections.push(Players.LocalPlayer.CharacterAdded.Connect(() => this.characterMemoizer.clear()));
		print('Character memoization initialized');
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
