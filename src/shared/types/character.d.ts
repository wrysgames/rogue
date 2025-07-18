export interface AnimateScript extends LocalScript {
	walk: StringValue & {
		WalkAnim: Animation;
	};
	run: StringValue & {
		RunAnim: Animation;
	};
	idle: StringValue & {
		Animation1: Animation;
		Animation2: Animation;
	};
	jump: StringValue & {
		JumpAnim: Animation;
	};
	fall: StringValue & {
		FallAnim: Animation;
	};
}

export interface Character extends Model {
	Humanoid: Humanoid & {
		Animator: Animator;
	};
	RightHand: BasePart & {
		RightGripAttachment: Attachment;
	};
	LeftHand: BasePart;
	HumanoidRootPart: BasePart;
	Animate: AnimateScript;
}
