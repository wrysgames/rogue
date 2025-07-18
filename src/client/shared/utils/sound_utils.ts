export function playSound(soundId: string, volume: number = 1): Sound {
	const sound = new Instance('Sound');
	sound.SoundId = soundId;
	sound.Volume = volume;
	sound.Play();
	sound.Ended.Connect(() => {
		sound.Destroy();
	});
	return sound;
}
