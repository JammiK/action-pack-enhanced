import { ActionPackAPI } from "./api.js";

export function formatNumber(val) {
    if (val === undefined || val === null) return "0";
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val}`;
}

export function getItemDetails(item) {
    const school = item.type === 'spell' ? _formatSchool(item) : '';
    const castingTime = _formatCastingTime(item);
    const range = _formatRange(item);
    const duration = _formatDuration(item);
    const materials = item.type === 'spell' ? _formatMaterials(item) : '';
    return { school, castingTime, range, duration, materials };
}

function _formatCastingTime(item) {
    const activationType = item.system?.activation?.type || "";
    const activationValue = item.system?.activation?.value || "";

    if (activationValue === "" && activationType !== "") {
        return game.i18n.localize(`action-pack-enhanced.action-type.${activationType}`);
    } else if (activationValue && activationType) {
        return `${activationValue} ${activationType.charAt(0).toUpperCase() + activationType.slice(1)}`;
    }
    return "";
}

function _formatRange(item) {
    const long = item.system?.range?.long || null;
    const units = item.system?.range?.units;
    let value;
    if(units !== "touch" && units !== "self") {
        value = item.system?.range?.value || item.system?.range?.reach || 5;
    } else {
        value = null;
    }
    if (value && long && units) return `${value} ${units} / ${long} ${units}`;
    if (value && units) return `${value} ${units}`;
    if (units) return game.i18n.localize(`action-pack-enhanced.range.${units}`);
    return "";
}

function _formatDuration(item) {
    const value = item.system?.duration?.value;
    const units = item.system?.duration?.units;
    if (value && units) return `${value} ${value > 1 ? units + 's' : units}`;
    if (units) return game.i18n.localize(`action-pack-enhanced.duration.${units}`);
    return "";
}

function _formatMaterials(item) {
    const materials = item.system?.materials?.value;
    if (materials) return materials;
    return "";
}

function _formatSchool(item) {
    if (item.labels?.school) {
        return item.labels.school;
    }
    const school = item.system?.school;
    if (school) {
        const config = CONFIG.DND5E.spellSchools[school];
        return config ? (config.label || config) : school;
    }
    return "";
}

/**
 * Build the damage / healing descriptor for an item's first damaging activity,
 * optionally scaled to a spell-slot level. Used to render the D&D Beyond style dice
 * label beneath an item name. Only leveled spells cast above their base level are
 * scaled; weapons, features and cantrips show their current (system computed) dice.
 *
 * @param {Item5e} item          The item (spell, weapon or feature).
 * @param {number} [castLevel]   The spell-slot level the row represents.
 * @returns {{formula: string, typeKey: string, typeLabel: string, kind: string}[]}
 */
export function getDamageParts(item, castLevel) {
    const activities = item?.system?.activities;
    const list = activities?.contents ?? (activities ? [...activities] : []);
    if (!list.length) return [];

    const isSpell = item.type === "spell";
    const baseLevel = isSpell ? (item.system?.level ?? 0) : 0;
    const increase = (isSpell && baseLevel > 0 && Number.isFinite(castLevel))
        ? Math.max(0, castLevel - baseLevel)
        : 0;

    for (const activity of list) {
        const parts = increase
            ? _scaledDamageParts(activity, increase, item)
            : _baseDamageParts(activity, item);
        if (parts.length) return parts;
    }
    return [];
}

// Unscaled label: prefer the system's precomputed labels (these already reflect
// cantrip scaling and ability-mod bonuses) and fall back to the raw damage parts.
function _baseDamageParts(activity, item) {
    const labels = activity?.labels?.damages ?? activity?.labels?.damage;
    if (Array.isArray(labels) && labels.length) {
        const described = labels
            .filter(label => label?.formula)
            .map(label => _describeDamage(label.formula, label.damageType));
        if (described.length) return described;
    }
    return _scaledDamageParts(activity, 0, item);
}

// Scaled label: ask each damage / healing part for its formula at the given increase.
function _scaledDamageParts(activity, increase, item) {
    const sources = [...(activity?.damage?.parts ?? [])];
    if (activity?.healing?.formula || activity?.healing?.number) sources.push(activity.healing);

    const parts = [];
    for (const source of sources) {
        const formula = _resolvePartFormula(source, increase, item);
        if (formula) parts.push(_describeDamage(formula, _damageTypeKey(source)));
    }
    return parts;
}

function _resolvePartFormula(part, increase, item) {
    try {
        let formula = (increase && typeof part.scaledFormula === "function")
            ? part.scaledFormula(increase)
            : part.formula;
        if (!formula) return "";
        if (formula.includes("@")) {
            const rollData = item.getRollData?.() ?? {};
            formula = Roll.replaceFormulaData(formula, rollData, { missing: "0" });
        }
        return formula;
    } catch (err) {
        console.warn("Action Pack Enhanced | unable to scale damage formula", err);
        return "";
    }
}

function _simplifyDamageFormula(formula) {
    const simplify = globalThis.dnd5e?.dice?.simplifyRollFormula;
    if (typeof simplify === "function") {
        try { return simplify(formula, { preserveFlavor: false }); } catch (err) { /* fall through */ }
    }
    return String(formula).replace(/\s+/g, " ").trim();
}

function _damageTypeKey(part) {
    if (part?.types?.size) return [...part.types][0];
    if (Array.isArray(part?.types) && part.types.length) return part.types[0];
    return part?.damageType ?? "";
}

function _describeDamage(formula, typeKey) {
    const config = CONFIG.DND5E.damageTypes?.[typeKey] ?? CONFIG.DND5E.healingTypes?.[typeKey];
    const typeLabel = config?.label ? config.label.toLowerCase() : "";
    let kind = "damage";
    if (typeKey === "healing") kind = "healing";
    else if (typeKey === "temphp") kind = "temphp";
    return { formula: _simplifyDamageFormula(formula), typeKey: typeKey || "", typeLabel, kind };
}

/**
 * Determine the spell-slot levels at which a spell can be cast for a given actor — its
 * base level plus every higher level the actor has slots for. Used to list an
 * upcastable spell once per castable level.
 *
 * @param {Item5e} item     A spell item.
 * @param {Actor5e} [actor] The casting actor (defaults to the item's owner).
 * @returns {number[]}      Ascending slot levels (base first); empty for non-upcastable spells.
 */
export function validUpcastLevels(item, actor = item?.actor) {
    if (item?.type !== "spell" || !actor) return [];

    const baseLevel = item.system?.level ?? 0;
    if (baseLevel < 1) return []; // cantrips scale by character level, not by slot

    const activity = item.system.activities?.find?.(a => a.canScale)
        ?? item.system.activities?.contents?.[0];
    const canScale = activity?.canScale ?? true;
    if (!canScale) return [baseLevel];

    const levels = new Set([baseLevel]);
    for (const [key, slot] of Object.entries(actor.system.spells ?? {})) {
        if (!slot?.max) continue;
        // Only numbered slot pools ("spell1".."spell9"); pact magic is shown in its own group.
        const match = /^spell(\d+)$/.exec(key);
        if (!match) continue;
        const level = Number(match[1]);
        if (level > baseLevel) levels.add(level);
    }
    return [...levels].sort((a, b) => a - b);
}

export function generateRaceClassDisplay(actor) {
    // in the format (Human - Wizard [Abjurer], Fighter [Defense])
    let raceClass = {};
    let races = actor.itemTypes.race;
    let classes = actor.itemTypes.class;
    let subClasses = actor.itemTypes.subclass;
    const level = actor.system.details.level;
    // const useCustomIcons = game.settings.get("action-pack-enhanced", "use-custom-icons") || false;
    
    if (classes.length === subClasses.length) {
        let obj = {race: `<span>${races[0]?.name} - ${level}</span>` || "Unknown", classes: []};
        for (let i = 0; i < classes.length; i++) {
            obj.classes[i] = {name: classes[i].name, level: classes[i].system.levels, subclass: {name: subClasses[i].name}};
        }
        raceClass = obj;
    } else {
        let obj = {race: `<span>${races[0]?.name} - ${level}</span>` || "Unknown", classes: []};
        for (let i = 0; i < classes.length; i++) {
            obj.classes[i] = {name: classes[i].name, level: classes[i].system.levels, subclass: {name: ''}};
            //  find the matching subclass for the class
            for(let j = 0; j < subClasses.length; j++) {
                if (subClasses[j].system.class === classes[i].name) {
                    obj.classes[i].subclass.name = subClasses[j].name;
                }
            }
        }
        raceClass = obj;
    }

    // if(useCustomIcons) {
    //     if(classes.length === subClasses.length) {
    //         raceClass.classes.forEach((element, i) => {
    //             element.icon = `/modules/action-pack-enhanced/images/classes/${element.name.toLowerCase()}.png`;
    //             if(element.subclass.name !== '') {
    //                 element.subclass.icon = `/modules/action-pack-enhanced/images/classes/${element.name.toLowerCase()}/${element.subclass.name.replace(/ /g, '-').toLowerCase()}.png`;
    //             }
    //         });
    //     } else {
    //         raceClass.classes.forEach((element, i) => {
    //             element.icon = `/modules/action-pack-enhanced/images/classes/${element.name.toLowerCase()}.png`;
    //             if(element.subclass.name !== '') {
    //                 element.subclass.icon = `/modules/action-pack-enhanced/images/classes/${element.name.toLowerCase()}/${element.subclass.name.replace(/ /g, '-').toLowerCase()}.png`;
    //             }
    //         });
    //     }
    // } else {
        // use the img key on the class and subclass objects
        if(classes.length === subClasses.length) {
            classes.forEach((element, i) => {
                raceClass.classes[i].icon = element.img;
                raceClass.classes[i].subclass.icon = element.subclass.img;
            });
        } else {
            classes.forEach((element, i) => {
                raceClass.classes[i].icon = element.img;
                if(raceClass.classes[i].subclass.name !== '') {
                    subClasses.forEach((subClass) => {
                        if (subClass.system.class === element.name) {
                            raceClass.classes[i].subclass.icon = subClass.img;
                        }
                    });
                }
            });
        }
    // }

    let raceClassText = `${raceClass.race}`;
    let classIcons = [];
    for (let i = 0; i < raceClass.classes.length; i++) {
        let iconSrc = '';
        let iconAlt = '';
        if (raceClass.classes[i].subclass.name !== '' ) {
            iconSrc = raceClass.classes[i].subclass.icon;
            iconAlt = `${raceClass.classes[i].subclass.name} ${raceClass.classes[i].name} (${raceClass.classes[i].level})`;
        } else {
            iconSrc = raceClass.classes[i].icon;
            iconAlt = `${raceClass.classes[i].name} (${raceClass.classes[i].level})`;
        }
        classIcons.push(`<img class="ape-actor-class-icon" src="${iconSrc}" title="${iconAlt}">`);
    }
    return raceClassText + `<span class="ape-actor-class-icons">${classIcons.join('')}</span>`;
}

// From Illandril's NPC Quick Actions by Joe Spandrusyszyn

export const calculateUsesForItem = (item) => {
    const itemData = item.system;
    const consume = itemData.consume;
    if (consume && consume.target) {
        return calculateConsumeUses(item.actor, consume);
    }
    const uses = itemData.uses;
    if (uses && (uses.max > 0 || uses.value > 0)) {
        return calculateLimitedUses(itemData);
    }

    const itemType = item.type;
    if (itemType === 'feat') {
        return calculateFeatUses(itemData);
    } else if (itemType === 'consumable') {
        return {
            available: itemData.quantity,
        };
    // } else if (itemType === 'spell') {
    //     return calculateSpellUses(item);
    } else if (itemType === 'weapon') {
        return calculateWeaponUses(itemData);
    }
    return null;
};

function calculateConsumeUses(actor, consume) {
    let available = null;
    let maximum = null;
    if (consume.type === 'attribute') {
        const value = getProperty(actor.system, consume.target);
        if (typeof value === 'number') {
            available = value;
        } else {
            available = 0;
        }
    } else if (consume.type === 'ammo' || consume.type === 'material') {
        const targetItem = actor.items.get(consume.target);
        if (targetItem) {
            available = targetItem.system.quantity;
        } else {
            available = 0;
        }
    } else if (consume.type === 'charges') {
        const targetItem = actor.items.get(consume.target);
        if (targetItem) {
            ({ available, maximum } = calculateLimitedUses(targetItem.system));
        } else {
            available = 0;
        }
    }
    if (available !== null) {
        if (consume.amount > 1) {
            available = Math.floor(available / consume.amount);
            if (maximum !== null) {
                maximum = Math.floor(maximum / consume.amount);
            }
        }
        return { available, maximum };
    }
    return null;
}

function calculateLimitedUses(itemData) {
    let available = itemData.uses.value;
    let maximum = itemData.uses.max;
    const quantity = itemData.quantity;
    if (quantity) {
        available = available + (quantity - 1) * maximum;
        maximum = maximum * quantity;
    }
    return { available, maximum };
}

function calculateFeatUses(itemData) {
    // if (itemData.recharge && itemData.recharge.value) {
    //     return { available: itemData.recharge.charged ? 1 : 0, maximum: 1 };
    // }
    return null;
}

function calculateSpellUses(item) {
    const itemData = item.system;
    const actorData = item.actor.system;
    let available = null;
    let maximum = null;
    const preparationMode = itemData.preparation.mode;
    if (preparationMode === 'pact') {
        available = actorData.spells['pact'].value;
        maximum = actorData.spells['pact'].max;
    } else if (preparationMode === 'innate' || preparationMode === 'atwill') {
        // None
    } else {
        let level = itemData.level;
        if (level > 0) {
            available = actorData.spells['spell' + level].value;
            maximum = actorData.spells['spell' + level].max;
        }
    }
    if (available === null) {
        return null;
    } else {
        return { available, maximum };
    }
}

function calculateWeaponUses(itemData) {
    // If the weapon is a thrown weapon, but not a returning weapon, show quantity
    if (itemData.properties.thr && !itemData.properties.ret) {
        return { available: itemData.quantity, maximum: null };
    }
    return null;
}
