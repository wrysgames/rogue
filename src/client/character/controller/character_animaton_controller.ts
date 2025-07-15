import { Controller } from "@flamework/core";
import { CharacterController } from "./character_controller";

@Controller()
export class CharacterAnimationController {
    constructor(private characterController: CharacterController) {}

    private getAnimateScript() {
        return this.characterController.getCharacter()?.Animate;
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