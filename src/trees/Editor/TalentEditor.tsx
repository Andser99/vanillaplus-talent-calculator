import React from "react";
import { Talent } from "../../TalentContext/types";

interface Props {
    talent: Talent;
    talentNames: string[];
    onUpdate: (update: Partial<Talent>) => void;
}

type EditableTalent = Talent & {
    pos?: string;
    position?: string;
    cast_time?: string | number;
    castTime?: string | number;
    cooldown?: string | number;
};

export const TalentEditor: React.FC<Props> = ({
    talent,
    talentNames,
    onUpdate,
}) => {
    const editable = talent as EditableTalent;

    const maxRank = Math.max(
        1,
        Number(talent.maxRank || 1),
    );

    const descriptions =
        Array.isArray(talent.descriptions) &&
            talent.descriptions.length > 0
            ? talent.descriptions
            : [
                Array.from(
                    { length: maxRank },
                    () => "",
                ),
            ];

    const castTime =
        editable.castTime ??
        editable.cast_time ??
        "";

    const cooldown =
        editable.cooldown ?? "";

    const updatePrereq = (value: string) => {
        const next = value.trim();

        onUpdate({
            prereq: next || undefined,
        });
    };

    const updateDescription = (
        dependencyIndex: number,
        rankIndex: number,
        value: string,
    ) => {
        const nextDescriptions = descriptions.map(
            dependency => [...dependency],
        );

        while (
            nextDescriptions.length <= dependencyIndex
        ) {
            nextDescriptions.push([]);
        }

        while (
            nextDescriptions[dependencyIndex].length <=
            rankIndex
        ) {
            nextDescriptions[dependencyIndex].push("");
        }

        nextDescriptions[dependencyIndex][rankIndex] =
            value;

        onUpdate({
            descriptions: nextDescriptions,
        });
    };

    const addRank = () => {
        onUpdate({
            maxRank: maxRank + 1,
            descriptions: descriptions.map(
                dependency => [...dependency, ""],
            ),
        });
    };

    const removeRank = () => {
        if (maxRank <= 1) {
            return;
        }

        onUpdate({
            maxRank: maxRank - 1,
            descriptions: descriptions.map(
                dependency => dependency.slice(0, -1),
            ),
        });
    };

    const addDependencyDescription = () => {
        onUpdate({
            descriptions: [
                ...descriptions.map(
                    dependency => [...dependency],
                ),
                Array.from(
                    { length: maxRank },
                    () => "",
                ),
            ],
        });
    };

    const removeDependencyDescription = (
        dependencyIndex: number,
    ) => {
        if (descriptions.length <= 1) {
            return;
        }

        onUpdate({
            descriptions: descriptions.filter(
                (_, index) =>
                    index !== dependencyIndex,
            ),
        });
    };

    return (
        <aside className="Editor-panel">
            <div className="Editor-panel-header">
                <h2>{talent.name}</h2>
            </div>

            <div className="Editor-panel-columns">
                <div className="Editor-properties-column">
                    <div className="Editor-fields">
                        <label>
                            Name
                            <input
                                value={talent.name || ""}
                                onChange={event =>
                                    onUpdate({
                                        name: event.target.value,
                                    })
                                }
                            />
                        </label>

                        <label>
                            Required Points
                            <input
                                type="number"
                                min={0}
                                value={talent.reqPoints ?? 0}
                                onChange={event =>
                                    onUpdate({
                                        reqPoints: Number(
                                            event.target.value,
                                        ),
                                    })
                                }
                            />
                        </label>

                        <label>
                            Prerequisite
                            <input
                                list="Editor-prerequisite-options"
                                value={talent.prereq ?? ""}
                                onChange={event =>
                                    updatePrereq(
                                        event.target.value,
                                    )
                                }
                            />

                            <datalist id="Editor-prerequisite-options">
                                {talentNames
                                    .filter(
                                        name =>
                                            name !== talent.name,
                                    )
                                    .map(name => (
                                        <option
                                            key={name}
                                            value={name}
                                        />
                                    ))}
                            </datalist>
                        </label>

                        <label>
                            Dependency Name
                            <input
                                list="Editor-dependency-options"
                                value={
                                    talent.dependencyName || ""
                                }
                                onChange={event =>
                                    onUpdate({
                                        dependencyName:
                                            event.target.value ||
                                            undefined,
                                    })
                                }
                            />

                            <datalist id="Editor-dependency-options">
                                {talentNames
                                    .filter(
                                        name =>
                                            name !== talent.name,
                                    )
                                    .map(name => (
                                        <option
                                            key={name}
                                            value={name}
                                        />
                                    ))}
                            </datalist>
                        </label>

                        <label>
                            Cost
                            <input
                                value={talent.cost ?? ""}
                                onChange={event =>
                                    onUpdate({
                                        cost: event.target.value,
                                    })
                                }
                            />
                        </label>

                        <label>
                            Cooldown
                            <input
                                value={cooldown}
                                onChange={event =>
                                    onUpdate({
                                        cooldown:
                                            event.target.value,
                                    })
                                }
                            />
                        </label>

                        <label>
                            Cast Time
                            <input
                                value={castTime}
                                onChange={event =>
                                    onUpdate({
                                        castTime:
                                            event.target.value,
                                    })
                                }
                            />
                        </label>

                        <label>
                            Position
                            <input
                                value={
                                    editable.pos ||
                                    editable.position ||
                                    ""
                                }
                                placeholder="e.g. 2 / 3"
                                onChange={event =>
                                    onUpdate({
                                        pos: event.target.value,
                                    })
                                }
                            />
                        </label>
                    </div>
                </div>

                <div className="Editor-ranks-column">
                    <section className="Editor-ranks">
                        <div className="Editor-section-header">
                            <h3>Ranks</h3>

                            <div className="Editor-rank-controls">
                                <button
                                    type="button"
                                    onClick={removeRank}
                                    disabled={maxRank <= 1}
                                >
                                    −
                                </button>

                                <span>{maxRank}</span>

                                <button
                                    type="button"
                                    onClick={addRank}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="Editor-description-groups">
                            {descriptions.map(
                                (
                                    dependency,
                                    dependencyIndex,
                                ) => (
                                    <div
                                        className="Editor-description-group"
                                        key={dependencyIndex}
                                    >
                                        <div className="Editor-description-group-header">
                                            <h4>
                                                Dependency{" "}
                                                {dependencyIndex +
                                                    1}
                                            </h4>

                                            {descriptions.length >
                                                1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeDependencyDescription(
                                                                dependencyIndex,
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                        </div>

                                        <div className="Editor-description-grid">
                                            {Array.from(
                                                {
                                                    length: maxRank,
                                                },
                                                (_, rankIndex) => (
                                                    <label
                                                        className="Editor-description"
                                                        key={rankIndex}
                                                    >
                                                        <span>
                                                            Rank{" "}
                                                            {rankIndex +
                                                                1}
                                                        </span>

                                                        <textarea
                                                            value={
                                                                dependency[
                                                                rankIndex
                                                                ] ||
                                                                ""
                                                            }
                                                            onChange={event =>
                                                                updateDescription(
                                                                    dependencyIndex,
                                                                    rankIndex,
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>

                        <button
                            type="button"
                            className="Editor-add-dependency"
                            onClick={
                                addDependencyDescription
                            }
                        >
                            Add Dependency Description
                        </button>
                    </section>
                </div>
            </div>
        </aside>
    );
};
