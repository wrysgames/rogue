export type WeaponArchetype = 'light' | 'medium' | 'heavy';
export type WeaponVisualType = 'scythe' | 'sword' | 'axe' | 'dagger';

export type WeaponTag =
	| 'Slashing'
	| 'Pierching'
	| 'Blunt'
	| 'Multihit'
	| 'Cleaving'
	| 'HeavyImpact'
	| 'BackstabCrit'
	| 'ComboChain';

export interface WeaponStats {
	damage: number;
	critRate: number; // 0.0–1.0
	knockback: number;
	attackSpeed?: number; // hits/sec or time between swings
}

export interface WeaponUpgrade {
	stats: Partial<WeaponStats>;
	description?: string;
}

export interface Weapon {
	id: string;
	name: string;
	visualType?: WeaponVisualType;
	tags: WeaponTag[];
	weaponType: WeaponArchetype;
	baseStats: WeaponStats;

	upgrades?: WeaponUpgrade[];

	model?: WeaponModel;

	obtainable?: {
		chests?: boolean;
		drops?: boolean;
	};
}

export interface WeaponModel extends Model {
	Handle: BasePart & {
		Hitboxes: Folder;
		RightGripAttachment: Attachment;
	};
}

export interface WeaponAnimationSet {
	idle: string;
	jump: string;
	walk: string;
	fall: string;
}
