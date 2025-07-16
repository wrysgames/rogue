export type WeaponArchetype = 'light' | 'medium' | 'heavy';

export interface WeaponStats {
	damage: number;
	critRate: number;
	knockback: number;
	weight?: number;
	cost?: number;
}

export interface Weapon {
	id: string;
	name: string;
	weaponType: WeaponArchetype;
	upgrades: WeaponStats[];
	model?: Model;
	obtainable?: {
		chests?: boolean;
		drops?: boolean;
	};
}
