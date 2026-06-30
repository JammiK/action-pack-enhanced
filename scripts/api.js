import { formatNumber } from "./utils.js";

export class ActionPackAPI {
    constructor() {
        this.masteryRules = {
            "Fighter": { 
                type: "table", 
                values: [
                    {"level": 1, "mastery": 3},
                    {"level": 2, "mastery": 3},
                    {"level": 3, "mastery": 3},
                    {"level": 4, "mastery": 4},
                    {"level": 5, "mastery": 4},
                    {"level": 6, "mastery": 4},
                    {"level": 7, "mastery": 4},
                    {"level": 8, "mastery": 4},
                    {"level": 9, "mastery": 4},
                    {"level": 10, "mastery": 5},
                    {"level": 11, "mastery": 5},
                    {"level": 12, "mastery": 5},
                    {"level": 13, "mastery": 5},
                    {"level": 14, "mastery": 5},
                    {"level": 15, "mastery": 5},
                    {"level": 16, "mastery": 6},
                    {"level": 17, "mastery": 6},
                    {"level": 18, "mastery": 6},
                    {"level": 19, "mastery": 6},
                    {"level": 20, "mastery": 6}
                ]
            },
            "Barbarian": {
                type: "table",
                values: [
                    {"level": 1, "mastery": 2},
                    {"level": 2, "mastery": 2},
                    {"level": 3, "mastery": 2},
                    {"level": 4, "mastery": 3},
                    {"level": 5, "mastery": 3},
                    {"level": 6, "mastery": 3},
                    {"level": 7, "mastery": 3},
                    {"level": 8, "mastery": 3},
                    {"level": 9, "mastery": 3},
                    {"level": 10, "mastery": 4},
                    {"level": 11, "mastery": 4},
                    {"level": 12, "mastery": 4},
                    {"level": 13, "mastery": 4},
                    {"level": 14, "mastery": 4},
                    {"level": 15, "mastery": 4},
                    {"level": 16, "mastery": 4},
                    {"level": 17, "mastery": 4},
                    {"level": 18, "mastery": 4},
                    {"level": 19, "mastery": 4},
                    {"level": 20, "mastery": 4}
                ]
            },
            "Ranger": { type: "constant", value: 2 },
            "Rogue": { type: "constant", value: 2 },
            "Paladin": { type: "constant", value: 2 }
        };
    }

    /**
     * Updates an actor's HP
     * @param {Actor} actor 
     * @param {number} value 
     */
    async updateHP(actor, value) {
        if (!actor) return;
        return actor.update({ "system.attributes.hp.value": value });
    }

    /**
     * Updates an actor's Temp HP
     * @param {Actor} actor 
     * @param {number} value 
     */
    async updateTempHP(actor, value) {
        if (!actor) return;
        return actor.update({ "system.attributes.hp.temp": value });
    }

    /**
     * Updates an actor's XP
     * @param {Actor} actor 
     * @param {number} value 
     */
    async updateXP(actor, value) {
        if (!actor) return;
        return actor.update({ "system.details.xp.value": value });
    }

    /**
     * Performs a Short Rest
     * @param {Actor} actor 
     */
    async shortRest(actor) {
        if (!actor) return;
        return actor.shortRest();
    }

    calculateMaxMasteries(actor) {
        let maxMasteries = 1; // Default for "Weapon Master" feat if no class has it

        for (const cls of actor.itemTypes.class) {
            const rule = this.masteryRules[cls.name];
            if (rule) {
                let count = 0;
                if (rule.type === "constant") {
                    count = rule.value;
                } else if (rule.type === "table") {
                    const level = cls.system.levels;
                    const entry = rule.values.find(v => v.level === level);
                    count = entry ? entry.mastery : 0;
                }

                if (count > maxMasteries) {
                    maxMasteries = count;
                }
            }
        }
        return maxMasteries;
    }

    /**
     * Performs a Long Rest
     * @param {Actor} actor 
     */
    async longRest(actor) {
        if (!actor) return;
        
        // 1. Perform the standard Long Rest
        const result = await actor.longRest();

        // 2. Check for WM5e Module
        const wm5eActive = game.modules.get('wm5e') && game.modules.get("wm5e")?.active;

        if (wm5eActive && actor.itemTypes.feat.find(f => f.name === "Weapon Mastery" || f.name === "Weapon Master")) {

            // 3. Gather Unique Mastery Choices
            await actor.setFlag("action-pack-enhanced", "masterySelectionPending", true);

            const availableWeapons = actor.itemTypes.weapon.filter(w => w.name !== "Unarmed Strike");
            const choices = new Map();

            const currentMasteries = actor.system.traits.weaponProf.mastery.value;

            availableWeapons.forEach(w => {
                const mastery = w.system.mastery;
                const baseItem = w.system.type?.baseItem;
                
                if (mastery && baseItem && !choices.has(baseItem)) {
                    choices.set(baseItem, {
                        id: baseItem,
                        label: baseItem.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        masteryLabel: CONFIG.DND5E.weaponMasteries[mastery]?.label || mastery,
                        selected: currentMasteries.find(m => m === baseItem)
                    });
                }
            });

            // 4. Logic Branch
            // 4. Calculate Max Masteries
            const maxMasteries = this.calculateMaxMasteries(actor);
            await this.promptMasterySelection(actor, choices, maxMasteries);
        } else {
            // If module not active, just ensure we are locked (not pending)
            await actor.setFlag("action-pack-enhanced", "masterySelectionPending", false);
            // 2. Clear Weapon Mastery selection to prevent chat log clutter
            await actor.update({ "system.traits.weaponProf.mastery.value": [] });
        }

        return result;
    }

    async promptMasterySelection(actor, choices, maxMasteries) {
        const { DialogV2 } = foundry.applications.api;
        
        let content = `<p>Select up to ${maxMasteries} ${maxMasteries === 1 ? "weapon" : "weapons"} to use ${maxMasteries === 1 ? "its" : "their"} weapon mastery for the day:</p>`;
        content += `<form class="ape-mastery-dialog">`;
        
        for (const [id, data] of choices) {
            content += `
            <div class="ape-mastery-switch form-group">
                <input id="${id}" class="ape-mastery-checkbox" type="checkbox" name="mastery" value="${id}" data-dtype="String" ${data.selected ? "checked" : ""}>
                <label for="${id}" class="ape-mastery-label">${data.label} (${data.masteryLabel})</label>
            </div>`;
        }
        content += `</form>`;
        
        // Add script for interactivity (limit selection)
        content += `
        <script>
            (function() {
                const form = document.querySelector('.ape-mastery-dialog');
                if (!form) return;
                const inputs = form.querySelectorAll('input[name="mastery"]');
                const max = ${maxMasteries};
                
                function updateState() {
                    const checked = Array.from(inputs).filter(i => i.checked);
                    inputs.forEach(i => {
                        if (!i.checked) {
                            i.disabled = checked.length >= max;
                        } else {
                            i.disabled = false;
                        }
                    });
                }
                
                inputs.forEach(i => i.addEventListener('change', updateState));
                updateState(); // Initial check
            })();
        </script>
        `;

        return DialogV2.wait({
            window: { title: "Weapon Mastery Selection" },
            content: content,
            buttons: [{
                action: "update",
                label: "Update",
                default: true,
                callback: async (event, button, dialog) => {
                    const selected = [];
                    // Use dialog.element to scope the query
                    dialog.element.querySelectorAll('input[name="mastery"]:checked').forEach(el => {
                        selected.push(el.value);
                    });

                    if (selected.length > maxMasteries) {
                        ui.notifications.warn(`You selected more than ${maxMasteries} masteries. Only the first ${maxMasteries} will be applied.`);
                        selected.splice(maxMasteries);
                    }

                    // Update actor data via update() first
                    await actor.update({ "system.traits.weaponProf.mastery.value": selected });
                    
                    await actor.setFlag("action-pack-enhanced", "masterySelectionPending", false);
                    return true; 
                }
            }, {
                action: "cancel",
                label: "Cancel",
                callback: async () => {
                    await actor.setFlag("action-pack-enhanced", "masterySelectionPending", false);
                    return false;
                }
            }],
            submit: (event) => {
                // Default submit handler if Enter is pressed in a single input form, but we have multiple.
                // DialogV2 handles buttons nicely.
            }
        });
    }

    /**
     * Toggles a Weapon Mastery selection
     * @param {Actor} actor 
     * @param {string} masteryId 
     */
    async toggleMastery(actor, masteryId) {
        if (!actor || !masteryId) return;

        const currentMasteries = new Set(actor.system.traits?.weaponProf?.mastery?.value || []);
        
        if (currentMasteries.has(masteryId)) {
            currentMasteries.delete(masteryId);
        } else {
            if (currentMasteries.size >= 2) {
                ui.notifications.warn("You can only select up to 2 Weapon Masteries.");
                return;
            }
            currentMasteries.add(masteryId);
        }

        return actor.update({ "system.traits.weaponProf.mastery.value": Array.from(currentMasteries) });
    }

    /**
     * Locks Weapon Mastery selection
     * @param {Actor} actor 
     */
    async lockMasteries(actor) {
        if (!actor) return;
        return actor.setFlag("action-pack-enhanced", "masterySelectionPending", false);
    }

    /**
     * Rolls Initiative for the actor in the current combat
     * @param {Actor} actor 
     */
    async rollInitiative(actor) {
        if (!game.combat) return;
        const combatant = game.combat.combatants.find(c => c.actor === actor);
        if (combatant) {
            return game.combat.rollInitiative([combatant.id]);
        }
    }

    /**
     * End the current turn
     */
    async endTurn() {
        if (game.combat) {
            return game.combat.nextTurn();
        }
    }

    /**
     * Opens the Actor Sheet
     * @param {Actor} actor 
     */
    openSheet(actor) {
        if (actor) {
            actor.sheet.render(true);
        }
    }

    /**
     * Rolls a Death Saving Throw
     * @param {Actor} actor 
     */
    async rollDeathSave(actor, event) {
        return actor.rollDeathSave({ event });
    }

    /**
     * Rolls an Ability Check
     * @param {Actor} actor 
     * @param {string} abilityId 
     */
    async rollAbilityCheck(actor, abilityId, event) {
        return actor.rollAbilityCheck({ event, ability: abilityId });
    }

    /**
     * Rolls a Saving Throw
     * @param {Actor} actor 
     * @param {string} abilityId 
     */
    async rollSavingThrow(actor, abilityId, event) {
        return actor.rollSavingThrow({ event, ability: abilityId });
    }

    /**
     * Rolls a Skill
     * @param {Actor} actor 
     * @param {string} skillId 
     * @param {boolean} fastForward 
     */
    async rollSkill(actor, skillId, event, fastForward = false) {
        return actor.rollSkill({ event, skill: skillId }, { fastForward });
    }

    /**
     * Adjusts Spell Slots
     * @param {Actor} actor 
     * @param {string} groupName 
     * @param {number} slotIndex 
     */
    async adjustSpellSlot(actor, groupName, slotIndex) {
        const slot = slotIndex + 1;
        const current = actor.system.spells?.[groupName]?.value;
        if (current !== undefined) {
            const key = `system.spells.${groupName}.value`;
            const newValue = current !== slot ? slot : slot - 1;
            return actor.update({ [key]: newValue });
        }
    }

    /**
     * Rolls an Item
     * @param {Item} item
     * @param {Event} [event]
     * @param {number} [castLevel] Spell slot level to pre-select in the cast dialog
     */
    async rollItem(item, event, castLevel) {
        if (!item) return;

        // Item Macro Support
        if (!game.modules.get("wire")?.active && game.modules.get("itemacro")?.active && game.settings.get("itemacro", "defaultmacro")) {
            if (item.hasMacro()) {
                item.executeMacro();
                return;
            }
        }

        // When the row represents an upcast level, open the cast dialog with that
        // higher spell slot pre-selected. Base-level rows keep the default cast flow.
        if (item.type === "spell" && item.actor && Number.isFinite(castLevel) && castLevel > (item.system?.level ?? 0)) {
            return this._castSpellAtLevel(item, castLevel, event);
        }

        return item.use({ event }, {}, {});
    }

    /**
     * Uses a spell with a given slot level pre-selected in the cast dialog. The dialog
     * is still shown so the player can confirm consumption, place a template, etc.
     * @param {Item} item
     * @param {number} castLevel
     * @param {Event} [event]
     */
    async _castSpellAtLevel(item, castLevel, event) {
        const activities = item.system?.activities;
        const activity = activities?.find?.(a => a.canUse) ?? activities?.contents?.[0];
        if (!activity) return item.use({ event }, {}, {});

        // The cast dialog matches against the actor's spell slot keys ("spell4", "pact"),
        // not a bare number, so map the level to the right key.
        const spells = item.actor.system.spells ?? {};
        let slotKey = `spell${castLevel}`;
        if (!spells[slotKey]) {
            const match = Object.entries(spells).find(([, slot]) => slot?.level === castLevel && slot?.max);
            if (match) slotKey = match[0];
        }

        return activity.use({ event, spell: { slot: slotKey } }, { configure: true }, {});
    }

    /**
     * Rolls Item Recharge
     * @param {Item} item 
     */
    async rollRecharge(item) {
        return item.system.uses.rollRecharge();
    }

    /**
     * Gets Item Chat Data for Description
     * @param {Item} item 
     */
    async getItemDescription(item) {
        const chatData = await item.getChatData({ secrets: item.actor.isOwner });
        
        // Helper to format properties
        const activationType = item.system?.activation?.type || "";
        const activationValue = item.system?.activation?.value || "";
        
        let castingTime = "";
        if (activationValue === "") {
            castingTime = activationType.charAt(0).toUpperCase() + activationType.slice(1);
        } else if (activationValue && activationType) {
            castingTime = `${activationValue} ${activationType.charAt(0).toUpperCase() + activationType.slice(1)}`;
        }

        return {
            description: chatData.description,
            properties: {
                castingTime,
                range: this._formatRange(item),
                duration: this._formatDuration(item)
            }
        };
    }

    /**
     * Toggles inspiration on an actor
     * @param {Actor} actor 
     */
    async toggleInspiration(actor) {
        if (!actor) return;
        return actor.update({ "system.attributes.inspiration": !actor.system.attributes.inspiration });
    }

    _formatRange(item) {
        const value = item.system?.range?.value;
        const units = item.system?.range?.units;
        if (value && units) return `${value} ${units}`;
        if (units) return units;
        return "";
    }

    _formatDuration(item) {
        const value = item.system?.duration?.value;
        const units = item.system?.duration?.units;
        if (value && units) return `${value} ${units}`;
        if (units) return units === "inst" ? "Instantaneous" : units;
        return "";
    }

    /**
     * Sets a weapon set item
     * @param {Actor} actor 
     * @param {number} setIndex 
     * @param {string} slot 'main' or 'off'
     * @param {string} itemUuid 
     */
    async setWeaponSetItem(actor, setIndex, slot, itemUuid, rarity) {
        if (!actor) return;
        const sets = actor.getFlag("action-pack-enhanced", "weaponSets") || [];
        // Ensure sets structure exists up to this index
        for (let i = 0; i <= setIndex; i++) {
            if (!sets[i]) sets[i] = { main: null, off: null, active: false };
        }

        // Validate Item Constraints
        const newItem = fromUuidSync(itemUuid);
        if (newItem) {
            const otherSlot = slot === 'main' ? 'off' : 'main';
            const otherItemUuid = sets[setIndex][otherSlot];
            const errors = [];

            // Quantity Check: Cannot equip same item twice if quantity is 1
            if (otherItemUuid === itemUuid && newItem.system?.quantity === 1) {
                errors.push(game.i18n.localize("action-pack-enhanced.warning.quantity-limit") || "Not enough quantity to equip in both slots.");
            }

            // Two-Handed Restriction
            if (newItem.system.properties?.has("two")) {
                if (otherItemUuid) {
                    const otherItem = fromUuidSync(otherItemUuid);
                    if (otherItem && otherItem.system.properties?.has("two")) {
                        errors.push(game.i18n.localize("action-pack-enhanced.warning.two-handed") || "You cannot have two two-handed weapons in the same set.");
                    }
                }
            }

            if (errors.length > 0) {
                errors.forEach(err => ui.notifications.warn(err));
                return;
            }
        }

        sets[setIndex][slot] = itemUuid;
        await actor.setFlag("action-pack-enhanced", "weaponSets", sets);

        // If this set is active, re-equip to ensure the new item is equipped
        if (sets[setIndex].active) {
            return this.equipWeaponSet(actor, setIndex);
        }
    }

    /**
     * Clears a weapon set item
     * @param {Actor} actor 
     * @param {number} setIndex 
     * @param {string} slot 'main' or 'off'
     */
    async clearWeaponSetItem(actor, setIndex, slot) {
        if (!actor) return;
        const sets = actor.getFlag("action-pack-enhanced", "weaponSets") || [];
        if (sets[setIndex]) {
            sets[setIndex][slot] = null;
            // If set is now empty, mark inactive
            if (!sets[setIndex].main && !sets[setIndex].off) {
                sets[setIndex].active = false;
            }
            return actor.setFlag("action-pack-enhanced", "weaponSets", sets);
        }
    }

    /**
     * Equips a weapon set
     * @param {Actor} actor 
     * @param {number} setIndex 
     */
    async equipWeaponSet(actor, setIndex) {
        if (!actor) return;
        const sets = actor.getFlag("action-pack-enhanced", "weaponSets");
        if (!sets || !sets[setIndex]) return;

        const targetSet = sets[setIndex];
        
        // Prevent equipping empty sets
        if (!targetSet.main && !targetSet.off) return;

        // Update active state in flags
        const newSets = sets.map((s, i) => ({ ...s, active: i === setIndex }));
        await actor.setFlag("action-pack-enhanced", "weaponSets", newSets);

        const updates = [];

        // Get all weapons
        const weapons = actor.itemTypes.weapon.filter(w => w.name !== "Unarmed Strike");
        // get shield if actor has one
        const shield = actor.itemTypes.equipment.find(e => e.name.includes("Shield"));
        if (shield) {
            weapons.push(shield);
        }
        
        // Determine items to equip
        const itemsToEquip = new Set();
        if (targetSet.main) itemsToEquip.add(targetSet.main);
        if (targetSet.off) itemsToEquip.add(targetSet.off);

        for (const weapon of weapons) {
            const shouldBeEquipped = itemsToEquip.has(weapon.uuid);
            if (weapon.system.equipped !== shouldBeEquipped) {
                updates.push({ _id: weapon.id, "system.equipped": shouldBeEquipped });
            }
        }

        if (updates.length > 0) {
            await actor.updateEmbeddedDocuments("Item", updates);
        }
    }
}
