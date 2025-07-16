import { Players } from '@rbxts/services';
import { Character } from 'shared/types/character';

export function getClientCharacter(): Character | undefined {
	const player = Players.LocalPlayer;
	return (player.Character || player.CharacterAdded.Wait()[0]) as Character | undefined;
}
