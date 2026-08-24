import React, { useMemo, useState } from "react";
import "./Editor.css";

import {
  classSpecs,
  getTalentTree,
} from "../treeProvider";

import {
  TalentData,
  createTalentProvider,
} from "../../TalentContext";

import { TalentTree } from "../../components/TalentTree";

import {
  Talent,
  State,
} from "../../TalentContext/types";

import { TalentEditor } from "./TalentEditor";

import {
  getTalentVersion,
  setTalentVersion,
} from "../../TalentContext/versionProvider";

const STORAGE_KEY = "talent-tree-editor";

const createDescription = (
  talent: Talent,
  treeName: string,
) => {
  return (
    points: number,
    state: State,
  ): string => {
    const descriptions =
      Array.isArray(talent.descriptions)
        ? talent.descriptions
        : [[""]];

    if (descriptions.length === 0) {
      return "";
    }

    let dependencyRank = 0;

    if (talent.dependencyName) {
      dependencyRank =
        state?.[treeName]?.[talent.dependencyName] || 0;
    }

    const dependencyDescriptions =
      descriptions[
      Math.min(
        dependencyRank,
        descriptions.length - 1,
      )
      ] ||
      descriptions[0] ||
      [""];

    const rankIndex = Math.max(
      0,
      Math.min(
        points - 1,
        dependencyDescriptions.length - 1,
      ),
    );

    return dependencyDescriptions[rankIndex] || "";
  };
};

const normalizeTalent = (
  talent: Talent,
  treeName: string,
): Talent => {
  const normalized: Talent = {
    ...talent,
    descriptions:
      Array.isArray(talent.descriptions) &&
        talent.descriptions.length > 0
        ? talent.descriptions.map(dependency =>
          Array.isArray(dependency)
            ? [...dependency]
            : [],
        )
        : [[""]],
  };

  normalized.description = createDescription(
    normalized,
    treeName,
  );

  return normalized;
};

const normalizeTree = (
  source: TalentData,
): TalentData => {
  const result: TalentData = {};

  Object.entries(source).forEach(
    ([treeName, versions]) => {
      result[treeName] = Array.isArray(versions)
        ? versions.map(version => ({
          ...version,
          talents: Object.fromEntries(
            Object.entries(version.talents || {}).map(
              ([name, talent]) => [
                name,
                normalizeTalent(
                  talent,
                  treeName,
                ),
              ],
            ),
          ),
        }))
        : [];
    },
  );

  return result;
};

const serializeTree = (
  source: TalentData,
): string => {
  return JSON.stringify(
    source,
    (key, value) => {
      if (
        key === "description" &&
        typeof value === "function"
      ) {
        return undefined;
      }

      return value;
    },
  );
};

const getStorageKey = (
  className: string,
  specName: string,
) => {
  return `${STORAGE_KEY}:${className}:${specName}`;
};

const saveTreeToStorage = (
  tree: TalentData,
  className: string,
  specName: string,
) => {
  localStorage.setItem(
    getStorageKey(
      className,
      specName,
    ),
    serializeTree(tree),
  );
};

const loadTreeFromStorage = (
  className: string,
  specName: string,
): TalentData | null => {
  const saved = localStorage.getItem(
    getStorageKey(
      className,
      specName,
    ),
  );

  if (!saved) {
    return null;
  }

  try {
    return normalizeTree(
      JSON.parse(saved) as TalentData,
    );
  } catch {
    return null;
  }
};

const EditorTree: React.FC<{
  tree: TalentData;
  className: string;
  name: string;
  session: number;
  selectedVersion: number;
  onEditTalent: (talent: Talent) => void;
}> = ({
  tree,
  className,
  name,
  session,
  selectedVersion,
  onEditTalent,
}) => {
    const TalentProvider = useMemo(
      () => createTalentProvider(tree),
      [tree, session],
    );

    const handlePointerDownCapture = (
      event: React.PointerEvent<HTMLDivElement>,
    ) => {
      if (event.button !== 0) {
        return;
      }

      const target =
        event.target as HTMLElement;

      const container =
        target.closest(".Talent-container");

      if (!container) {
        return;
      }

      const position = (
        container as HTMLElement
      ).style.gridArea;

      if (!position) {
        return;
      }

      const versions = tree[name];

      if (!Array.isArray(versions)) {
        return;
      }

      const version =
        versions[selectedVersion];

      if (!version) {
        return;
      }

      const talent = Object.values(
        version.talents || {},
      ).find(
        current =>
          current &&
          current.pos === position,
      );

      if (talent) {
        event.preventDefault();
        onEditTalent(talent);
      }
    };

    return (
      <div
        className="Editor-tree-host"
        onPointerDownCapture={
          handlePointerDownCapture
        }
      >
        <TalentProvider key={session}>
          <TalentTree
            className={className}
            name={name}
            onEditTalent={(talentName: string) => {
              const versions = tree[name];

              if (!Array.isArray(versions)) {
                return;
              }

              const version =
                versions[selectedVersion];

              if (!version) {
                return;
              }

              const talent =
                version.talents?.[talentName];

              if (talent) {
                onEditTalent(talent);
              }
            }}
          />
        </TalentProvider>
      </div>
    );
  };

const Editor: React.FC = () => {
  const [selectedClass, setSelectedClass] =
    useState("");

  const [selectedSpec, setSelectedSpec] =
    useState("");

  const [selectedVersion, setSelectedVersion] =
    useState("");

  const [tree, setTree] =
    useState<TalentData | null>(null);

  const [selectedTalent, setSelectedTalent] =
    useState<Talent | null>(null);

  const [treeSession, setTreeSession] =
    useState(0);

  const availableVersions = useMemo(() => {
    if (
      !selectedClass ||
      !selectedSpec
    ) {
      return [];
    }

    const specInfo =
      classSpecs[
        selectedClass as keyof typeof classSpecs
      ]?.find(
        spec =>
          spec.spec === selectedSpec,
      );

    if (!specInfo) {
      return [];
    }

    const source =
      specInfo.json as unknown as TalentData;

    const versions =
      source[selectedSpec];

    return Array.isArray(versions)
      ? versions
      : [];
  }, [
    selectedClass,
    selectedSpec,
  ]);

  const getTalentNames = (): string[] => {
    if (
      !tree ||
      !selectedSpec
    ) {
      return [];
    }

    const versions =
      tree[selectedSpec];

    if (!Array.isArray(versions)) {
      return [];
    }

    const names = new Set<string>();

    versions.forEach(version => {
      Object.values(
        version.talents || {},
      ).forEach(talent => {
        if (talent?.name) {
          names.add(talent.name);
        }
      });
    });

    return Array.from(names);
  };

  const loadVersion = () => {
    if (
      !selectedClass ||
      !selectedSpec
    ) {
      return;
    }

    const sourceTree =
      getTalentTree(
        selectedClass,
        selectedSpec,
      );

    if (!sourceTree) {
      return;
    }

    const normalized =
      normalizeTree({
        [selectedSpec]:
          sourceTree,
      });

    const versions =
      normalized[selectedSpec];

    if (
      !Array.isArray(versions) ||
      versions.length === 0
    ) {
      return;
    }

    let version =
      getTalentVersion();

    if (
      version < 0 ||
      version >= versions.length
    ) {
      version =
        versions.length - 1;

      setTalentVersion(
        String(version),
      );
    }

    setSelectedVersion(
      String(version),
    );

    setTree(normalized);
    setSelectedTalent(null);

    setTreeSession(
      current => current + 1,
    );
  };

  const updateTalent = (
    talent: Talent,
    update: Partial<Talent>,
  ) => {
    if (
      !tree ||
      !selectedSpec ||
      selectedVersion === ""
    ) {
      return;
    }

    const versionIndex =
      Number(selectedVersion);

    const versions =
      tree[selectedSpec];

    if (!Array.isArray(versions)) {
      return;
    }

    const currentVersion =
      versions[versionIndex];

    if (!currentVersion) {
      return;
    }

    const currentTalent =
      currentVersion.talents?.[
      talent.name
      ];

    if (!currentTalent) {
      return;
    }

    const requestedName =
      update.name !== undefined
        ? String(update.name).trim()
        : currentTalent.name;

    if (!requestedName) {
      return;
    }

    const merged: Talent = {
      ...currentTalent,
      ...update,
      name: requestedName,
    };

    if (
      update.prereq !== undefined
    ) {
      const prereq =
        String(
          update.prereq,
        ).trim();

      merged.prereq =
        prereq || undefined;
    }

    if (
      update.descriptions !== undefined
    ) {
      merged.descriptions =
        Array.isArray(
          update.descriptions,
        )
          ? update.descriptions.map(
            dependency =>
              Array.isArray(
                dependency,
              )
                ? [...dependency]
                : [],
          )
          : [[""]];
    }

    merged.description =
      createDescription(
        merged,
        selectedSpec,
      );

    const nextVersions =
      versions.map(
        (version, index) => {
          if (
            index !== versionIndex
          ) {
            return version;
          }

          const nextTalents = {
            ...version.talents,
          };

          delete nextTalents[
            talent.name
          ];

          nextTalents[
            requestedName
          ] = merged;

          return {
            ...version,
            talents: nextTalents,
          };
        },
      );

    const nextTree: TalentData = {
      ...tree,
      [selectedSpec]:
        nextVersions,
    };

    setTree(nextTree);
    setSelectedTalent(merged);

    setTreeSession(
      current => current + 1,
    );
  };

  const copyTree = () => {
    if (
      !selectedClass ||
      !selectedSpec
    ) {
      return;
    }

    const savedTree =
      loadTreeFromStorage(
        selectedClass,
        selectedSpec,
      );

    if (savedTree) {
      const versions =
        savedTree[selectedSpec];

      if (
        Array.isArray(versions) &&
        versions.length > 0
      ) {
        let version =
          getTalentVersion();

        if (
          version < 0 ||
          version >= versions.length
        ) {
          version =
            versions.length - 1;

          setTalentVersion(
            String(version),
          );
        }

        setSelectedVersion(
          String(version),
        );
      }

      setTree(savedTree);
      setSelectedTalent(null);

      setTreeSession(
        current => current + 1,
      );

      return;
    }

    loadVersion();
  };

  const saveTree = () => {
    if (
      !tree ||
      !selectedClass ||
      !selectedSpec
    ) {
      return;
    }

    saveTreeToStorage(
      tree,
      selectedClass,
      selectedSpec,
    );
  };

  const loadSavedTree = () => {
    if (
      !selectedClass ||
      !selectedSpec
    ) {
      return;
    }

    const savedTree =
      loadTreeFromStorage(
        selectedClass,
        selectedSpec,
      );

    if (!savedTree) {
      return;
    }

    const versions =
      savedTree[selectedSpec];

    if (
      Array.isArray(versions) &&
      versions.length > 0
    ) {
      let version =
        getTalentVersion();

      if (
        version < 0 ||
        version >= versions.length
      ) {
        version =
          versions.length - 1;

        setTalentVersion(
          String(version),
        );
      }

      setSelectedVersion(
        String(version),
      );
    }

    setTree(savedTree);
    setSelectedTalent(null);

    setTreeSession(
      current => current + 1,
    );
  };

  return (
    <div className="Editor">
      <div className="Editor-source">
        <div className="Editor-source-field">
          <label htmlFor="editor-class">
            Class
          </label>

          <select
            id="editor-class"
            value={selectedClass}
            onChange={event => {
              const value =
                event.target.value;

              setSelectedClass(value);
              setSelectedSpec("");
              setSelectedVersion("");
              setTree(null);
              setSelectedTalent(null);
            }}
          >
            <option value="">
              Select class...
            </option>

            {Object.keys(
              classSpecs,
            ).map(className => (
              <option
                key={className}
                value={className}
              >
                {className}
              </option>
            ))}
          </select>
        </div>

        <div className="Editor-source-field">
          <label htmlFor="editor-spec">
            Specialization
          </label>

          <select
            id="editor-spec"
            value={selectedSpec}
            disabled={!selectedClass}
            onChange={event => {
              const value =
                event.target.value;

              setSelectedSpec(value);
              setSelectedVersion("");
              setTree(null);
              setSelectedTalent(null);
            }}
          >
            <option value="">
              Select specialization...
            </option>

            {selectedClass &&
              classSpecs[
                selectedClass as keyof typeof classSpecs
              ].map(spec => (
                <option
                  key={spec.spec}
                  value={spec.spec}
                >
                  {spec.spec}
                </option>
              ))}
          </select>
        </div>

        <div className="Editor-source-field">
          <label htmlFor="editor-version">
            Version
          </label>

          <select
            id="editor-version"
            value={selectedVersion}
            disabled={!selectedSpec}
            onChange={event => {
              const value =
                event.target.value;

              if (value === "") {
                setSelectedVersion("");
                setSelectedTalent(null);
                return;
              }

              setTalentVersion(value);
              setSelectedVersion(value);
              setSelectedTalent(null);

              if (tree) {
                setTreeSession(
                  current =>
                    current + 1,
                );
              }
            }}
          >
            <option value="">
              Select version...
            </option>

            {availableVersions.map(
              (version, index) => (
                <option
                  key={`${selectedSpec}-${index}`}
                  value={index}
                >
                  {version.background ||
                    `Version ${index + 1}`}
                </option>
              ),
            )}
          </select>
        </div>

        <button
          className="Editor-source-button"
          type="button"
          onClick={copyTree}
          disabled={
            !selectedClass ||
            !selectedSpec
          }
        >
          Copy Tree
        </button>

        <button
          className="Editor-source-button"
          type="button"
          onClick={saveTree}
          disabled={!tree}
        >
          Save Tree
        </button>

        <button
          className="Editor-source-button"
          type="button"
          onClick={loadSavedTree}
          disabled={
            !selectedClass ||
            !selectedSpec
          }
        >
          Load Saved
        </button>
      </div>

      {tree &&
        selectedVersion !== "" && (
          <div className="Editor-workspace">
            <EditorTree
              key={`${treeSession}-${selectedVersion}`}
              tree={tree}
              className={selectedClass}
              name={selectedSpec}
              session={treeSession}
              selectedVersion={Number(
                selectedVersion,
              )}
              onEditTalent={
                setSelectedTalent
              }
            />

            {selectedTalent && (
              <TalentEditor
                talent={selectedTalent}
                talentNames={
                  getTalentNames()
                }
                onUpdate={update =>
                  updateTalent(
                    selectedTalent,
                    update,
                  )
                }
              />
            )}
          </div>
        )}
    </div>
  );
};

export default Editor;
