import { Players, ReplicatedStorage } from "@rbxts/services";
import { Character } from "shared/types/character";

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

    // get the character
    const character = script.Parent as Character;
    
    // create a weld
    const weld = new Instance("Motor6D");
    weld.Name = "SwordWeld";
    weld.Part0 = character.RightHand;
    weld.Part1 = handle;
    weld.C0 = new CFrame(0, -0.25, 0).mul(CFrame.Angles(0, math.rad(180), math.rad(90)));
    weld.Parent = character.RightHand;
}

const sword = initializeSword();
if (sword) {
    sword.Parent = script.Parent;
    weldSword(sword);
}
