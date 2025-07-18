import { WeaponModel } from '../types';

export function validateWeaponModel(weapon: Instance | undefined): WeaponModel | undefined {
	if (!weapon) {
		warn('Weapon does not exist');
		return;
	}

	if (!weapon.IsA('Model')) {
		warn('Weapon is not a model');
		return;
	}

	const handle = weapon.FindFirstChild('Handle');

	if (!handle) {
		warn('Weapon does not have a handle');
		return;
	}

	if (!handle.FindFirstChild('Hitboxes')) {
		warn('Weapon does not have hitbox attachments');
		return;
	}

	if (!handle.FindFirstChild('RightGripAttachment')?.IsA('Attachment')) {
		warn('Weapon does not have RightGripAttachment');
		return;
	}

	return weapon as WeaponModel;
}
