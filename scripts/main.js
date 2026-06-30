import { ActionPackDataBuilder } from "./data-builder.js";
import { ActionPackAPI } from "./api.js";
import { registerSettings } from "./settings.js";
import "./components/ape-app.js";

let lastKnownActiveActor;
let currentlyActiveActor;
let api;
let dataBuilder;

// Helper to resolve UUID
function fromUuid(uuid) {
    if (!uuid || uuid === '') return null;
    let parts = uuid.split('.');
    
    // Check if it's a compendium uuid
    if (parts[0] === 'Compendium') {
        return null; // We generally don't handle compendium UUIDs here for active actors
    }

    const [docName, docId] = parts.slice(0, 2);
    parts = parts.slice(2);
    const collection = CONFIG[docName]?.collection.instance;
    if (!collection) return null;
    let doc = collection.get(docId);

    // Embedded Documents
    while (doc && parts.length > 1) {
        const [embeddedName, embeddedId] = parts.slice(0, 2);
        doc = doc.getEmbeddedDocument(embeddedName, embeddedId);
        parts = parts.slice(2);
    }
    return doc || null;
}

export function fudgeToActor(candidate) {
    if (candidate instanceof CONFIG.Actor.documentClass) {
        return candidate;
    } else if (candidate instanceof CONFIG.Token.documentClass) {
        return candidate.object.actor;
    } else {
        // console.warn('Expected', candidate, 'to be actor');
    }
}

function updateCombatStatus() {
    const actors = canvas.tokens.controlled.map(t => t.actor);
    const app = document.querySelector('#ape-app');
    if (!app) return;

    // We can just add/remove classes on the custom element itself if we want
    if (game.combat && actors.includes(currentlyActiveActor)) {
        app.classList.add("is-current-combatant");
    } else {
        app.classList.remove("is-current-combatant");
    }
}

Hooks.on("ready", () => {
    // Mount the Lit App
    // Check if already exists to avoid duplicate on reloads if not full reload
    if (!document.querySelector('#ape-app')) {
        const app = document.createElement('ape-app');
        app.id = 'ape-app'; // Keep ID for CSS
        app.classList.add("ape-container");
        // if the taskbar module is installed, add a class to indicate that
        if (game.modules.get("foundry-taskbar")) {
            app.classList.add("has-taskbar");
        }
        // insert the app into the DOM before the element with id 'interface'
        const interfaceElement = document.getElementById('interface');
        if(interfaceElement) {
            document.body.insertBefore(app, interfaceElement);
        }   
        
        // Initialize API
        api = new ActionPackAPI();
        app.api = api;
    }

    lastKnownActiveActor = game.combat?.turns.find(c => c.id == game.combat?.current.combatantId)?.actor;
    currentlyActiveActor = lastKnownActiveActor;

    if (isTrayAlwaysOn()) {
        $('#ape-app').addClass("is-open always-on");
    }

    updateTrayState();
});

function isTrayAutoHide() {
    const config = game.settings.get("action-pack-enhanced", "tray-display");
    return config === "selected" || config === "auto";
}

function isTrayAlwaysOn() {
    const config = game.settings.get("action-pack-enhanced", "tray-display");
    return config === "always";
}

function getActiveActors() {
    const controlled = canvas.tokens.controlled.filter(t => ["character", "npc"].includes(t.actor?.type))
    if (controlled.length) {
        return controlled.map(token => token.actor);
    }
    if (game.user.character && game.settings.get("action-pack-enhanced", "assume-default-character")) {
        return [game.user.character];
    }
    return [];
}

Hooks.on("controlToken", async () => {
    updateTrayState();
});

Hooks.on("updateActor", (actor) => {
    if (getActiveActors().includes(actor)) {
        updateTray();
    }
});

function checkItemUpdate(item) {
    if (getActiveActors().includes(item.actor)) {
        updateTray();
    }
}

Hooks.on("updateItem", (item) => {
    checkItemUpdate(item);
});

Hooks.on("deleteItem", (item) => {
    checkItemUpdate(item);
});

Hooks.on("createItem", (item) => {
    checkItemUpdate(item);
});

Hooks.on("updateCombat", (combat) => {
    currentlyActiveActor = combat.turns.find(c => c.id == combat.current.combatantId)?.actor
    updateCombatStatus();
    lastKnownActiveActor = currentlyActiveActor;
});

Hooks.on("createCombatant", (combatant) => {
    if (getActiveActors().includes(combatant.actor)) {
        updateTray();
    }
});

Hooks.on("updateCombatant", (combatant, changes) => {
    if (getActiveActors().includes(combatant.actor)) {
        updateTray();
    }
});

Hooks.on("deleteCombat", (combat) => {
    if (!game.combat) {
        currentlyActiveActor = null;
        lastKnownActiveActor = null;
        updateCombatStatus();
    }
})

Hooks.on("init", () => {
    registerSettings({
        updateTray,
        updateTrayState,
        resetScroll: () => {
            const app = document.querySelector('ape-app');
            // scroll reset handled by app reactivity or re-render
        }
    });
});

Hooks.on('getSceneControlButtons', (controls) => {
    if (game.settings.get("action-pack-enhanced", "use-control-button") && !isTrayAlwaysOn()) {
        const tokenTools = controls.tokens.tools;
        if (tokenTools) {
            tokenTools.apeApp = {
                name: "apeApp",
                title: game.i18n.localize("action-pack-enhanced.control-icon"),
                icon: 'fas fa-user-shield',
                visible: true,
                onClick: () => {
                    $('#ape-app').toggleClass("is-open");
                    $('#ape-app .ape-skill-container').removeClass("is-open");
                },
                button: 1
            };
        }
    }
});

function updateTrayState() {
    const $app = $('#ape-app');
    if (isTrayAutoHide()) {
        const controlled = canvas.tokens.controlled.filter(t => ["character", "npc"].includes(t.actor?.type));
        if (controlled.length) {
            $app.addClass("is-open");
        } else {
            $app.removeClass("is-open");
        }
    }

    if (isTrayAlwaysOn()) {
        $app.addClass("is-open always-on");
    } else {
        $app.removeClass("always-on");
    }

    updateCombatStatus();
    updateTray();
}

async function updateTray() {
    if (!dataBuilder) dataBuilder = new ActionPackDataBuilder();

    const actors = getActiveActors();

    const builtData = dataBuilder.build(actors, { /* scrollPosition stub */ });

    function prefix(tgt, str) {
        return tgt ? [str, tgt].join("-") : tgt;
    }

    const iconSize = prefix(game.settings.get("action-pack-enhanced", "icon-size"), "icon");
    const traySize = prefix(game.settings.get("action-pack-enhanced", "tray-size"), "tray");
    const showSpellDots = game.settings.get("action-pack-enhanced", "show-spell-dots");
    const showSpellUses = game.settings.get("action-pack-enhanced", "show-spell-uses");
    const showSpellDamage = game.settings.get("action-pack-enhanced", "show-spell-damage");
    const showWeaponMastery = game.settings.get("action-pack-enhanced", "show-weapon-mastery");
    const staticInfo = game.settings.get("action-pack-enhanced", "static-info");
    const allAbilities = Object.entries(CONFIG.DND5E.abilities);
    const abilityColumns = [
        allAbilities.slice(0, 3).map(([key, config]) => ({ key, label: config.label })),
        allAbilities.slice(3, 6).map(([key, config]) => ({ key, label: config.label }))
    ];

    const app = document.querySelector('#ape-app');
    // remove all the tray-* and icon-* classes
    Array.from(app.classList).forEach(c => {
        if (c.startsWith("tray-") || c.startsWith("icon-")) app.classList.remove(c);
    });
    app.classList.add(iconSize);
    app.classList.add(traySize);
    if (app) {
        app.data = {
            actors: builtData,
        };
        app.globalData = {
            abilityColumns,
            showSpellDots,
            showSpellUses,
            showSpellDamage,
            showWeaponMastery,
            staticInfo
        };
        // API is already set on init
    }
}

Hooks.on("dnd5e.getItemContextOptions", (item, options) => {
    if (item.system.activation?.type && item.system.activation.type !== "none") {
        if (item.getFlag("action-pack-enhanced", "hidden")) {
            options.push({
                name: game.i18n.localize("action-pack-enhanced.item-context.show"),
                icon: "<i class='fas fa-eye'></i>",
                callback: async () => {
                    await item.setFlag("action-pack-enhanced", "hidden", false);
                    updateTray();
                }
            });
        } else {
            options.push({
                name: game.i18n.localize("action-pack-enhanced.item-context.hide"),
                icon: "<i class='fas fa-eye-slash'></i>",
                callback: async () => {
                    await item.setFlag("ape", "hidden", true);
                    updateTray();
                }
            });
        }
    }
});

Hooks.on("dropCanvasData", (canvas, data) => {
    if (data.type === "ActionPackItem" && data.uuid) {
        const item = fromUuid(data.uuid);
        if (!item) return;

        const dropTarget = canvas.tokens.placeables.find(token => {
             return (data.x >= token.x && data.x <= (token.x + token.w) &&
                     data.y >= token.y && data.y <= (token.y + token.h));
        });

        if (dropTarget) {

            // get the activities for the item
            const activities = item.system?.activities;
            if (!activities) return;
            // just get the first activity from the Collection
            const activity = activities.contents[0];
            const count = activity.target.affects.count || 1;
            if(count === 1) {
                dropTarget.setTarget(true, { user: game.user, releaseOthers: true, groupSelection: true });
            }
        }

        item.use();
        return false;
    }
});

