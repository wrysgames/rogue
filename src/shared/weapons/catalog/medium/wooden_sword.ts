import { MEDIUM_WEAPON_WEIGHT } from "shared/constants/weapon_weights";
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
            critRate: 5.00,
        }
    ],
} satisfies Weapon;