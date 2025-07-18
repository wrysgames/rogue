import { Controller, OnStart } from '@flamework/core';
import { FALL_ANIMATION_ID, IDLE_ANIMATION_ID, JUMP_ANIMATION_ID, WALK_ANIMATION_ID } from '../constants/animation';
import { CharacterController } from './character_controller';
import { AnimateScript } from 'shared/types/character';

@Controller()
export class CharacterAnimationController implements OnStart {
	constructor(private characterController: CharacterController) {}

	private getAnimateScript(): AnimateScript | undefined {
		return this.characterController.getCharacter()?.WaitForChild("Animate") as AnimateScript | undefined;
	}

	private getAnimator(): Animator | undefined {
		return this.characterController.getCharacter()?.Humanoid.Animator;
	}

	public onStart(): void {
		this.setWalkAnimation(WALK_ANIMATION_ID);
		this.setRunAnimation(WALK_ANIMATION_ID);
		this.setIdleAnimation(IDLE_ANIMATION_ID);
		this.setFallAnimation(FALL_ANIMATION_ID);
		this.setJumpAnimation(JUMP_ANIMATION_ID);
		print('Core animations initialized');
	}

	public loadAnimation(
		animationId: string,
		options?: {
			looped?: boolean;
			playbackSpeed?: number;
		},
	): AnimationTrack | undefined {
		const animator = this.getAnimator();
		if (animator) {
			const animation = new Instance('Animation');
			animation.AnimationId = animationId;
			const track = animator.LoadAnimation(animation);

			track.Looped = options?.looped || false;
			track.AdjustSpeed(options?.playbackSpeed || 1);

			return track;
		}

		return undefined;
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
