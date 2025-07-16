import { HEAVY_WEAPON_WEIGHT } from 'shared/features/weapons/constants/weights'
import type { Weapon } from 'shared/features/weapons/types'

export = {
	id: 'wooden_axe',
	name: 'Wooden Axe',
	weaponType: 'heavy',
	upgrades: [
		{
			damage: 19.0,
			knockback: 3.0,
			weight: HEAVY_WEAPON_WEIGHT,
			critRate: 0.1,
		},
		{
			damage: 30.0,
			knockback: 3.0,
			weight: HEAVY_WEAPON_WEIGHT,
			critRate: 0.1,
		},
	],
} satisfies Weapon
