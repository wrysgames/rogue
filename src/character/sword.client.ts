import { Players, ReplicatedStorage, RunService, UserInputService, Workspace } from "@rbxts/services";
import { Character } from "shared/types/character";

const SWORD_SLASH_ANIMATION_ID = "rbxassetid://109090003991256";

const swordsFolder = ReplicatedStorage.FindFirstChild("swords");
const player = Players.LocalPlayer;

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

function weldSword(sword: Instance, character: Model) {
    const handle = sword.FindFirstChild("Handle") as BasePart | undefined;

    if (handle === undefined) {
        return error("Handle could not be found on the sword");
    }

    const gripAttachment = handle.FindFirstChild("RightGripAttachment") as Attachment | undefined;

    if (!gripAttachment) {
        return error("Could not find an attachment");
    }

    // get the character
    const rightHand = character.WaitForChild("RightHand") as BasePart;

    // create a weld
    const weld = new Instance("Motor6D");
    weld.Name = "SwordWeld";
    weld.Part0 = rightHand;
    weld.Part1 = handle;
    weld.C0 = gripAttachment.CFrame;
    weld.Parent = rightHand;
}

function createRayVisual(startPos: Vector3, endPos: Vector3, direction: Vector3) {
    const rayPart = new Instance("Part");
    rayPart.Anchored = true;
    rayPart.CanCollide = false;
    rayPart.Color = Color3.fromRGB(255, 0, 0);
    rayPart.Transparency = 0.5;
    rayPart.Material = Enum.Material.Neon;
    rayPart.Size = new Vector3(0.1, 0.1, direction.Magnitude);
    rayPart.CFrame = new CFrame(startPos, endPos).mul(new CFrame(0, 0, -direction.Magnitude / 2));
    rayPart.Parent = Workspace;
    return rayPart;
}

function setUpInput(character: Character, sword: Instance) {
    const animation = new Instance("Animation");
    animation.AnimationId = SWORD_SLASH_ANIMATION_ID;

    const humanoid = character.Humanoid;
    const track = humanoid.Animator.LoadAnimation(animation);

    UserInputService.InputBegan.Connect((input, gameProcessed) => {
        if (!gameProcessed) {
            if (input.UserInputType === Enum.UserInputType.MouseButton1) {
                if (!track.IsPlaying) {
                    //print("Registered a sword slash");

                    track.Play();

                    const handle = sword.FindFirstChild("Handle") as BasePart | undefined;

                    if (!handle) {
                        return error("Could not find handle for the sword");
                    }

                    const trail = handle.FindFirstChild("Trail") as Trail | undefined;
                    const tipAttachment = handle.FindFirstChild("Tip") as Attachment | undefined;
                    const gripAttachment = handle.FindFirstChild("RightGripAttachment") as Attachment | undefined;

                    const bladeHitboxFolder = handle.FindFirstChild("BladeHitbox") as Folder | undefined;

                    if (!bladeHitboxFolder) {
                        return;
                    }

                    //print("Found Tip Attachment", tipAttachment);

                    if (!tipAttachment || tipAttachment.ClassName !== "Attachment") {
                        return;
                    }

                    if (!gripAttachment || gripAttachment.ClassName !== "Attachment") {
                        return;
                    }

                    if (trail) {
                        trail.Enabled = true;
                    }

                    const lastTipPositions: Map<Attachment, Vector3 | undefined> = new Map();

                    for (const attachment of bladeHitboxFolder.GetChildren()) {
                        if (attachment.IsA("Attachment")) {
                            lastTipPositions.set(attachment, attachment.WorldPosition);
                        }
                    }

                    print(lastTipPositions.size());

                    const renderStep = RunService.RenderStepped.Connect((dt) => {
                        const tipPos = tipAttachment.WorldPosition;
                        const hiltPos = gripAttachment.WorldPosition;

                        // Draw a ray from the previous tip position to the current tip position for a continuous trail
                        for (const attachments of lastTipPositions) {
                            const attachment = attachments[0];
                            const lastAttachmentPos = attachments[1];

                            const currAttachmentPos = attachment.WorldPosition;

                            if (lastAttachmentPos) {
                                const direction = currAttachmentPos?.sub(lastAttachmentPos);
                                if (direction.Magnitude > 0.01) {
                                    const rayPart = createRayVisual(lastAttachmentPos, currAttachmentPos, direction);
                                    task.delay(0.5, () => rayPart.Destroy());
                                }
                            }

                            lastTipPositions.set(attachment, currAttachmentPos);
                            
                        }

                        // Raycast from hilt to tip (for hit detection)
                        const direction = tipPos.sub(hiltPos);
                        const raycastParams = new RaycastParams();
                        raycastParams.FilterDescendantsInstances = [character];
                        raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
                        const result = Workspace.Raycast(hiltPos, direction, raycastParams);

                        // Visualize the hilt-to-tip ray (optional, comment out if not needed)
                        // const rayPart = createRayVisual(hiltPos, tipPos, direction);
                        // task.delay(0.5, () => rayPart.Destroy());

                        if (!result) {
                            return;
                        }
                        if (result.Instance.Parent?.IsA("Model")) {
                            if (result.Instance.Parent.FindFirstChild("Humanoid")) {
                                print("HIT A HUMANOID")
                            }
                        }
                    })

                    track.Stopped.Connect(() => {
                        renderStep.Disconnect();
                        if (trail) {
                            trail.Enabled = false;
                        }
                    })
                }
            }
        }
    })
}

const sword = initializeSword();
const character = script.Parent as Character;

if (sword) {
    sword.Parent = script.Parent;
    weldSword(sword, character);
    setUpInput(character, sword);
}

