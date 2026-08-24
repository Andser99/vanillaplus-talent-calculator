import React, { lazy, Suspense, useState } from "react";
import { Route } from "react-router-dom";
import exampleTree from "./trees/Druid/Balance.json"
import logo from "./assets/smlogo.png";
import { LatestVersionDescription } from "./TalentContext/TalentIdToVersion";
import { isUsingLatestVersion } from "./TalentContext/versionProvider";

import "./App.css";
import { KlassList } from "./components/KlassList";
import { TalentIdToVersion } from "./TalentContext/TalentIdToVersion";

const Druid = lazy(() => import("./trees/Druid"));
const Hunter = lazy(() => import("./trees/Hunter"));
const Mage = lazy(() => import("./trees/Mage"));
const Paladin = lazy(() => import("./trees/Paladin"));
const Priest = lazy(() => import("./trees/Priest"));
const Rogue = lazy(() => import("./trees/Rogue"));
const Shaman = lazy(() => import("./trees/Shaman"));
const Warlock = lazy(() => import("./trees/Warlock"));
const Warrior = lazy(() => import("./trees/Warrior"));
const ScarletMonastery = lazy(() => import("./trees/ScarletMonastery"));
const Editor = lazy(() => import("./trees/Editor"));

export default function NumberDropdown() {
  const [value, setValue] = useState(
    () => localStorage.getItem("talent-version") ?? Object.keys(exampleTree.Balance).length
  );

  return (
    <div style={{ textAlign: "center" }}>

      <div className="version-picker" style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
        <p className="version-label">Version:</p>

        <select
          className="talent-picker"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            setValue(v);
            localStorage.setItem("talent-version", v);
            window.location.reload();
          }}
        >
          <option value="">-- Select --</option>
          {Array.from({ length: Object.keys(exampleTree.Balance).length }, (_, i) => i).map((n) => (
            <option key={n} value={n}>
              V{n} --- {TalentIdToVersion(n)}
            </option>
          ))}
        </select>

        <a
          href={`${process.env.PUBLIC_URL}/TalentLinkExporter.zip`}
          download
          className="addon-download-btn"
        >
          Download Link Sharing Addon
        </a>
        <div>
          <span className="addon-info" aria-label="Version info">
            ⓘ
            <span className="addon-tooltip">
              Adds a "Get Build Link" button on top of your talents.<br/>
              Generates a link for this talent calculator from your current talents.
            </span>
          </span>
        </div>
      </div>

      <div style={{ display: !isUsingLatestVersion() ? "block" : "none" }} className="sm-banner">
        <span>
          ⚠️ You are viewing an older talent tree. A more recent talent version is available! ⚠️ {LatestVersionDescription()}
        </span>
      </div>
      
    </div>
  );
}

export const App: React.FC = () => {
  return (
    <div className="App">
      <NumberDropdown></NumberDropdown>
      <KlassList />
      <Suspense fallback={null}>
        <Route path="/druid" component={Druid} />
        <Route path="/hunter" component={Hunter} />
        <Route path="/mage" component={Mage} />
        <Route path="/paladin" component={Paladin} />
        <Route path="/priest" component={Priest} />
        <Route path="/rogue" component={Rogue} />
        <Route path="/shaman" component={Shaman} />
        <Route path="/warlock" component={Warlock} />
        <Route path="/warrior" component={Warrior} />
        <Route path="/scarletmonastery" component={ScarletMonastery} />
        <Route path="/editor" component={Editor} />
      </Suspense>
    </div>
  );
};
