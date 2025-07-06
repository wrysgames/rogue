import { ReplicatedStorage, UserInputService } from "@rbxts/services";
import { Character } from "shared/types/character";

const SWORD_SLASH_ANIMATION_ID = "rbxassetid://109090003991256";

const swordsFolder = ReplicatedStorage.FindFirstChild("swords");

function initializeSword(): Instance | undefined {
    if (swordsFolder === undefined) {
        return error("Could not find the swords folder in ReplicatedStorage");
    }

    const woodenSword = swordsFolder.FindFirstChild("wooden_sword");

    if (woodenSword === undefined) {
        return error("Could not find the swords folder in ReplicatedStorage");
    }

    // Clone and attach the wooden sword
    const clonedSword = woodenSword.Clone();
    return clonedSword;
}

function weldSword(sword: Instance) {
    const handle = sword.FindFirstChild("Handle") as BasePart | undefined;

    if (handle === undefined) {
        return error("Handle could not be found on the sword");
    }

    const gripAttachment = handle.FindFirstChild("RightGripAttachment") as Attachment | undefined;

    if (!gripAttachment) {
        return error("Could not find an attachment");
    }

    // get the character
    const character = script.Parent as Character;
    
    // create a weld
    const weld = new Instance("Motor6D");
    weld.Name = "SwordWeld";
    weld.Part0 = character.RightHand;
    weld.Part1 = handle;
    weld.C0 = gripAttachment.CFrame;
    weld.Parent = character.RightHand;
}

function setUpInput() {
    const animation = new Instance("Animation");
    animation.AnimationId = SWORD_SLASH_ANIMATION_ID;

    const character = script.Parent as Character | undefined;

    if (character) {
        const humanoid = character.Humanoid;
        const track = humanoid.Animator.LoadAnimation(animation);

        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (!gameProcessed) {
                if (input.UserInputType === Enum.UserInputType.MouseButton1) {
                    if (!track.IsPlaying) track.Play();
                }
            }
        })
    }
}

const sword = initializeSword();
if (sword) {
    sword.Parent = script.Parent;
    weldSword(sword);

    setUpInput();
}
