import exampleTree from "../trees/Druid/Balance.json"


export function getTalentVersion() {
    let highest = Object.keys(exampleTree.Balance).length - 1;
    let version = parseInt(localStorage.getItem('talent-version') || highest.toString()) || 0;
    console.log(`Current version: ${version}`);
    if (localStorage.getItem('talent-version') === null || version > highest) {
    console.log(`No version found, setting to highest available.`);
        setTalentVersion(highest.toString());
    }
    return version;
}

export function setTalentVersion(version: string) {
    localStorage.setItem('talent-version', version);
}