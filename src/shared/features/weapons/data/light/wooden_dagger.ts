import { HEAVY_WEAPON_WEIGHT } from "shared/features/weapons/constants/weights";
import type { Weapon } from "shared/features/weapons/types";

export = {
    id: "wooden_dagger",
    name: "Wooden Dagger",
    weaponType: "light",
    upgrades: [
        {
            damage: 9.0,
            knockback: 3.0,
            weight: HEAVY_WEAPON_WEIGHT,
            critRate: 0.05,
        },
        {
            damage: 18.0,
            knockback: 3.0,
            weight: HEAVY_WEAPON_WEIGHT,
            critRate: 0.05,
        },
    ],
} satisfies Weapon;