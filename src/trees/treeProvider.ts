import balanceJson from "./Druid/Balance.json";
import feralJson from "./Druid/Feral.json";
import druidRestorationJson from "./Druid/Restoration.json";
import arcaneJson from "./Mage/Arcane.json";
import fireJson from "./Mage/Fire.json";
import frostJson from "./Mage/Frost.json";
import beastMasteryJson from "./Hunter/Beast Mastery.json";
import marksmanshipJson from "./Hunter/Marksmanship.json";
import survivalJson from "./Hunter/Survival.json";
import paladinHolyJson from "./Paladin/Holy.json";
import paladinProtectionJson from "./Paladin/Protection.json";
import retributionJson from "./Paladin/Retribution.json";
import disciplineJson from "./Priest/Discipline.json";
import shadowJson from "./Priest/Shadow.json";
import priestHolyJson from "./Priest/Holy.json";
import assassinationJson from "./Rogue/Assassination.json";
import combatJson from "./Rogue/Combat.json";
import subtletyJson from "./Rogue/Subtlety.json";
import elementalJson from "./Shaman/Elemental.json";
import shamanRestorationJson from "./Shaman/Restoration.json";
import enhancementJson from "./Shaman/Enhancement.json";
import warlockAfflictionJson from "./Warlock/Affliction.json";
import warlockDemonologyJson from "./Warlock/Demonology.json";
import warlockDestructionJson from "./Warlock/Destruction.json";
import armsJson from "./Warrior/Arms.json";
import furyJson from "./Warrior/Fury.json";
import warriorProtectionJson from "./Warrior/Protection.json";
import { TalentData } from "../TalentContext";
import { buildTalentImages } from "./talentImageBuilder";

export const classSpecs = {
  "Druid": [
    { spec: "Balance", json: balanceJson, icon: "spell_nature_starfall" },
    { spec: "Feral", json: feralJson, icon: "ability_racial_bearform" },
    { spec: "Restoration", json: druidRestorationJson, icon: "spell_nature_healingtouch" }
  ],
  "Mage": [
    { spec: "Arcane", json: arcaneJson, icon: "spell_holy_magicalsentry" },
    { spec: "Fire", json: fireJson, icon: "spell_fire_firebolt" },
    { spec: "Frost", json: frostJson, icon: "spell_frost_frostbolt02" }
  ],
  "Hunter": [
    { spec: "Beast Mastery", json: beastMasteryJson, icon: "ability_hunter_beasttaming" },
    { spec: "Marksmanship", json: marksmanshipJson, icon: "ability_marksmanship" },
    { spec: "Survival", json: survivalJson, icon: "ability_hunter_swiftstrike" }
  ],
  "Paladin": [
    { spec: "Holy", json: paladinHolyJson, icon: "spell_holy_holybolt" },
    { spec: "Protection", json: paladinProtectionJson, icon: "spell_holy_devotionaura" },
    { spec: "Retribution", json: retributionJson, icon: "spell_holy_auraoflight" }
  ],
  "Priest": [
    { spec: "Discipline", json: disciplineJson, icon: "spell_holy_powerwordshield" },
    { spec: "Holy", json: priestHolyJson, icon: "spell_holy_holybolt" },
    { spec: "Shadow", json: shadowJson, icon: "spell_shadow_shadowwordpain" }
  ],
  "Rogue": [
    { spec: "Assassination", json: assassinationJson, icon: "ability_rogue_eviscerate" },
    { spec: "Combat", json: combatJson, icon: "ability_backstab" },
    { spec: "Subtlety", json: subtletyJson, icon: "ability_stealth" }
  ],
  "Shaman": [
    { spec: "Elemental", json: elementalJson, icon: "spell_nature_lightning" },
    { spec: "Enhancement", json: enhancementJson, icon: "spell_nature_lightningshield" },
    { spec: "Restoration", json: shamanRestorationJson, icon: "spell_nature_healingwavegreater" }
  ],
  "Warlock": [
    { spec: "Affliction", json: warlockAfflictionJson, icon: "spell_shadow_deathcoil" },
    { spec: "Demonology", json: warlockDemonologyJson, icon: "spell_shadow_metamorphosis" },
    { spec: "Destruction", json: warlockDestructionJson, icon: "spell_fire_fireball" }
  ],
  "Warrior": [
    { spec: "Arms", json: armsJson, icon: "ability_warrior_savageblow" },
    { spec: "Fury", json: furyJson, icon: "ability_warrior_innerrage" },
    { spec: "Protection", json: warriorProtectionJson, icon: "inv_shield_06" }
  ]
};

export function getTalentTree(className: string, specName: string) {
  const classInfo = classSpecs[className as keyof typeof classSpecs];
  if (classInfo) {
    const specInfo = classInfo.find(spec => spec.spec === specName);
    if (specInfo) {
      let treeJson = specInfo.json as unknown as TalentData;
      for (var x of treeJson[specName]) {
        buildTalentImages(x, specInfo.icon, specName);
      }
      return treeJson[specName];
    } else {
      console.error(`Spec '${specName}' not found in class '${className}'`);
    }
  } else {
    console.error(`Class '${className}' not found`);
  }
  return null;
}