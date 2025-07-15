import { MEDIUM_WEAPON_WEIGHT } from "shared/features/weapons/constants/weights";
import type { Weapon } from "shared/types/weapon";

export = {
    id: "wooden_sword",
    name: "Wooden Sword",
    weaponType: "medium",
    upgrades: [
        {
            damage: 14.0,
            knockback: 1.0,
            weight: MEDIUM_WEAPON_WEIGHT,
            critRate: 0.05,
        },
        {
            damage: 22.0,
            knockback: 1.0,
            weight: MEDIUM_WEAPON_WEIGHT,
            critRate: 0.05,
        },
    ],
} satisfies Weapon;