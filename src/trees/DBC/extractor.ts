import * as fs from "fs";
// @ts-ignore
import { WoWDBCFile } from 'wow-dbcfile-node';
import { spellDBCSchema } from './schema/spell';
import { talentDBCSchema } from "./schema/talent";
import { spellIconDBCSchema } from "./schema/spellIcon";
import * as https from "https";
import { spellDurationDBCSchema } from "./schema/spellDuration";
import { spellRadiusDBCSchema } from "./schema/spellRadius";
const skipDownload = false;
const downloadAddress = "https://vanillaplus.org/uploads/patch-3.MPQ";
const skipMpqExtraction = false;

function downloadPatch3MPQ(action: any) {
    if (skipDownload) {
        action();
        return;
    }
    const file = fs.createWriteStream("./src/trees/DBC/patch-3.MPQ");
    const request = https.get(downloadAddress, function (response) {
        // @ts-ignore
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloaded = 0;
        console.log(`Total size: ${totalSize} bytes`);
        let lastPercentage = 0;
        response.on('data', (chunk) => {
            downloaded += chunk.length;
            const percentage = ((downloaded / totalSize) * 100);

            // Log progress every 10%
            if (lastPercentage + 10 < percentage) {
                lastPercentage = percentage;
                console.log(`Downloaded: ${downloaded} bytes (${percentage.toFixed(2)}%).`);
            }
        });
        response.pipe(file);
        file.on("finish", () => {
            file.close();
            console.log("Download Completed.");
            action();
        });
    });
}

function extractDBCFromMPQ(action: any) {
    if (skipMpqExtraction) {
        action();
        return;
    }
    const { exec } = require('child_process');
    let linuxCommands = [`./src/trees/generator/mpqcli-linux extract -f "DBFilesClient\\Talent.dbc" ./src/trees/DBC/patch-3.MPQ`,
        `./src/trees/generator/mpqcli-linux extract -f "DBFilesClient\\Spell.dbc" ./src/trees/DBC/patch-3.MPQ`,
        `./src/trees/generator/mpqcli-linux extract -f "DBFilesClient\\SpellIcon.dbc" ./src/trees/DBC/patch-3.MPQ`,
        `./src/trees/generator/mpqcli-linux extract -f "DBFilesClient\\SpellDuration.dbc" ./src/trees/DBC/patch-3.MPQ`,
        `./src/trees/generator/mpqcli-linux extract -f "DBFilesClient\\SpellRadius.dbc" ./src/trees/DBC/patch-3.MPQ`
    ];
    // TODO Add windows command to extract MPQ
    let winCommands = [''];

    let commands = process.platform == 'win32' ? winCommands : linuxCommands;
    for (let command of commands) {
        console.log("Executing: " + command);
        exec(command, (err: any, stdout: any, stderr: any) => {
            if (err) {
                console.log(err);
                return;
            }

            console.log(stdout);
            console.debug(`stderr: ${stderr}`);
        });
    }
    action();
}

function extractDataFromDBC(sourcePath: string, targetPath: string, schema: any) {
    // Open the Item.dbc file
    console.log('Reading DBC file ' + sourcePath);
    const dbc = new WoWDBCFile(sourcePath, schema);
    dbc.read();
    const header = dbc.header;
    console.log('Total items:', header.record_count);
    let allJson = [];
    for (let index = 0; index < header.record_count; index++) {
        allJson.push(dbc.getRecord(index));
    }
    console.log('Writing JSON file ' + sourcePath);
    fs.writeFileSync(targetPath, JSON.stringify(allJson));
}

// Process start here
// Extract DBCs from MPQ first
downloadPatch3MPQ(() => {
    extractDBCFromMPQ(() => {
        extractDataFromDBC('./src/trees/DBC/patch-3/Spell.dbc', './src/trees/DBC/json/Spell.json', spellDBCSchema);
        extractDataFromDBC('./src/trees/DBC/patch-3/Talent.dbc', './src/trees/DBC/json/Talent.json', talentDBCSchema);
        extractDataFromDBC('./src/trees/DBC/patch-3/SpellIcon.dbc', './src/trees/DBC/json/SpellIcon.json', spellIconDBCSchema);
        extractDataFromDBC('./src/trees/DBC/patch-3/SpellDuration.dbc', './src/trees/DBC/json/SpellDuration.json', spellDurationDBCSchema);
        extractDataFromDBC('./src/trees/DBC/patch-3/SpellRadius.dbc', './src/trees/DBC/json/SpellRadius.json', spellRadiusDBCSchema);
    });
})

