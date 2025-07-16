import { Controller, OnStart } from "@flamework/core";
import { CharacterController } from "./character_controller";
import { FALL_ANIMATION_ID, IDLE_ANIMATION_ID, JUMP_ANIMATION_ID, WALK_ANIMATION_ID } from "../constants/animation";

@Controller()
export class CharacterAnimationController implements OnStart {
    constructor(private characterController: CharacterController) {}

    private getAnimateScript() {
        return this.characterController.getCharacter()?.Animate;
    }

    public onStart(): void {
        this.setWalkAnimation(WALK_ANIMATION_ID);
        this.setRunAnimation(WALK_ANIMATION_ID);
        this.setIdleAnimation(IDLE_ANIMATION_ID);
        this.setFallAnimation(FALL_ANIMATION_ID);
        this.setJumpAnimation(JUMP_ANIMATION_ID);
        print("Core animations initialized");
    }

    public setRunAnimation(animationId: string) {
        const animateScript = this.getAnimateScript();
        if (animateScript) {
            animateScript.run.RunAnim.AnimationId = animationId;
        }
    }

    public setWalkAnimation(animationId: string) {
        const animateScript = this.getAnimateScript();
        if (animateScript) {
            animateScript.walk.WalkAnim.AnimationId = animationId;
        }
    }

    public setJumpAnimation(animationId: string) {
        const animateScript = this.getAnimateScript();
        if (animateScript) {
            animateScript.jump.JumpAnim.AnimationId = animationId;
        }
    }

    public setFallAnimation(animationId: string) {
        const animateScript = this.getAnimateScript();
        if (animateScript) {
            animateScript.fall.FallAnim.AnimationId = animationId;
        }
    }

    public setIdleAnimation(animationId: string) {
        const animateScript = this.getAnimateScript();
        if (animateScript) {
            animateScript.idle.Animation1.AnimationId = animationId;
            animateScript.idle.Animation2.AnimationId = animationId;
        }
    }
}