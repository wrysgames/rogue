import { ReplicatedStorage } from '@rbxts/services';
import type { Weapon } from 'shared/features/weapons/types';
import { validateWeaponModel } from '../../utils/validate_weapon';

export = {
	id: 'wooden_sword',
	name: 'Wooden Sword',
	weaponType: 'light',
	visualType: 'sword',
	tags: ['Slashing'],
	baseStats: {
		damage: 15,
		critRate: 0.25,
		knockback: 2,
		attackSpeed: 1.5,
	},
	upgrades: [
		{ stats: { damage: 5 }, description: '+5 base damage' },
		{ stats: { critRate: 0.1 }, description: '+10% crit chance' },
	],
	obtainable: {
		chests: true,
		drops: true,
	},
	model: validateWeaponModel(ReplicatedStorage.weapons.medium.FindFirstChild('wooden_sword')),
} satisfies Weapon;
