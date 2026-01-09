import React, { lazy, Suspense, useState } from "react";
import { Route } from "react-router-dom";
import exampleTree from "./trees/Druid/Balance.json"

import "./App.css";
import { KlassList } from "./components/KlassList";

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

export default function NumberDropdown() {
  const [value, setValue] = useState(
    () => localStorage.getItem("talent-version") ?? Object.keys(exampleTree.Balance).length
  );

  return (
    <div>
      <p style={{color: "#ffd100", paddingBottom: "5px", fontSize: "large"}}>Select Talent Version</p>
    <select
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        setValue(v);
        localStorage.setItem("talent-version", v);
        let u = new URL(window.location.href), s = u.pathname.split('/').filter(Boolean);
        if (s.at(-1) !== '#') s.pop();
        u.pathname = '/' + s.join('/');
        window.history.replaceState(null, '', u.toString()); // update URL without navigating
        window.location.reload(); // force hard reload
      }}
    >
      <option value="">-- Select --</option>
      {Array.from({ length: Object.keys(exampleTree.Balance).length }, (_, i) => i).map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
      </select></div>
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
      </Suspense>
    </div>
  );
};
