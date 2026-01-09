import { TalentData } from "../../TalentContext";
import { addTalentsForTabId } from "./talentCreator";
import * as fs from 'fs';
import tabIdsJson from "../DBC/TabId.json";
import { TalentVersion } from "../../TalentContext/types";

function generateAllTrees() {
    for (let tabId in tabIdsJson) {
        let specName = tabIdsJson[tabId as keyof typeof tabIdsJson].Talents;
        let className = tabIdsJson[tabId as keyof typeof tabIdsJson].Class;
        generateTree(Number.parseInt(tabId), specName, className);
        console.log(`Generating tree ${specName}=${tabId}`);
    }
}

function generateTree(tabId: number, specName: string, className: string) {
    let tree = JSON.parse(fs.readFileSync(`./src/trees/${className}/${specName}.json`, "utf-8")) as TalentData;
    let talentVersion: TalentVersion = {} as TalentVersion;
    talentVersion = {
        name: specName,
        "background": specName.toLowerCase(),
        "icon": "",
        "talents": {}
    };
    addTalentsForTabId(talentVersion, tabId, specName);
    tree[specName].push(talentVersion);
    saveTree(tree, specName, className);
}

function saveTree(tree: TalentData, treeName: string, className: string) {
    let jsonToWrite = JSON.stringify(tree);
    fs.writeFileSync(`./src/trees/${className}/${treeName}.json`, jsonToWrite);
}

generateAllTrees();