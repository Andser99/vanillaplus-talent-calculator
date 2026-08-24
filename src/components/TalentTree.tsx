import React from "react";

import "./TalentTree.css";
import { TreeContext } from "../TreeContext";
import { useTalentContext } from "../TalentContext";
import { Talent } from "./Talent";
import { SquareButton } from "./SquareButton";
import { ClearButton } from "./ClearButton";
import { getTreePointsSpent, getTreeData } from "../TalentContext/selectors";
import { getTalentVersion } from "../TalentContext/versionProvider";

const images = require.context(
  "../assets/tree-backgrounds",
  true,
  /\.(png|jpg|jpeg)$/
);

interface Props {
  className: string;
  name: string;
  onEditTalent?: (name: string) => void;
}

export const TalentTree: React.FC<Props> = ({ className, name, children, onEditTalent }) => {
  const { state, data, resetTree } = useTalentContext();
  const pointsSpent = getTreePointsSpent(state, name);
  const treeData = getTreeData(data, name);

  return (
    <TreeContext.Provider value={name}>
      <div className="TalentTree">
        <header className="TalentTree-header">
          <SquareButton className="TalentTree-icon" icon={treeData[getTalentVersion()].icon} />
          <div style={{ flex: 1 }}>
            <h2 className="TalentTree-name" style={{ flex: 1 }}>
              {name}
            </h2>
            <p className="TalentTree-pointsSpent">
              Points spent: {pointsSpent}
            </p>
          </div>
          <ClearButton onClick={() => resetTree(name)} />
        </header>
        <div
          className="TalentTree-grid"
          style={{
            backgroundImage: `url(${images(`./${className.toLowerCase()}/${treeData[getTalentVersion()].background}.jpg`)}` }}
        >
          {Object.keys(treeData[getTalentVersion()].talents).map(talentName => (
            <Talent
              key={talentName}
              name={talentName}
              onEditTalent={onEditTalent}
            />
          
          ))}
          {children}
        </div>
      </div>
    </TreeContext.Provider>
  );
};
