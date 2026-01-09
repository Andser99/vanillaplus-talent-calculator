import { getTalentRank, TalentData } from "../TalentContext";
import { State, TalentVersion } from "../TalentContext/types";
import { requireAll } from "../utils";
const icons = requireAll(require.context("../assets/icons"));

export function buildTalentImages(tree: TalentVersion, treeIcon: string, specName: string){
    for (let talentKey in tree.talents){
        let talent = tree.talents[talentKey];
        talent.icon = icons[talent.icon];

        // talent.description = (rank) => talent.descriptions[rank-1];

        talent.description = (rank, state) => talent.descriptions[getDependencyRank(state, specName, talent.dependencyName)][rank-1];
    }
    tree.icon = icons[treeIcon];
}

function getDependencyRank(state: State, tree: string, talentName: string) {
  if (talentName === '') {
    return 0;
  }
  
  let rank = getTalentRank(state, tree, talentName);
  console.log(rank + "=rank, Talent has dependency - " + talentName);
  return rank;
}