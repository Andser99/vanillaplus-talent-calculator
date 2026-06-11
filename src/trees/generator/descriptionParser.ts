export function parse(description: string) {
    let replacements = parseDescriptions(description);
    return replacements;
}

function parseDescriptions(description: string) {
    let replacementsArray = Array<Replacement>();
    let currentIndex: refNumber = { value: 0 };
    while (currentIndex.value < description.length) {
        parseBeginning(description, currentIndex, replacementsArray);
        currentIndex.value++;
    }
    return replacementsArray;
}

function parseBeginning(description: string, currentIndex: refNumber, replacementsArray: Array<Replacement>) {
    let symbol = description[currentIndex.value];
    if (symbol == '$') {
        let replacement = getNewReplacement();
        replacement.replacementTemplate += symbol;
        currentIndex.value++;

        parseDuration(description, currentIndex, replacement);
        parseSpellId(description, currentIndex, replacement);
        parseColumnName(description, currentIndex, replacement);
        replacementsArray.push(replacement);
    }
}

function getNewReplacement(): Replacement {
    return {
        spellId: -1,
        columnName: "",
        durationDivisor: 0,
        replacementTemplate: "",
        indexTable: "",
        singularWord: "",
        pluralWord: "",
        isRemoval: false,
        dieIndex: 0,
        transform: (input) => input
    };
}

function parseDuration(description: string, currentIndex: refNumber, replacement: Replacement) {
    let symbol = description[currentIndex.value];
    if (symbol === '/') {
        replacement.replacementTemplate += symbol;
        currentIndex.value++;

        let durationDivisor = parseNumber(description, currentIndex, replacement);
        replacement.durationDivisor = durationDivisor;
    }
}

function parseSpellId(description: string, currentIndex: refNumber, replacement: Replacement) {
    let symbol = description[currentIndex.value];
    if (symbol === ';') {
        replacement.replacementTemplate += symbol;
        currentIndex.value++;
        symbol = description[currentIndex.value];
    }
    if (symbol >= '0' && symbol <= '9') {
        let spellId = parseNumber(description, currentIndex, replacement);
        replacement.spellId = spellId;
    }
}

function parseColumnName(description: string, currentIndex: refNumber, replacement: Replacement) {
    let symbol = description[currentIndex.value];
    replacement.replacementTemplate += symbol;
    const currentSymbol = symbol.toLowerCase();
    if (currentSymbol === 's') {
        parseS(description, currentIndex, replacement);
    }
    else if (currentSymbol === 'h') {
        parseH(replacement, description, currentIndex);
    }
    else if (currentSymbol === 'b') {
        parseB(replacement, description, currentIndex);
    }
    else if (currentSymbol === 'o') {
        parseO(replacement, description, currentIndex);
    }
    else if (currentSymbol === 'd') {
        parseD(replacement);
    }
    else if (currentSymbol === 'a') {
        parseA(description, currentIndex, replacement);
    }
    else if (currentSymbol === 't') {
        parseT(description, currentIndex, replacement);
    }
    else if (currentSymbol === 'l') {
        parseL(description, currentIndex, replacement);
    }
    else if (currentSymbol === 'u') {
        parseU(replacement);
    }
    else if (currentSymbol === 'n') {
        parseN(replacement);
    }
    else if (currentSymbol === 'x') {
        parseX(replacement, description, currentIndex);
    }
}

function parseU(replacement: Replacement) {
    replacement.columnName = "StackAmount";
}

function parseS(description: string, currentIndex: refNumber, replacement: Replacement) {
    parseEffectBasePoints(description, currentIndex, replacement);
    replacement.transform = effectBaseTransform;
}

function parseH(replacement: Replacement, description: string, currentIndex: refNumber) {
    replacement.columnName = "ProcChance";
    if (description[currentIndex.value + 1] >= '0' && description[currentIndex.value + 1] <= '9') {
        currentIndex.value++;
        replacement.replacementTemplate += parseNumber(description, currentIndex, replacement);
    }
}

function parseB(replacement: Replacement, description: string, currentIndex: refNumber) {
    replacement.columnName = "EffectPointsPerCombo_1";
    if (description[currentIndex.value + 1] >= '0' && description[currentIndex.value + 1] <= '9') {
        currentIndex.value++;
        let parsedNumber = parseNumber(description, currentIndex, replacement);
        replacement.columnName = "EffectPointsPerCombo_" + parsedNumber;
    }
}

function parseO(replacement: Replacement, description: string, currentIndex: refNumber) {
    replacement.columnName = "EffectAmplitude_1";
    if (description[currentIndex.value + 1] >= '0' && description[currentIndex.value + 1] <= '9') {
        currentIndex.value++;
        let parsedNumber = parseNumber(description, currentIndex, replacement);
        replacement.columnName = "EffectAmplitude_" + parsedNumber;
        replacement.transform = effectAmplitudeTransform;
    }
}

function parseD(replacement: Replacement) {
    replacement.columnName = "DurationIndex";
    replacement.indexTable = "SpellDuration";
}

function parseA(description: string, currentIndex: refNumber, replacement: Replacement) {
    parseEffectRadiusIndex(description, currentIndex, replacement);
    replacement.indexTable = "SpellRadius";
}

function parseT(description: string, currentIndex: refNumber, replacement: Replacement) {
    "EffectAmplitude_"
    if (description[currentIndex.value + 1] >= '0' && description[currentIndex.value + 1] <= '9') {
        currentIndex.value++;
        let parsedNumber = parseNumber(description, currentIndex, replacement);
        replacement.columnName = "EffectAmplitude_" + parsedNumber;
        replacement.transform = effectAmplitudeTransform;
    }
}

function parseL(description: string, currentIndex: refNumber, replacement: Replacement) {
    parsePluralWording(description, currentIndex, replacement);
}

function parseN(replacement: Replacement) {
    replacement.columnName = "ProcCharges";
}

function parseX(replacement: Replacement, description: string, currentIndex: refNumber) {
    replacement.columnName = "EffectChainTarget_1";
    if (description[currentIndex.value + 1] >= '0' && description[currentIndex.value + 1] <= '9') {
        currentIndex.value++;
        let parsedNumber = parseNumber(description, currentIndex, replacement);
        replacement.columnName = "EffectChainTarget_" + parsedNumber;
    }
}

function effectBaseTransform(input: string) {
    let value = parseInt(input);
    return Math.abs(value).toString();
}

function effectAmplitudeTransform(input: string) {
    let value = parseInt(input);
    return (value/1000).toString();
}

function parsePluralWording(description: string, currentIndex: refNumber, replacement: Replacement) {
    currentIndex.value++;
    let indexOfSemicolon = description.indexOf(';', currentIndex.value);
    let split = description.substring(currentIndex.value).split(':');
    let singular = split[0];
    replacement.replacementTemplate += singular;
    let plural = split[1].split(';')[0];
    replacement.replacementTemplate += ":";
    replacement.replacementTemplate += plural;
    replacement.singularWord = singular;
    replacement.pluralWord = plural;
    replacement.replacementTemplate += ';';
    currentIndex.value = indexOfSemicolon;
    replacement.columnName = "EffectBasePoints_1";
}

function parseEffectBasePoints(description: string, currentIndex: refNumber, replacement: Replacement) {
    currentIndex.value++;
    let symbol = description[currentIndex.value];
    switch (symbol) {
        case '1':
            replacement.columnName = "EffectBasePoints_1";
            replacement.dieIndex = 1;
            break;
        case '2':
            replacement.columnName = "EffectBasePoints_2";
            replacement.dieIndex = 2;
            break;
        case '3':
            replacement.columnName = "EffectBasePoints_3";
            replacement.dieIndex = 3;
            break;
    }
    replacement.replacementTemplate += symbol;
    currentIndex.value++;
}

function parseEffectRadiusIndex(description: string, currentIndex: refNumber, replacement: Replacement) {
    currentIndex.value++;
    let symbol = description[currentIndex.value];
    replacement.replacementTemplate += symbol;
    switch (symbol) {
        case '1':
            replacement.columnName = "EffectRadiusIndex_1";
            break;
        case '2':
            replacement.columnName = "EffectRadiusIndex_2";
            break;
    }
}

function parseNumber(description: string, currentIndex: refNumber, replacement: Replacement): number {
    let symbol = description[currentIndex.value];
    let numberString = "";
    while (symbol >= '0' && symbol <= '9') {
        numberString += symbol;

        replacement.replacementTemplate += symbol;
        currentIndex.value++;
        symbol = description[currentIndex.value];
    }
    return Number.parseInt(numberString);
}

interface refNumber { value: number; };

export interface Replacement {
    spellId: number,
    columnName: string,
    durationDivisor: number,
    replacementTemplate: string,
    indexTable: string,
    singularWord: string,
    pluralWord: string,
    isRemoval: boolean,
    dieIndex: number,
    transform: (input: string) => string
}


// Test functions, run using `npx tsx <path_to_this_file>`
function testParse() {
    let test1 = "Fills the $lPaladin:paladins; with $d, equal to $34092s1% of Paladin. $/1000;S1, $u $o $t $d $b.\n";
    let replacements = parse(test1);
    console.log(replacements);
}

testParse();