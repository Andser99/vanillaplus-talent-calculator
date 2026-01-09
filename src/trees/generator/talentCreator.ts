
import talentJson from "../DBC/json/Talent.json";
import { tierToPosition } from "../../TalentContext/conversions";
import { iconDictionary, spellDictionary, spellDurationDictionary, spellRadiusDictionary, talentDictionary } from "../DBC/dbcData";
import { Arrow, Talent, TalentData, TalentVersion } from "../../TalentContext/types";
import { parse, Replacement } from "./descriptionParser";
import { ArrowDir } from "../../TalentContext";
import patchJson from "./manualTalentPatches.json";

export function addTalentsForTabId(tree: TalentVersion, tabId: number, treeName: string) {
    let specTalents = talentJson.filter(_ => _.TabID === tabId)
    for (let talent of specTalents) {
        let spells = getSpellsForTalent(talent);
        let talentName = spells[0]["Name_enUS"] as string;
        let spellDescs = getDescriptions(spells);
        let newTalent: Talent = {
            name: talentName,
            pos: tierToPosition(talent.TierID, talent.ColumnIndex),
            maxRank: getSpellsForTalent(talent).length,
            reqPoints: talent.TierID * 5,
            prereq: talent.PrereqTalent_1 !== 0 ? getHighestTalentSpellRank(talentDictionary[talent.PrereqTalent_1]["ID"]) : undefined,
            description: () => "",
            dependencyName: "",
            cost: getCosts(spells),
            cooldown: getCooldown(spells),
            descriptions: [spellDescs],
            arrows: getArrow(talent),
            icon: iconDictionary[spells[0]["SpellIconID"]]
        };
        tree.talents[talentName] = newTalent;
        patch(newTalent);
    }
}

// TODO: Get rid of this bullshit and parse spell dependencies properly
// The idea is to build a real solution for talents affecting each other with spell masks
function patch(talent: Talent) {
    if (Object.keys(patchJson).includes(talent.name)) {
        for (let patch of patchJson[talent.name as keyof typeof patchJson]) {
            // Ugly modification without types
            //@ts-ignore
            talent[patch.property as keyof typeof talent] = patch.value;
        }
    }
}

function getArrow(talent: typeof talentJson[0]) : Arrow[] {
    let arrows:Arrow[] = [];
    if (talent.PrereqTalent_1 !== 0) {
        let prereqTalent = talentDictionary[talent.PrereqTalent_1];
        let dir = getDirection(talent.TierID, talent.ColumnIndex, prereqTalent.TierID, prereqTalent.ColumnIndex);
        arrows = arrows.concat(getArrows(dir, talent.TierID, talent.ColumnIndex, prereqTalent.TierID, prereqTalent.ColumnIndex));
    }
    if (talent.PrereqRank_2 !== 0) {
        let prereqTalent = talentDictionary[talent.PrereqTalent_2];
        let dir = getDirection(talent.TierID, talent.ColumnIndex, prereqTalent.TierID, prereqTalent.ColumnIndex);
        arrows.concat(getArrows(dir, talent.TierID, talent.ColumnIndex, prereqTalent.TierId, prereqTalent.ColumnIndex));
    }
    return arrows;
}

function getArrows(dir: ArrowDir, toX: number, toY: number, fromX: number, fromY: number): Arrow[] {
    let arrows: Arrow[] = [];
    if(dir == "left") {
        arrows.push({to: tierToPosition(toX, toY), dir: dir, from: tierToPosition(fromX, fromY)});
        return arrows;
    }
    if(dir == "right") {
        arrows.push({to: tierToPosition(toX, toY), dir: dir, from: tierToPosition(fromX, fromY)});
        return arrows;
    }
    if(dir == "down") {
        arrows.push({to: tierToPosition(toX, toY), dir: dir, from: tierToPosition(fromX, fromY)});
        // console.log(arrows);
        return arrows;
    }
    if(dir == "right-down") {
        arrows.push({to: tierToPosition(fromX, fromY+1), dir: "right-down", from: tierToPosition(fromX, fromY)});
        arrows.push({to: tierToPosition(toX, toY), dir: "right-down-down", from: tierToPosition(fromX, toY)});
        return arrows;
    }

    return arrows;
}

function getDirection(toX: number, toY: number, fromX: number, fromY: number): ArrowDir {
    if (toY > fromY && toX > fromX)
        return "right-down";
    if (toY > fromY) {
        return "right";
    }
    if (toY < fromY)
        return "left";
    if (toX > fromX)
        return "down";
    return "down";
}

function getCooldown(spells: any) {
    let spell = spells[0];
    if (spell["CategoryRecoveryTime"] != 0) {
        return msToFormattedTime(spell["CategoryRecoveryTime"]) + " cooldown";
    }
    else if (spell["RecoveryTime"] != 0) {
        return msToFormattedTime(spell["RecoveryTime"]) + " cooldown";
    }
    return "";
}

function getCosts(spells: any) {
    let spell = spells[0];
    if (spell["ManaCost"] != 0) {
        // TODO: write correct resource name
        if (spell["PowerType"] === 0) {
            return spell["ManaCost"] + " Mana";
        }
        if (spell["PowerType"] === 1) {
            return spell["ManaCost"] / 10 + " Rage";
        }
        if (spell["PowerType"] === 3) {
            return spell["ManaCost"] + " Energy";
        }
    }
    else if (spell["ManaCostPct"] != 0) {
        return spell["ManaCostPct"] + "% Base Mana";
    }
    return "";
}

function getDescriptions(spells: any) {
    let spellDescs = Array<string>();
    for (let spell of spells) {
        spellDescs.push(parseSpellValues(spell["Description_enUS"], spell));
    }
    // spells.reduce((arr: Array<string>, val: string) => { arr.push(parseSpellValues(`${spells[arr.length] !== undefined ? spells[arr.length-1]["Description_enUS"]: spells[0]["Description_enUS"]}`, spells[arr.length-1]),); return arr;});
    return spellDescs;
}

function getHighestTalentSpellRank(id: number) {
    const preReqTalent = talentDictionary[id];
    // TODO: Nice to have, but talent names (usually) don't change between ranks
    // Check which highest rank is available on the prereq talent and use the highest rank spell name
    return spellDictionary[preReqTalent["SpellRank_1"]]["Name_enUS"];
}

function parseSpellValues(description: string, spell: any) {
    if (spell !== undefined) {
        // TODO: Replace with descriptionParser implementation and map the replacements to spell data and duration/area indexes
        let replacements = parse(description);
        for (let replacement of replacements) {
            let replacementString = getReplacementString(replacement, spell);
            description = description.replaceAll(replacement.replacementTemplate, replacementString);
        }
    }
    return description;
}

function getReplacementString(replacement: Replacement, spell: any) {
    if (replacement.spellId !== -1) {
        spell = spellDictionary[replacement.spellId];
    }
    let result = '';
    let dieIncrease = replacement.dieIndex == 0
        ? 0
        : spell["EffectBaseDice_" + replacement.dieIndex] * spell["EffectDieSides_" + replacement.dieIndex];
    if (replacement.isRemoval) {
        return "";
    }
    if (replacement.singularWord != "") {
        return parseInt(spell[replacement.columnName]) > 1 ? replacement.pluralWord : replacement.singularWord;
    }
    if (replacement.durationDivisor != 0) {
        let value = 0;
        if (replacement.indexTable != '') {
            value = lookupIndex(replacement.indexTable, spell[replacement.columnName]);
            if (replacement.indexTable == 'SpellDuration') {
                result = effectToDuration(value + dieIncrease, replacement.durationDivisor);
            }
            else {
                result = (value + dieIncrease).toString();
            }
        }
        else {
            value = spell[replacement.columnName];
            result = effectToDuration(value + dieIncrease, replacement.durationDivisor);
        }
    }
    else if (replacement.indexTable != ''){
        result = lookupIndex(replacement.indexTable, spell[replacement.columnName]);
        if (replacement.indexTable == 'SpellDuration') {
            result = msToFormattedTime(result + dieIncrease);
        }
    }
    else {
        let value = parseInt(spell[replacement.columnName]) + dieIncrease;
        result = replacement.transform(value.toString());
    }

    return result;
}

function msToFormattedTime(time: string) {
    let timeNumber = parseInt(time);
    if (timeNumber >= 60000) {
        let minutes = Math.floor(timeNumber / 60000);
        return minutes + " minute" + (minutes > 1 ? "s" : "");
    }
    return timeNumber / 1000 + " seconds";
}

const indexMap: Record<string, any> = {
    "SpellDuration": { dict: spellDurationDictionary, column: "Duration"},
    "SpellRadius": { dict: spellRadiusDictionary, column: "Radius"}
}
function lookupIndex(tableName: string, index: number) {
    let map = indexMap[tableName];
    return map.dict[index][map.column];
}

function effectToDuration(value: number, durationDiv: number) {
    return (Math.abs(value) / durationDiv).toString();
}

function getSpellsForTalent(talent: typeof talentJson[0]) {
    let spells = [];
    spells.push(spellDictionary[talent.SpellRank_1])
    if (talent.SpellRank_2 != 0)
        spells.push(spellDictionary[talent.SpellRank_2]);
    if (talent.SpellRank_3 != 0)
        spells.push(spellDictionary[talent.SpellRank_3]);
    if (talent.SpellRank_4 != 0)
        spells.push(spellDictionary[talent.SpellRank_4]);
    if (talent.SpellRank_5 != 0)
        spells.push(spellDictionary[talent.SpellRank_5]);
    if (talent.SpellRank_6 != 0)
        spells.push(spellDictionary[talent.SpellRank_6]);
    if (talent.SpellRank_7 != 0)
        spells.push(spellDictionary[talent.SpellRank_7]);
    if (talent.SpellRank_8 != 0)
        spells.push(spellDictionary[talent.SpellRank_8]);
    if (talent.SpellRank_9 != 0)
        spells.push(spellDictionary[talent.SpellRank_9]);
    return spells;
}