import { Character } from "shared/types/character";

export function getCharacter(): Character | undefined {
    const player = script.FindFirstAncestorWhichIsA("Player");
    return player?.Character as Character | undefined;
}