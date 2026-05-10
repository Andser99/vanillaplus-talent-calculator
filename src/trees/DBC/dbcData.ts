
import spellJson from "../DBC/json/Spell.json";
import spellIconJson from "../DBC/json/SpellIcon.json";
import spellDurationJson from "../DBC/json/SpellDuration.json";
import spellRadiusJson from "../DBC/json/SpellRadius.json";
import spellCastTimeJson from "../DBC/json/SpellCastTimes.json";
import talentJson from "../DBC/json/Talent.json";
import { Dictionary } from "../../TalentContext/types";
export const spellDictionary = Array.isArray(spellJson) ? spellJson.reduce((dict, spell) => {
  dict[spell.ID] = spell;
  return dict;
}, {}) : {};

export const iconDictionary = Array.isArray(spellIconJson) ? spellIconJson.reduce((dict: Dictionary, icon) => {
  let iconName = icon.TextureFilename.split("\\");
  dict[icon.ID.toString()] = iconName.at(-1)?.toLowerCase() ?? "";
  return dict;
}, {}) : {};

export const talentDictionary = Array.isArray(talentJson) ? talentJson.reduce((dict: Dictionary, talent) => {
  dict[talent.ID] = talent;
  return dict;
}, {}) : {};

export const spellDurationDictionary = Array.isArray(spellDurationJson) ? spellDurationJson.reduce((dict: Dictionary, spellDuration) => {
  dict[spellDuration.ID] = spellDuration;
  return dict;
}, {}) : {};

export const spellRadiusDictionary = Array.isArray(spellRadiusJson) ? spellRadiusJson.reduce((dict: Dictionary, spellRadius) => {
  dict[spellRadius.ID] = spellRadius;
  return dict;
}, {}) : {};

export const spellCastTimeDictionary = Array.isArray(spellCastTimeJson) ? spellCastTimeJson.reduce((dict: Dictionary, spellCastTime) => {
  dict[spellCastTime.ID] = spellCastTime;
  return dict;
}, {}) : {};