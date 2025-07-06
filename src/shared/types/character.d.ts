export interface Character extends Model {
    Humanoid: Humanoid & {
        Animator: Animator;
    };
    RightHand: BasePart;
    LeftHand: BasePart;
    HumanoidRootPart: BasePart;
    Animate: LocalScript & {
        walk: StringValue & {
            WalkAnim: Animation;
        }
    };
}