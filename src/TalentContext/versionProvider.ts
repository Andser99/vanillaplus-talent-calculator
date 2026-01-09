import exampleTree from "../trees/Druid/Balance.json"


export function getTalentVersion() {
    let version = parseInt(localStorage.getItem('talent-version') || '0') || 0;
    console.log(`Current version: ${version}`);
    if (localStorage.getItem('talent-version') === null || version > (Object.keys(exampleTree.Balance).length - 1)) {
    console.log(`No version found, setting to highest available.`);
        setTalentVersion((Object.keys(exampleTree.Balance).length - 1).toString());
    }
    return version;
}

export function setTalentVersion(version: string) {
    localStorage.setItem('talent-version', version);
}