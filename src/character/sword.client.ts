import { Players, ReplicatedStorage, RunService, SoundService, UserInputService, Workspace } from "@rbxts/services";
import { Character } from "shared/types/character";

const SWORD_SLASH_ANIMATION_ID = "rbxassetid://112018511458880";

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

function playSound(soundId: string, volume: number = 0.5) {
    const sound = new Instance("Sound");
    sound.Parent = SoundService;
    sound.SoundId = soundId;
    sound.Play()
    sound.Ended.Connect(() => {
        sound.Destroy();
    })
}

function setUpInput(character: Character, sword: Instance) {
    const animation = new Instance("Animation");
    animation.AnimationId = SWORD_SLASH_ANIMATION_ID;

    const humanoid = character.Humanoid;
    const track = humanoid.Animator.LoadAnimation(animation);

    const lastTipPositions: Map<Attachment, Vector3 | undefined> = new Map();
    const handle = sword.FindFirstChild("Handle") as BasePart | undefined;

    if (!handle) {
        return error("Could not find handle for the sword");
    }

    const trail = handle.FindFirstChild("Trail") as Trail | undefined;

    const bladeHitboxFolder = handle.FindFirstChild("BladeHitbox") as Folder | undefined;

    if (!bladeHitboxFolder) {
        return;
    }

    for (const attachment of bladeHitboxFolder.GetChildren()) {
        if (attachment.IsA("Attachment")) {
            lastTipPositions.set(attachment, attachment.WorldPosition);
        }
    }

    print(bladeHitboxFolder.GetChildren())

    let lastSlashTime = 0;
    const SLASH_COOLDOWN = 1.5; // seconds

    UserInputService.InputBegan.Connect((input, gameProcessed) => {
        if (!gameProcessed) {
            if (input.UserInputType === Enum.UserInputType.MouseButton1) {
                const now = tick();
                if (now - lastSlashTime < SLASH_COOLDOWN) {
                    return;
                }
                if (!track.IsPlaying) {
                    lastSlashTime = now;
                    //print("Registered a sword slash");

                    track.Play();

                    if (trail) {
                        trail.Enabled = true;
                    }

                    for (const [attachment] of lastTipPositions) {
                        lastTipPositions.set(attachment, attachment.WorldPosition);
                    }

                    playSound("rbxassetid://7118966167"); // Sword slash
                    
                    const renderStep = RunService.RenderStepped.Connect((dt) => {
                        // Draw a ray from the previous tip position to the current tip position for a continuous trail
                        for (const attachments of lastTipPositions) {
                            const attachment = attachments[0];
                            const lastAttachmentPos = attachments[1];

                            const currAttachmentPos = attachment.WorldPosition;

                            if (lastAttachmentPos) {
                                const direction = currAttachmentPos?.sub(lastAttachmentPos);
                                if (direction.Magnitude > 0.01) {
                                    // Visualize the ray
                                    const rayPart = createRayVisual(lastAttachmentPos, currAttachmentPos, direction);
                                    task.delay(0.5, () => rayPart.Destroy());

                                    // Cast a ray for hit detection
                                    const raycastParams = new RaycastParams();
                                    raycastParams.FilterDescendantsInstances = [character];
                                    raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
                                    const result = Workspace.Raycast(lastAttachmentPos, direction, raycastParams);
                                    if (result && result.Instance.Parent?.IsA("Model")) {
                                        const npcModel = result.Instance.Parent;
                                        const humanoid = npcModel.FindFirstChild("Humanoid");
                                        if (humanoid) {
                                            print("HIT A HUMANOID (blade segment)");
                                            // Make NPC glow white for a split second using Highlight
                                            let highlight = npcModel.FindFirstChildOfClass("Highlight") as Highlight | undefined;
                                            if (!highlight) {
                                                highlight = new Instance("Highlight");
                                                highlight.Parent = npcModel;
                                            }
                                            highlight.FillColor = Color3.fromRGB(255, 255, 255);
                                            highlight.OutlineColor = Color3.fromRGB(255, 255, 255);
                                            highlight.FillTransparency = 0.3;
                                            highlight.OutlineTransparency = 0;
                                            task.delay(0.15, () => {
                                                if (highlight) {
                                                    highlight.Destroy();
                                                }
                                            });

                                            // Hit sound 
                                            playSound("rbxassetid://6216173737", 1);
                                        }
                                    }
                                }
                            }

                            lastTipPositions.set(attachment, currAttachmentPos);
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

