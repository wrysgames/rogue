import { getClientCharacter } from "client/shared/utils/get_character";

const character = getClientCharacter();

const WALK_ANIMATION_ID = "rbxassetid://126125427113126"; // "rbxassetid://80450264938538";
const IDLE_ANIMATION_ID = "rbxassetid://112034533114840";
const JUMP_ANIMATION_ID = "rbxassetid://136587198695531";
const FALL_ANIMATION_ID = "rbxassetid://120400965590536";

if (character) {
    print("[ANIMATION] Character found")
    const animate = character.Animate;
    animate.run.RunAnim.AnimationId = WALK_ANIMATION_ID;

    animate.idle.Animation1.AnimationId = IDLE_ANIMATION_ID;
    animate.idle.Animation2.AnimationId = IDLE_ANIMATION_ID;

    animate.jump.JumpAnim.AnimationId = JUMP_ANIMATION_ID;
    animate.fall.FallAnim.AnimationId = FALL_ANIMATION_ID;
}
else {
    print("[ANIMATION] Character not found");
}