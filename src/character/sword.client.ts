import { Players, ReplicatedStorage, RunService, SoundService, UserInputService, Workspace } from "@rbxts/services";
import type { Character } from "shared/types/character";

const CHARACTER = script.Parent as Character;
const ANIMATOR = CHARACTER.Humanoid.Animator;
const PLAYER = Players.GetPlayerFromCharacter(CHARACTER);

if (!PLAYER) error("COULDN'T FIND PLAYER");

const ATTACK_ANIMATIONS = [
	"rbxassetid://82296932537283", // Slash 1
	"rbxassetid://86722564801489", // Slash 2
];

const loadedAnimations = ATTACK_ANIMATIONS.map((id) => {
	const anim = new Instance("Animation");
	anim.AnimationId = id;
	return ANIMATOR.LoadAnimation(anim);
});

let comboIndex = 0;
const comboResetTime = 0.7;
let comboResetTask: thread | undefined;

let isInComboCooldown = false;
const comboCooldownDuration = 0.6; // time after the 2nd attack to attack again

function lockCombo(duration: number) {
	isInComboCooldown = true;
	task.delay(duration, () => {
		isInComboCooldown = false;
		comboIndex = 0;
	});
}

function playSound(soundId: string, volume = 0.5) {
	const sound = new Instance("Sound");
	sound.Parent = SoundService;
	sound.SoundId = soundId;
	sound.Volume = volume;
	sound.Play();
	sound.Ended.Connect(() => sound.Destroy());
}

function hitPause(character: Model, duration: number) {
	const humanoid = character.FindFirstChild("Humanoid") as Humanoid | undefined;
	const root = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	const animator = humanoid?.FindFirstChildWhichIsA("Animator");
	if (!(humanoid && root && animator)) return;

	for (const track of animator.GetPlayingAnimationTracks()) track.AdjustSpeed(0);
	const tmpVelocity = root.AssemblyLinearVelocity;
	root.AssemblyLinearVelocity = Vector3.zero;
	task.wait(duration);
	for (const track of animator.GetPlayingAnimationTracks()) track.AdjustSpeed(1);
	root.AssemblyLinearVelocity = tmpVelocity;
}

function highlightHitEnemy(npcModel: Model) {
	let highlight = npcModel.FindFirstChildOfClass("Highlight") as Highlight | undefined;
	if (!highlight) {
		highlight = new Instance("Highlight");
		highlight.Parent = npcModel;
	}
	highlight.FillColor = Color3.fromRGB(255, 255, 255);
	highlight.OutlineColor = Color3.fromRGB(255, 255, 255);
	highlight.FillTransparency = 0.3;
	highlight.OutlineTransparency = 0;
	task.delay(0.15, () => highlight?.Destroy());
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

function createHitboxRenderer(character: Character, attachments: Attachment[]) {
	const lastTipPositions = new Map<Attachment, Vector3>();
	attachments.forEach((att) => lastTipPositions.set(att, att.WorldPosition));

	const alreadyHitNpcs = new Map<Instance, boolean>();

    let hasHit = false;

	const renderConnection = RunService.RenderStepped.Connect(() => {
		for (const [attachment, lastPos] of lastTipPositions) {
			const currPos = attachment.WorldPosition;
			const direction = currPos.sub(lastPos);

			if (direction.Magnitude > 0.01) {
				const rayPart = createRayVisual(lastPos, currPos, direction);

				const raycastParams = new RaycastParams();
				raycastParams.FilterDescendantsInstances = [character];
				raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
				const result = Workspace.Raycast(lastPos, direction, raycastParams);

				const overlapParams = new OverlapParams();
				overlapParams.FilterDescendantsInstances = [character];
				overlapParams.FilterType = Enum.RaycastFilterType.Exclude;
				const parts = Workspace.GetPartBoundsInRadius(currPos, 2, overlapParams);

				const hits = new Set<Model>();

				for (const part of parts) {
					const model = part.FindFirstAncestorOfClass("Model");
					if (model && model.FindFirstChild("Humanoid") && !alreadyHitNpcs.has(model)) {
						alreadyHitNpcs.set(model, true);
						hits.add(model);
					}
				}

				if (result) {
					const model = result.Instance.FindFirstAncestorOfClass("Model");
					if (model && model.FindFirstChild("Humanoid") && !alreadyHitNpcs.has(model)) {
						alreadyHitNpcs.set(model, true);
						hits.add(model);
					}
				}

                if (!hasHit && hits.size() > 0) {
                    hasHit = true;
                    lockCombo(0.5); // Lock once per attack
                }

				for (const model of hits) {
					highlightHitEnemy(model);
					playSound("rbxassetid://6216173737", 1);
					hitPause(character, 0.07);
				}

                // delete the ray visualizations
                task.delay(0.1, () => rayPart.Destroy());
			}
			lastTipPositions.set(attachment, currPos);
		}
	});

	return renderConnection;
}

function startCombo(character: Character, attachments: Attachment[], trail?: Trail) {
    if (isInComboCooldown) return;

	if (comboIndex >= loadedAnimations.size()) {
        comboIndex = 0;
        return;
    }

	const track = loadedAnimations[comboIndex];
	comboIndex++;

    if (comboIndex === 0) {
        for (const playing of ANIMATOR.GetPlayingAnimationTracks()) playing.Stop();
    }
	
	track.Play();

	trail && (trail.Enabled = true);
	playSound("rbxassetid://7118966167");

	const connection = track.GetMarkerReachedSignal("Hit").Connect(() => {
		const renderConn = createHitboxRenderer(character, attachments);
		track.Stopped.Connect(() => {
			connection.Disconnect();
			renderConn.Disconnect();
			trail && (trail.Enabled = false);

            // if it was the last attack, start a cooldown
            if (comboIndex >= loadedAnimations.size()) {
                isInComboCooldown = true;
                task.delay(comboCooldownDuration, () => {
                    isInComboCooldown = false;
                })
            }
		});
	});

	if (comboResetTask) task.cancel(comboResetTask);
	comboResetTask = task.delay(comboResetTime, () => comboIndex = 0);
}

function bindInput(character: Character, attachments: Attachment[], trail?: Trail) {
	UserInputService.InputBegan.Connect((input, gameProcessed) => {
		if (!gameProcessed && input.UserInputType === Enum.UserInputType.MouseButton1) {
			startCombo(character, attachments, trail);
		}
	});
}

// Bootstrap
const sword = ReplicatedStorage.FindFirstChild("swords")?.FindFirstChild("wooden_sword")?.Clone();
if (sword) {
	sword.Parent = CHARACTER;
	const handle = sword.FindFirstChild("Handle") as BasePart;
	const grip = handle.FindFirstChild("RightGripAttachment") as Attachment;
	const hand = CHARACTER.WaitForChild("RightHand") as BasePart;
	const weld = new Instance("Motor6D");
	weld.Name = "SwordWeld";
	weld.Part0 = hand;
	weld.Part1 = handle;
	weld.C0 = grip.CFrame;
	weld.Parent = hand;

	const trail = handle.FindFirstChild("Trail") as Trail | undefined;
	const bladeFolder = handle.FindFirstChild("BladeHitbox") as Folder;
	const attachments = bladeFolder?.GetChildren().filter((v): v is Attachment => v.IsA("Attachment")) ?? [];

	bindInput(CHARACTER, attachments, trail);
}
