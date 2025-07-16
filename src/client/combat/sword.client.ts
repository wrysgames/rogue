import { Players, ReplicatedStorage, RunService, SoundService, UserInputService, Workspace } from '@rbxts/services';
import { getClientCharacter } from 'client/shared/utils/get_character';
import type { Character } from 'shared/types/character';

const CHARACTER = getClientCharacter();

if (!CHARACTER) {
	throw "COULDN'T FIND CHARACTER";
}
const ANIMATOR = CHARACTER.Humanoid.Animator;
const PLAYER = Players.GetPlayerFromCharacter(CHARACTER);

if (!PLAYER) throw "COULDN'T FIND PLAYER";

const ATTACK_ANIMATIONS = [
	'rbxassetid://82296932537283', // Slash 1
	'rbxassetid://86722564801489', // Slash 2
];

const loadedAnimations = ATTACK_ANIMATIONS.map((id) => {
	const anim = new Instance('Animation');
	anim.AnimationId = id;
	return ANIMATOR.LoadAnimation(anim);
});

let comboIndex = 0;
const comboResetTime = 0.7;
let comboResetTask: thread | undefined;

let isAttacking: boolean = false;
let canContinueCombo: boolean = false;

let isInComboCooldown = false;
const comboCooldownDuration = 0.3; // time after the 2nd attack to attack again

function lockCombo(duration: number) {
	isInComboCooldown = true;
	task.delay(duration, () => {
		isInComboCooldown = false;
		comboIndex = 0;
	});
}

function applyKnockback(target: Model, fromPosition: Vector3, force: number = 50, upwardForce: number = 10) {
	const hrp = target.FindFirstChild('HumanoidRootPart') as BasePart;
	if (!hrp) return;

	const direction = hrp.Position.sub(fromPosition).Unit;
	hrp.ApplyImpulse(direction.mul(force).add(Vector3.yAxis.mul(upwardForce)).mul(hrp.AssemblyMass));
	print('KNOCKED BACK');
}

function playSound(soundId: string, options?: { volume?: number; pitch?: number }) {
	const { volume, pitch } = options ?? {};
	const sound = new Instance('Sound');
	sound.Parent = SoundService;
	sound.SoundId = soundId;
	sound.Volume = volume ?? 1;
	sound.PlaybackSpeed = pitch ?? 1;
	sound.Play();
	sound.Ended.Connect(() => sound.Destroy());
}

function spawnHitBurst(position: Vector3) {
	const burst = new Instance('Part');
	burst.Size = new Vector3(0.2, 0.2, 0.2);
	burst.Anchored = true;
	burst.CanCollide = false;
	burst.Position = position;
	burst.Transparency = 1;
	burst.Parent = Workspace;
	burst.CFrame = CFrame.lookAt(position, position.add(Workspace.CurrentCamera!.CFrame.LookVector));

	const emitter = new Instance('ParticleEmitter');
	emitter.Texture = 'rbxassetid://6508928742';
	emitter.Speed = new NumberRange(8);
	emitter.Lifetime = new NumberRange(0.2);
	emitter.Rate = 0;
	emitter.EmissionDirection = Enum.NormalId.Front;
	emitter.LightEmission = 0.5;
	emitter.Size = new NumberSequence(0.5);
	emitter.Color = new ColorSequence(Color3.fromRGB(255, 255, 255));
	emitter.Parent = burst;

	emitter.Emit(5);
	task.delay(0.3, () => burst.Destroy());
}

function hitPause(character: Model, duration: number) {
	const humanoid = character.FindFirstChild('Humanoid') as Humanoid | undefined;
	const root = character.FindFirstChild('HumanoidRootPart') as BasePart | undefined;
	const animator = humanoid?.FindFirstChildWhichIsA('Animator');
	if (!(humanoid && root && animator)) return;

	for (const track of animator.GetPlayingAnimationTracks()) track.AdjustSpeed(0);
	const tmpVelocity = root.AssemblyLinearVelocity;
	root.AssemblyLinearVelocity = Vector3.zero;
	task.wait(duration);
	for (const track of animator.GetPlayingAnimationTracks()) track.AdjustSpeed(1);
	root.AssemblyLinearVelocity = tmpVelocity;
}

function highlightHitEnemy(npcModel: Model) {
	let highlight = npcModel.FindFirstChildOfClass('Highlight') as Highlight | undefined;
	if (!highlight) {
		highlight = new Instance('Highlight');
		highlight.Parent = npcModel;
	}
	highlight.FillColor = Color3.fromRGB(255, 255, 255);
	highlight.OutlineColor = Color3.fromRGB(255, 255, 255);
	highlight.FillTransparency = 0.3;
	highlight.OutlineTransparency = 0;
	task.delay(0.15, () => highlight?.Destroy());
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
					const model = part.FindFirstAncestorOfClass('Model');
					if (model && model.FindFirstChild('Humanoid') && !alreadyHitNpcs.has(model)) {
						alreadyHitNpcs.set(model, true);
						hits.add(model);
					}
				}

				if (result) {
					const model = result.Instance.FindFirstAncestorOfClass('Model');
					if (model && model.FindFirstChild('Humanoid') && !alreadyHitNpcs.has(model)) {
						alreadyHitNpcs.set(model, true);
						hits.add(model);
					}
				}

				if (!hasHit && hits.size() > 0) {
					hasHit = true;
				}

				for (const model of hits) {
					highlightHitEnemy(model);
					playSound('rbxassetid://6216173737');
					hitPause(character, 0.15);

					let contactPosition = currPos;
					if (result) {
						contactPosition = result.Position;
					}

					spawnHitBurst(contactPosition);
					applyKnockback(model, contactPosition, 80, 20);
				}

				// delete the ray visualizations
			}
			lastTipPositions.set(attachment, currPos);
		}
	});

	return renderConnection;
}

function startCombo(character: Character, attachments: Attachment[], trail?: Trail) {
	if (isInComboCooldown || isAttacking || comboIndex >= loadedAnimations.size()) return;

	isAttacking = true;
	canContinueCombo = false;

	const track = loadedAnimations[comboIndex];

	if (comboIndex === 0) {
		for (const playing of ANIMATOR.GetPlayingAnimationTracks()) playing.Stop();
	}

	track.Play();

	trail && (trail.Enabled = true);
	playSound('rbxassetid://7118966167');

	const connection = track.GetMarkerReachedSignal('Hit').Connect(() => {
		const renderConn = createHitboxRenderer(character, attachments);
		track.Stopped.Once(() => {
			isAttacking = false;

			if (canContinueCombo) {
				comboIndex++;
				startCombo(character, attachments, trail);
			} else if (comboIndex >= loadedAnimations.size() - 1) {
				lockCombo(comboCooldownDuration);
			} else {
				comboIndex = 0;
			}

			connection.Disconnect();
			renderConn.Disconnect();
			trail && (trail.Enabled = false);

			// if it was the last attack, start a cooldown
			if (comboIndex >= loadedAnimations.size()) {
				lockCombo(comboCooldownDuration);
				isInComboCooldown = true;
				task.delay(comboCooldownDuration, () => {
					isInComboCooldown = false;
				});
			}
		});
	});

	if (comboResetTask) task.cancel(comboResetTask);
	comboResetTask = task.delay(comboResetTime, () => {
		if (!isAttacking) comboIndex = 0;
	});
}

function bindInput(character: Character, attachments: Attachment[], trail?: Trail) {
	UserInputService.InputBegan.Connect((input, gameProcessed) => {
		if (!gameProcessed && input.UserInputType === Enum.UserInputType.MouseButton1) {
			if (isAttacking) {
				canContinueCombo = true;
			} else startCombo(character, attachments, trail);
		}
	});
}

// Bootstrap
const sword = ReplicatedStorage.FindFirstChild('swords')?.FindFirstChild('wooden_sword')?.Clone();
if (sword) {
	sword.Parent = CHARACTER;
	const handle = sword.FindFirstChild('Handle') as BasePart;
	const grip = handle.FindFirstChild('RightGripAttachment') as Attachment;
	const hand = CHARACTER.WaitForChild('RightHand') as BasePart;
	const weld = new Instance('Motor6D');
	weld.Name = 'SwordWeld';
	weld.Part0 = hand;
	weld.Part1 = handle;
	weld.C0 = grip.CFrame;
	weld.Parent = hand;

	const trail = handle.FindFirstChild('Trail') as Trail | undefined;
	const bladeFolder = handle.FindFirstChild('BladeHitbox') as Folder;
	const attachments = bladeFolder?.GetChildren().filter((v): v is Attachment => v.IsA('Attachment')) ?? [];

	bindInput(CHARACTER, attachments, trail);
}
