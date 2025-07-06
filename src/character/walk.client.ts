import type { Character } from "shared/types/character"

const character = script.Parent as Character | undefined;

const WALK_ANIMATION_ID = "rbxassetid://80450264938538"; // "rbxassetid://80450264938538";

if (character) {
    const animate = character.Animate;
    animate.walk.WalkAnim.AnimationId = WALK_ANIMATION_ID;
}

