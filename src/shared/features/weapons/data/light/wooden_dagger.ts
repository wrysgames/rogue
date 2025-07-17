import type { Weapon } from 'shared/features/weapons/types';

export = {
	id: 'dagger_venom',
	name: 'Dagger of Venom',
	weaponType: 'light',
	visualType: 'dagger',
	tags: ['Slashing', 'BackstabCrit', 'ComboChain'],
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
} satisfies Weapon;
