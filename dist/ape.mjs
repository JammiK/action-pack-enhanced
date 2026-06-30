var Je = Object.defineProperty;
var Ye = (n, e, t) => e in n ? Je(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var I = (n, e, t) => Ye(n, typeof e != "symbol" ? e + "" : e, t);
class Qe {
  constructor() {
    this.masteryRules = {
      Fighter: {
        type: "table",
        values: [
          { level: 1, mastery: 3 },
          { level: 2, mastery: 3 },
          { level: 3, mastery: 3 },
          { level: 4, mastery: 4 },
          { level: 5, mastery: 4 },
          { level: 6, mastery: 4 },
          { level: 7, mastery: 4 },
          { level: 8, mastery: 4 },
          { level: 9, mastery: 4 },
          { level: 10, mastery: 5 },
          { level: 11, mastery: 5 },
          { level: 12, mastery: 5 },
          { level: 13, mastery: 5 },
          { level: 14, mastery: 5 },
          { level: 15, mastery: 5 },
          { level: 16, mastery: 6 },
          { level: 17, mastery: 6 },
          { level: 18, mastery: 6 },
          { level: 19, mastery: 6 },
          { level: 20, mastery: 6 }
        ]
      },
      Barbarian: {
        type: "table",
        values: [
          { level: 1, mastery: 2 },
          { level: 2, mastery: 2 },
          { level: 3, mastery: 2 },
          { level: 4, mastery: 3 },
          { level: 5, mastery: 3 },
          { level: 6, mastery: 3 },
          { level: 7, mastery: 3 },
          { level: 8, mastery: 3 },
          { level: 9, mastery: 3 },
          { level: 10, mastery: 4 },
          { level: 11, mastery: 4 },
          { level: 12, mastery: 4 },
          { level: 13, mastery: 4 },
          { level: 14, mastery: 4 },
          { level: 15, mastery: 4 },
          { level: 16, mastery: 4 },
          { level: 17, mastery: 4 },
          { level: 18, mastery: 4 },
          { level: 19, mastery: 4 },
          { level: 20, mastery: 4 }
        ]
      },
      Ranger: { type: "constant", value: 2 },
      Rogue: { type: "constant", value: 2 },
      Paladin: { type: "constant", value: 2 }
    };
  }
  /**
   * Updates an actor's HP
   * @param {Actor} actor 
   * @param {number} value 
   */
  async updateHP(e, t) {
    if (e)
      return e.update({ "system.attributes.hp.value": t });
  }
  /**
   * Updates an actor's Temp HP
   * @param {Actor} actor 
   * @param {number} value 
   */
  async updateTempHP(e, t) {
    if (e)
      return e.update({ "system.attributes.hp.temp": t });
  }
  /**
   * Updates an actor's XP
   * @param {Actor} actor 
   * @param {number} value 
   */
  async updateXP(e, t) {
    if (e)
      return e.update({ "system.details.xp.value": t });
  }
  /**
   * Performs a Short Rest
   * @param {Actor} actor 
   */
  async shortRest(e) {
    if (e)
      return e.shortRest();
  }
  calculateMaxMasteries(e) {
    let t = 1;
    for (const a of e.itemTypes.class) {
      const s = this.masteryRules[a.name];
      if (s) {
        let i = 0;
        if (s.type === "constant")
          i = s.value;
        else if (s.type === "table") {
          const l = a.system.levels, o = s.values.find((r) => r.level === l);
          i = o ? o.mastery : 0;
        }
        i > t && (t = i);
      }
    }
    return t;
  }
  /**
   * Performs a Long Rest
   * @param {Actor} actor 
   */
  async longRest(e) {
    var s;
    if (!e) return;
    const t = await e.longRest();
    if (game.modules.get("wm5e") && ((s = game.modules.get("wm5e")) == null ? void 0 : s.active) && e.itemTypes.feat.find((i) => i.name === "Weapon Mastery" || i.name === "Weapon Master")) {
      await e.setFlag("action-pack-enhanced", "masterySelectionPending", !0);
      const i = e.itemTypes.weapon.filter((d) => d.name !== "Unarmed Strike"), l = /* @__PURE__ */ new Map(), o = e.system.traits.weaponProf.mastery.value;
      i.forEach((d) => {
        var u, m;
        const p = d.system.mastery, c = (u = d.system.type) == null ? void 0 : u.baseItem;
        p && c && !l.has(c) && l.set(c, {
          id: c,
          label: c.replace(/-/g, " ").replace(/\b\w/g, (f) => f.toUpperCase()),
          masteryLabel: ((m = CONFIG.DND5E.weaponMasteries[p]) == null ? void 0 : m.label) || p,
          selected: o.find((f) => f === c)
        });
      });
      const r = this.calculateMaxMasteries(e);
      await this.promptMasterySelection(e, l, r);
    } else
      await e.setFlag("action-pack-enhanced", "masterySelectionPending", !1), await e.update({ "system.traits.weaponProf.mastery.value": [] });
    return t;
  }
  async promptMasterySelection(e, t, a) {
    const { DialogV2: s } = foundry.applications.api;
    let i = `<p>Select up to ${a} ${a === 1 ? "weapon" : "weapons"} to use ${a === 1 ? "its" : "their"} weapon mastery for the day:</p>`;
    i += '<form class="ape-mastery-dialog">';
    for (const [l, o] of t)
      i += `
            <div class="ape-mastery-switch form-group">
                <input id="${l}" class="ape-mastery-checkbox" type="checkbox" name="mastery" value="${l}" data-dtype="String" ${o.selected ? "checked" : ""}>
                <label for="${l}" class="ape-mastery-label">${o.label} (${o.masteryLabel})</label>
            </div>`;
    return i += "</form>", i += `
        <script>
            (function() {
                const form = document.querySelector('.ape-mastery-dialog');
                if (!form) return;
                const inputs = form.querySelectorAll('input[name="mastery"]');
                const max = ${a};
                
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
        <\/script>
        `, s.wait({
      window: { title: "Weapon Mastery Selection" },
      content: i,
      buttons: [{
        action: "update",
        label: "Update",
        default: !0,
        callback: async (l, o, r) => {
          const d = [];
          return r.element.querySelectorAll('input[name="mastery"]:checked').forEach((p) => {
            d.push(p.value);
          }), d.length > a && (ui.notifications.warn(`You selected more than ${a} masteries. Only the first ${a} will be applied.`), d.splice(a)), await e.update({ "system.traits.weaponProf.mastery.value": d }), await e.setFlag("action-pack-enhanced", "masterySelectionPending", !1), !0;
        }
      }, {
        action: "cancel",
        label: "Cancel",
        callback: async () => (await e.setFlag("action-pack-enhanced", "masterySelectionPending", !1), !1)
      }],
      submit: (l) => {
      }
    });
  }
  /**
   * Toggles a Weapon Mastery selection
   * @param {Actor} actor 
   * @param {string} masteryId 
   */
  async toggleMastery(e, t) {
    var s, i, l;
    if (!e || !t) return;
    const a = new Set(((l = (i = (s = e.system.traits) == null ? void 0 : s.weaponProf) == null ? void 0 : i.mastery) == null ? void 0 : l.value) || []);
    if (a.has(t))
      a.delete(t);
    else {
      if (a.size >= 2) {
        ui.notifications.warn("You can only select up to 2 Weapon Masteries.");
        return;
      }
      a.add(t);
    }
    return e.update({ "system.traits.weaponProf.mastery.value": Array.from(a) });
  }
  /**
   * Locks Weapon Mastery selection
   * @param {Actor} actor 
   */
  async lockMasteries(e) {
    if (e)
      return e.setFlag("action-pack-enhanced", "masterySelectionPending", !1);
  }
  /**
   * Rolls Initiative for the actor in the current combat
   * @param {Actor} actor 
   */
  async rollInitiative(e) {
    if (!game.combat) return;
    const t = game.combat.combatants.find((a) => a.actor === e);
    if (t)
      return game.combat.rollInitiative([t.id]);
  }
  /**
   * End the current turn
   */
  async endTurn() {
    if (game.combat)
      return game.combat.nextTurn();
  }
  /**
   * Opens the Actor Sheet
   * @param {Actor} actor 
   */
  openSheet(e) {
    e && e.sheet.render(!0);
  }
  /**
   * Rolls a Death Saving Throw
   * @param {Actor} actor 
   */
  async rollDeathSave(e, t) {
    return e.rollDeathSave({ event: t });
  }
  /**
   * Rolls an Ability Check
   * @param {Actor} actor 
   * @param {string} abilityId 
   */
  async rollAbilityCheck(e, t, a) {
    return e.rollAbilityCheck({ event: a, ability: t });
  }
  /**
   * Rolls a Saving Throw
   * @param {Actor} actor 
   * @param {string} abilityId 
   */
  async rollSavingThrow(e, t, a) {
    return e.rollSavingThrow({ event: a, ability: t });
  }
  /**
   * Rolls a Skill
   * @param {Actor} actor 
   * @param {string} skillId 
   * @param {boolean} fastForward 
   */
  async rollSkill(e, t, a, s = !1) {
    return e.rollSkill({ event: a, skill: t }, { fastForward: s });
  }
  /**
   * Adjusts Spell Slots
   * @param {Actor} actor 
   * @param {string} groupName 
   * @param {number} slotIndex 
   */
  async adjustSpellSlot(e, t, a) {
    var l, o;
    const s = a + 1, i = (o = (l = e.system.spells) == null ? void 0 : l[t]) == null ? void 0 : o.value;
    if (i !== void 0) {
      const r = `system.spells.${t}.value`, d = i !== s ? s : s - 1;
      return e.update({ [r]: d });
    }
  }
  /**
   * Rolls an Item
   * @param {Item} item
   * @param {Event} [event]
   * @param {number} [castLevel] Spell slot level to pre-select in the cast dialog
   */
  async rollItem(e, t, a) {
    var s, i, l;
    if (e) {
      if (!((s = game.modules.get("wire")) != null && s.active) && ((i = game.modules.get("itemacro")) != null && i.active) && game.settings.get("itemacro", "defaultmacro") && e.hasMacro()) {
        e.executeMacro();
        return;
      }
      return e.type === "spell" && e.actor && Number.isFinite(a) && a > (((l = e.system) == null ? void 0 : l.level) ?? 0) ? this._castSpellAtLevel(e, a, t) : e.use({ event: t }, {}, {});
    }
  }
  /**
   * Uses a spell with a given slot level pre-selected in the cast dialog. The dialog
   * is still shown so the player can confirm consumption, place a template, etc.
   * @param {Item} item
   * @param {number} castLevel
   * @param {Event} [event]
   */
  async _castSpellAtLevel(e, t, a) {
    var r, d, p;
    const s = (r = e.system) == null ? void 0 : r.activities, i = ((d = s == null ? void 0 : s.find) == null ? void 0 : d.call(s, (c) => c.canUse)) ?? ((p = s == null ? void 0 : s.contents) == null ? void 0 : p[0]);
    if (!i) return e.use({ event: a }, {}, {});
    const l = e.actor.system.spells ?? {};
    let o = `spell${t}`;
    if (!l[o]) {
      const c = Object.entries(l).find(([, u]) => (u == null ? void 0 : u.level) === t && (u == null ? void 0 : u.max));
      c && (o = c[0]);
    }
    return i.use({ event: a, spell: { slot: o } }, { configure: !0 }, {});
  }
  /**
   * Rolls Item Recharge
   * @param {Item} item 
   */
  async rollRecharge(e) {
    return e.system.uses.rollRecharge();
  }
  /**
   * Gets Item Chat Data for Description
   * @param {Item} item 
   */
  async getItemDescription(e) {
    var l, o, r, d;
    const t = await e.getChatData({ secrets: e.actor.isOwner }), a = ((o = (l = e.system) == null ? void 0 : l.activation) == null ? void 0 : o.type) || "", s = ((d = (r = e.system) == null ? void 0 : r.activation) == null ? void 0 : d.value) || "";
    let i = "";
    return s === "" ? i = a.charAt(0).toUpperCase() + a.slice(1) : s && a && (i = `${s} ${a.charAt(0).toUpperCase() + a.slice(1)}`), {
      description: t.description,
      properties: {
        castingTime: i,
        range: this._formatRange(e),
        duration: this._formatDuration(e)
      }
    };
  }
  /**
   * Toggles inspiration on an actor
   * @param {Actor} actor 
   */
  async toggleInspiration(e) {
    if (e)
      return e.update({ "system.attributes.inspiration": !e.system.attributes.inspiration });
  }
  _formatRange(e) {
    var s, i, l, o;
    const t = (i = (s = e.system) == null ? void 0 : s.range) == null ? void 0 : i.value, a = (o = (l = e.system) == null ? void 0 : l.range) == null ? void 0 : o.units;
    return t && a ? `${t} ${a}` : a || "";
  }
  _formatDuration(e) {
    var s, i, l, o;
    const t = (i = (s = e.system) == null ? void 0 : s.duration) == null ? void 0 : i.value, a = (o = (l = e.system) == null ? void 0 : l.duration) == null ? void 0 : o.units;
    return t && a ? `${t} ${a}` : a ? a === "inst" ? "Instantaneous" : a : "";
  }
  /**
   * Sets a weapon set item
   * @param {Actor} actor 
   * @param {number} setIndex 
   * @param {string} slot 'main' or 'off'
   * @param {string} itemUuid 
   */
  async setWeaponSetItem(e, t, a, s, i) {
    var r, d, p;
    if (!e) return;
    const l = e.getFlag("action-pack-enhanced", "weaponSets") || [];
    for (let c = 0; c <= t; c++)
      l[c] || (l[c] = { main: null, off: null, active: !1 });
    const o = fromUuidSync(s);
    if (o) {
      const c = a === "main" ? "off" : "main", u = l[t][c], m = [];
      if (u === s && ((r = o.system) == null ? void 0 : r.quantity) === 1 && m.push(game.i18n.localize("action-pack-enhanced.warning.quantity-limit") || "Not enough quantity to equip in both slots."), (d = o.system.properties) != null && d.has("two") && u) {
        const f = fromUuidSync(u);
        f && ((p = f.system.properties) != null && p.has("two")) && m.push(game.i18n.localize("action-pack-enhanced.warning.two-handed") || "You cannot have two two-handed weapons in the same set.");
      }
      if (m.length > 0) {
        m.forEach((f) => ui.notifications.warn(f));
        return;
      }
    }
    if (l[t][a] = s, await e.setFlag("action-pack-enhanced", "weaponSets", l), l[t].active)
      return this.equipWeaponSet(e, t);
  }
  /**
   * Clears a weapon set item
   * @param {Actor} actor 
   * @param {number} setIndex 
   * @param {string} slot 'main' or 'off'
   */
  async clearWeaponSetItem(e, t, a) {
    if (!e) return;
    const s = e.getFlag("action-pack-enhanced", "weaponSets") || [];
    if (s[t])
      return s[t][a] = null, !s[t].main && !s[t].off && (s[t].active = !1), e.setFlag("action-pack-enhanced", "weaponSets", s);
  }
  /**
   * Equips a weapon set
   * @param {Actor} actor 
   * @param {number} setIndex 
   */
  async equipWeaponSet(e, t) {
    if (!e) return;
    const a = e.getFlag("action-pack-enhanced", "weaponSets");
    if (!a || !a[t]) return;
    const s = a[t];
    if (!s.main && !s.off) return;
    const i = a.map((p, c) => ({ ...p, active: c === t }));
    await e.setFlag("action-pack-enhanced", "weaponSets", i);
    const l = [], o = e.itemTypes.weapon.filter((p) => p.name !== "Unarmed Strike"), r = e.itemTypes.equipment.find((p) => p.name.includes("Shield"));
    r && o.push(r);
    const d = /* @__PURE__ */ new Set();
    s.main && d.add(s.main), s.off && d.add(s.off);
    for (const p of o) {
      const c = d.has(p.uuid);
      p.system.equipped !== c && l.push({ _id: p.id, "system.equipped": c });
    }
    l.length > 0 && await e.updateEmbeddedDocuments("Item", l);
  }
}
function Y(n) {
  return n == null ? "0" : `${n >= 0 ? "+" : ""}${n}`;
}
function et(n) {
  const e = n.type === "spell" ? it(n) : "", t = tt(n), a = at(n), s = st(n), i = n.type === "spell" ? nt(n) : "";
  return { school: e, castingTime: t, range: a, duration: s, materials: i };
}
function tt(n) {
  var a, s, i, l;
  const e = ((s = (a = n.system) == null ? void 0 : a.activation) == null ? void 0 : s.type) || "", t = ((l = (i = n.system) == null ? void 0 : i.activation) == null ? void 0 : l.value) || "";
  return t === "" && e !== "" ? game.i18n.localize(`action-pack-enhanced.action-type.${e}`) : t && e ? `${t} ${e.charAt(0).toUpperCase() + e.slice(1)}` : "";
}
function at(n) {
  var s, i, l, o, r, d, p, c;
  const e = ((i = (s = n.system) == null ? void 0 : s.range) == null ? void 0 : i.long) || null, t = (o = (l = n.system) == null ? void 0 : l.range) == null ? void 0 : o.units;
  let a;
  return t !== "touch" && t !== "self" ? a = ((d = (r = n.system) == null ? void 0 : r.range) == null ? void 0 : d.value) || ((c = (p = n.system) == null ? void 0 : p.range) == null ? void 0 : c.reach) || 5 : a = null, a && e && t ? `${a} ${t} / ${e} ${t}` : a && t ? `${a} ${t}` : t ? game.i18n.localize(`action-pack-enhanced.range.${t}`) : "";
}
function st(n) {
  var a, s, i, l;
  const e = (s = (a = n.system) == null ? void 0 : a.duration) == null ? void 0 : s.value, t = (l = (i = n.system) == null ? void 0 : i.duration) == null ? void 0 : l.units;
  return e && t ? `${e} ${e > 1 ? t + "s" : t}` : t ? game.i18n.localize(`action-pack-enhanced.duration.${t}`) : "";
}
function nt(n) {
  var t, a;
  const e = (a = (t = n.system) == null ? void 0 : t.materials) == null ? void 0 : a.value;
  return e || "";
}
function it(n) {
  var t, a;
  if ((t = n.labels) != null && t.school)
    return n.labels.school;
  const e = (a = n.system) == null ? void 0 : a.school;
  if (e) {
    const s = CONFIG.DND5E.spellSchools[e];
    return s ? s.label || s : e;
  }
  return "";
}
function lt(n, e) {
  var o, r;
  const t = (o = n == null ? void 0 : n.system) == null ? void 0 : o.activities, a = (t == null ? void 0 : t.contents) ?? (t ? [...t] : []);
  if (!a.length) return [];
  const s = n.type === "spell", i = s ? ((r = n.system) == null ? void 0 : r.level) ?? 0 : 0, l = s && i > 0 && Number.isFinite(e) ? Math.max(0, e - i) : 0;
  for (const d of a) {
    const p = l ? Me(d, l, n) : ot(d, n);
    if (p.length) return p;
  }
  return [];
}
function ot(n, e) {
  var a, s;
  const t = ((a = n == null ? void 0 : n.labels) == null ? void 0 : a.damages) ?? ((s = n == null ? void 0 : n.labels) == null ? void 0 : s.damage);
  if (Array.isArray(t) && t.length) {
    const i = t.filter((l) => l == null ? void 0 : l.formula).map((l) => He(l.formula, l.damageType));
    if (i.length) return i;
  }
  return Me(n, 0, e);
}
function Me(n, e, t) {
  var i, l, o;
  const a = [...((i = n == null ? void 0 : n.damage) == null ? void 0 : i.parts) ?? []];
  ((l = n == null ? void 0 : n.healing) != null && l.formula || (o = n == null ? void 0 : n.healing) != null && o.number) && a.push(n.healing);
  const s = [];
  for (const r of a) {
    const d = rt(r, e, t);
    d && s.push(He(d, pt(r)));
  }
  return s;
}
function rt(n, e, t) {
  var a;
  try {
    let s = e && typeof n.scaledFormula == "function" ? n.scaledFormula(e) : n.formula;
    if (!s) return "";
    if (s.includes("@")) {
      const i = ((a = t.getRollData) == null ? void 0 : a.call(t)) ?? {};
      s = Roll.replaceFormulaData(s, i, { missing: "0" });
    }
    return s;
  } catch (s) {
    return console.warn("Action Pack Enhanced | unable to scale damage formula", s), "";
  }
}
function ct(n) {
  var t, a;
  const e = (a = (t = globalThis.dnd5e) == null ? void 0 : t.dice) == null ? void 0 : a.simplifyRollFormula;
  if (typeof e == "function")
    try {
      return e(n, { preserveFlavor: !1 });
    } catch {
    }
  return String(n).replace(/\s+/g, " ").trim();
}
function pt(n) {
  var e;
  return (e = n == null ? void 0 : n.types) != null && e.size ? [...n.types][0] : Array.isArray(n == null ? void 0 : n.types) && n.types.length ? n.types[0] : (n == null ? void 0 : n.damageType) ?? "";
}
function He(n, e) {
  var i, l;
  const t = ((i = CONFIG.DND5E.damageTypes) == null ? void 0 : i[e]) ?? ((l = CONFIG.DND5E.healingTypes) == null ? void 0 : l[e]), a = t != null && t.label ? t.label.toLowerCase() : "";
  let s = "damage";
  return e === "healing" ? s = "healing" : e === "temphp" && (s = "temphp"), { formula: ct(n), typeKey: e || "", typeLabel: a, kind: s };
}
function dt(n, e = n == null ? void 0 : n.actor) {
  var l, o, r, d, p;
  if ((n == null ? void 0 : n.type) !== "spell" || !e) return [];
  const t = ((l = n.system) == null ? void 0 : l.level) ?? 0;
  if (t < 1) return [];
  const a = ((r = (o = n.system.activities) == null ? void 0 : o.find) == null ? void 0 : r.call(o, (c) => c.canScale)) ?? ((p = (d = n.system.activities) == null ? void 0 : d.contents) == null ? void 0 : p[0]);
  if (!((a == null ? void 0 : a.canScale) ?? !0)) return [t];
  const i = /* @__PURE__ */ new Set([t]);
  for (const [c, u] of Object.entries(e.system.spells ?? {})) {
    if (!(u != null && u.max)) continue;
    const m = /^spell(\d+)$/.exec(c);
    if (!m) continue;
    const f = Number(m[1]);
    f > t && i.add(f);
  }
  return [...i].sort((c, u) => c - u);
}
function ut(n) {
  var r, d;
  let e = {}, t = n.itemTypes.race, a = n.itemTypes.class, s = n.itemTypes.subclass;
  const i = n.system.details.level;
  if (a.length === s.length) {
    let p = { race: `<span>${(r = t[0]) == null ? void 0 : r.name} - ${i}</span>` || "Unknown", classes: [] };
    for (let c = 0; c < a.length; c++)
      p.classes[c] = { name: a[c].name, level: a[c].system.levels, subclass: { name: s[c].name } };
    e = p;
  } else {
    let p = { race: `<span>${(d = t[0]) == null ? void 0 : d.name} - ${i}</span>` || "Unknown", classes: [] };
    for (let c = 0; c < a.length; c++) {
      p.classes[c] = { name: a[c].name, level: a[c].system.levels, subclass: { name: "" } };
      for (let u = 0; u < s.length; u++)
        s[u].system.class === a[c].name && (p.classes[c].subclass.name = s[u].name);
    }
    e = p;
  }
  a.length === s.length ? a.forEach((p, c) => {
    e.classes[c].icon = p.img, e.classes[c].subclass.icon = p.subclass.img;
  }) : a.forEach((p, c) => {
    e.classes[c].icon = p.img, e.classes[c].subclass.name !== "" && s.forEach((u) => {
      u.system.class === p.name && (e.classes[c].subclass.icon = u.img);
    });
  });
  let l = `${e.race}`, o = [];
  for (let p = 0; p < e.classes.length; p++) {
    let c = "", u = "";
    e.classes[p].subclass.name !== "" ? (c = e.classes[p].subclass.icon, u = `${e.classes[p].subclass.name} ${e.classes[p].name} (${e.classes[p].level})`) : (c = e.classes[p].icon, u = `${e.classes[p].name} (${e.classes[p].level})`), o.push(`<img class="ape-actor-class-icon" src="${c}" title="${u}">`);
  }
  return l + `<span class="ape-actor-class-icons">${o.join("")}</span>`;
}
const ht = (n) => {
  const e = n.system, t = e.consume;
  if (t && t.target)
    return gt(n.actor, t);
  const a = e.uses;
  if (a && (a.max > 0 || a.value > 0))
    return Ne(e);
  const s = n.type;
  return s === "feat" ? mt() : s === "consumable" ? {
    available: e.quantity
  } : s === "weapon" ? ft(e) : null;
};
function gt(n, e) {
  let t = null, a = null;
  if (e.type === "attribute") {
    const s = getProperty(n.system, e.target);
    typeof s == "number" ? t = s : t = 0;
  } else if (e.type === "ammo" || e.type === "material") {
    const s = n.items.get(e.target);
    s ? t = s.system.quantity : t = 0;
  } else if (e.type === "charges") {
    const s = n.items.get(e.target);
    s ? { available: t, maximum: a } = Ne(s.system) : t = 0;
  }
  return t !== null ? (e.amount > 1 && (t = Math.floor(t / e.amount), a !== null && (a = Math.floor(a / e.amount))), { available: t, maximum: a }) : null;
}
function Ne(n) {
  let e = n.uses.value, t = n.uses.max;
  const a = n.quantity;
  return a && (e = e + (a - 1) * t, t = t * a), { available: e, maximum: t };
}
function mt(n) {
  return null;
}
function ft(n) {
  return n.properties.thr && !n.properties.ret ? { available: n.quantity, maximum: null } : null;
}
class yt {
  constructor() {
  }
  build(e, t) {
    return this.settingShowNoUses = game.settings.get("action-pack-enhanced", "show-no-uses"), this.settingShowUnpreparedCantrips = game.settings.get("action-pack-enhanced", "show-unprepared-cantrips"), this.settingShowUnpreparedSpells = game.settings.get("action-pack-enhanced", "show-unprepared-spells"), this.settingSortAlphabetically = game.settings.get("action-pack-enhanced", "sort-alphabetic"), this.settingShowWeaponMastery = game.settings.get("action-pack-enhanced", "show-weapon-mastery"), this.settingShowUpcastDuplicates = game.settings.get("action-pack-enhanced", "show-upcast-duplicates"), e.map((a) => this.prepareActor(a, t));
  }
  prepareActor(e, t) {
    var S, E;
    const a = e.system, s = !!e.itemTypes.feat.find((y) => y.name === "Ritual Adept"), i = e.getFlag("action-pack-enhanced", "weaponSets") || [], l = [];
    for (let y = 0; y < 3; y++) {
      const b = i[y] || { main: null, off: null, active: !1 }, P = { index: y, main: null, off: null, active: b.active };
      if (b.main) {
        const v = fromUuidSync(b.main);
        v && (P.main = { uuid: b.main, img: v.img, rarity: v.system.rarity, name: v.name });
      }
      if (b.off) {
        const v = fromUuidSync(b.off);
        v && (P.off = { uuid: b.off, img: v.img, rarity: v.system.rarity, name: v.name });
      }
      l.push(P);
    }
    let o = {
      equipped: {
        items: [],
        title: "action-pack-enhanced.category.weapon",
        weaponSets: l,
        groups: {
          unequipped: { items: [], title: "action-pack-enhanced.flag.unequipped-title" },
          shield: { items: [], title: "action-pack-enhanced.flag.shield-title" }
        }
      },
      inventory: {
        title: "action-pack-enhanced.category.inventory",
        groups: {
          equipment: { items: [], title: "action-pack-enhanced.category.equipment" },
          consumable: { items: [], title: "action-pack-enhanced.category.consumable" },
          other: { items: [], title: "action-pack-enhanced.category.other" }
        }
      },
      feature: { items: [], title: "action-pack-enhanced.category.feature", groups: this.systemFeatureGroups() },
      spell: {
        title: "action-pack-enhanced.category.spell",
        groups: {
          innate: { items: [], title: "action-pack-enhanced.category.innate" },
          atwill: { items: [], title: "action-pack-enhanced.category.atwill" },
          pact: { items: [], title: "action-pack-enhanced.category.pact" },
          ...[...Array(10).keys()].reduce((y, b) => (y[`spell${b}`] = { items: [], title: `action-pack-enhanced.category.spell${b}`, cost: 0 }, y), {})
        }
      },
      passive: { items: [], title: "action-pack-enhanced.category.passive" }
    };
    const r = ["consumable", "container", "equipment", "feat", "loot", "spell", "tool", "weapon"];
    for (const [y, b] of Object.entries(e.itemTypes))
      if (r.includes(y))
        for (const P of b)
          this._processItem(P, y, o, e, s);
    const d = game.modules.find((y) => y.id === "wm5e") && ((S = game.modules.get("wm5e")) == null ? void 0 : S.active);
    if (e.type === "character" && d && e.itemTypes.feat.find((b) => b.name === "Weapon Mastery" || b.name === "Weapon Master")) {
      const b = e.getFlag("action-pack-enhanced", "masterySelectionPending");
      o.equipped.forceOpen = b;
    }
    const p = (E = game.combat) == null ? void 0 : E.combatants.find((y) => y.actor === e), c = p && !p.initiative, u = game.modules.get("dnd5e-spellpoints"), m = u && (u != null && u.active) ? getSpellPointsItem(e) : null, f = this.sortItems(this.removeEmptySections(o)), k = m ? this.addSpellPointUses(f, m, a) : this.addSpellLevelUses(f, a);
    return {
      actor: e,
      name: e.name,
      sections: k,
      needsInitiative: c,
      skills: CONFIG.DND5E.skills
    };
  }
  _processItem(e, t, a, s, i) {
    var c;
    const l = e.system, o = ht(e), r = this.settingShowNoUses || !o || o.available, d = ((c = l == null ? void 0 : l.activities) == null ? void 0 : c.size) > 0, p = e.getFlag("action-pack-enhanced", "hidden");
    if (e.type === "equipment" && (l.identified && l.identifier === "shield" || e.name.includes("Shield")) && (l.equipped ? a.equipped.groups.shield.items.push({ item: e, uses: o }) : a.equipped.groups.unequipped.items.push({ item: e, uses: o })), r && d && !p)
      switch (t) {
        case "feat":
          this._prepareFeat(e, l, o, a);
          break;
        case "spell":
          this._prepareSpell(e, l, o, a, i);
          break;
        case "weapon":
          this._prepareWeapon(e, l, o, a);
          break;
        case "equipment":
          this._prepareEquipment(e, l, o, a);
          break;
        case "consumable":
          this._prepareConsumable(e, l, o, a);
          break;
        case "facility":
          break;
        default:
          this._prepareOther(e, l, o, a);
          break;
      }
    else s.type === "npc" && a.passive.items.push({ item: e, uses: o });
  }
  _prepareFeat(e, t, a, s) {
    var o, r;
    const i = (o = t.type) == null ? void 0 : o.value, l = (r = t.type) == null ? void 0 : r.subtype;
    l && s.feature.groups[l] ? s.feature.groups[l].items.push({ item: e, uses: a }) : i && s.feature.groups[i] ? s.feature.groups[i].items.push({ item: e, uses: a }) : s.feature.groups.general.items.push({ item: e, uses: a });
  }
  _prepareSpell(e, t, a, s, i) {
    var o, r;
    switch (t == null ? void 0 : t.method) {
      case "spell":
        const d = (t == null ? void 0 : t.prepared) === 1, p = (t == null ? void 0 : t.prepared) === 2, c = i && ((o = t.properties) == null ? void 0 : o.has("ritual")), u = t.level == 0 && this.settingShowUnpreparedCantrips, m = t.level > 0 && this.settingShowUnpreparedSpells;
        if (p || d || c || u || m) {
          const f = this.settingShowUpcastDuplicates && t.level > 0 ? dt(e) : [];
          if (f.length)
            for (const k of f)
              (r = s.spell.groups[`spell${k}`]) == null || r.items.push({ item: e, uses: a, castLevel: k });
          else
            s.spell.groups[`spell${t.level}`].items.push({ item: e, uses: a });
        }
        break;
      case "atwill":
        s.spell.groups.atwill.items.push({ item: e, uses: a });
        break;
      case "innate":
        s.spell.groups.innate.items.push({ item: e, uses: a });
        break;
      case "pact":
        s.spell.groups.pact.items.push({ item: e, uses: a });
        break;
    }
  }
  _prepareWeapon(e, t, a, s) {
    const i = e.name === "Unarmed Strike";
    t.equipped || i ? s.equipped.items.push({ item: e, uses: a }) : s.equipped.groups.unequipped.items.push({ item: e, uses: a });
  }
  _prepareEquipment(e, t, a, s) {
    s.inventory.groups.equipment.items.push({ item: e, uses: a });
  }
  _prepareConsumable(e, t, a, s) {
    t.consumableType !== "ammo" && s.inventory.groups.consumable.items.push({ item: e, uses: a });
  }
  _prepareOther(e, t, a, s) {
    s.inventory.groups.other.items.push({ item: e, uses: a });
  }
  systemFeatureGroups() {
    const e = {
      general: {
        items: [],
        title: "General Features"
      }
    };
    return Object.entries(CONFIG.DND5E.featureTypes).reduce((t, a) => {
      if (t[a[0]] = {
        items: [],
        title: a[1].label
      }, a[1].subtypes)
        for (const s in a[1].subtypes)
          t[s] = {
            items: [],
            title: a[1].subtypes[s]
          };
      return t;
    }, e);
  }
  removeEmptySections(e) {
    const t = (a) => {
      if (!a || typeof a != "object")
        return !1;
      const s = Object.keys(a);
      return s.includes("groups") && Object.values(a.groups).some((i) => t(i)) ? !0 : s.includes("items") ? !!a.items.length : Object.values(a).some((i) => t(i));
    };
    return Object.entries(e).reduce((a, [s, i]) => (t(i) && (a[s] = i), a), {});
  }
  addSpellPointUses(e, t, a) {
    var l, o, r, d, p, c, u, m, f;
    const s = {
      0: 0,
      1: 2,
      2: 3,
      3: 5,
      4: 6,
      5: 7,
      6: 9,
      7: 10,
      8: 11,
      9: 13
    }, i = {
      available: ((o = (l = t.system) == null ? void 0 : l.uses) == null ? void 0 : o.value) || 0,
      maximum: ((d = (r = t.system) == null ? void 0 : r.uses) == null ? void 0 : d.max) || 0
    };
    if (e.spell) {
      e.spell.uses = i;
      for (let k = 1; k <= 9; k++) {
        const S = (p = e.spell) == null ? void 0 : p.groups[`spell${k}`];
        S && (S.cost = s[k]);
      }
    }
    return (u = (c = a.spells) == null ? void 0 : c.pact) != null && u.max && ((f = (m = e.spell) == null ? void 0 : m.groups) != null && f.pact) && (e.spell.groups.pact.uses = {
      available: a.spells.pact.value,
      maximum: a.spells.pact.max
    }), e;
  }
  addSpellLevelUses(e, t) {
    var a, s, i, l, o;
    for (let r = 1; r <= 9; r++) {
      const d = (a = e.spell) == null ? void 0 : a.groups[`spell${r}`];
      if (d) {
        const p = t.spells[`spell${r}`];
        d.uses = { available: p.value, maximum: p.max };
      }
    }
    return (i = (s = t.spells) == null ? void 0 : s.pact) != null && i.max && ((o = (l = e.spell) == null ? void 0 : l.groups) != null && o.pact) && (e.spell.groups.pact.uses = {
      available: t.spells.pact.value,
      maximum: t.spells.pact.max
    }), e;
  }
  sortItems(e) {
    return Object.entries(e).forEach(([t, a]) => {
      t === "items" ? a.sort((s, i) => this.settingSortAlphabetically ? s.item.name.localeCompare(i.item.name) : s.item.sort - i.item.sort) : a && typeof a == "object" && this.sortItems(a);
    }), e;
  }
}
function bt(n) {
  var i;
  const { updateTray: e, updateTrayState: t } = n, a = !!((i = game.modules.get("dnd5e-spellpoints")) != null && i.active);
  function s() {
    return game.settings.get("action-pack-enhanced", "tray-display") === "always";
  }
  game.settings.register(
    "action-pack-enhanced",
    "tray-display",
    {
      name: "action-pack-enhanced.settings.tray-display",
      hint: "action-pack-enhanced.settings.tray-display-hint",
      scope: "client",
      config: !0,
      default: "auto",
      choices: {
        auto: "action-pack-enhanced.settings.tray-display-auto",
        toggle: "action-pack-enhanced.settings.tray-display-toggle",
        selected: "action-pack-enhanced.settings.tray-display-selected",
        always: "action-pack-enhanced.settings.tray-display-always"
      },
      type: String,
      onChange: () => {
        ui.controls.initialize(), t();
      }
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "assume-default-character",
    {
      name: "action-pack-enhanced.settings.assume-default-character",
      hint: "action-pack-enhanced.settings.assume-default-character-hint",
      scope: "client",
      config: !0,
      default: !0,
      type: Boolean,
      onChange: () => t()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "icon-size",
    {
      name: "action-pack-enhanced.settings.icon-size",
      scope: "client",
      config: !0,
      default: "medium",
      choices: {
        small: "action-pack-enhanced.settings.icon-size-small",
        medium: "action-pack-enhanced.settings.icon-size-medium",
        large: "action-pack-enhanced.settings.icon-size-large"
      },
      type: String,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "tray-size",
    {
      name: "action-pack-enhanced.settings.tray-size",
      scope: "client",
      config: !0,
      default: "large",
      choices: {
        small: "action-pack-enhanced.settings.tray-size-small",
        medium: "action-pack-enhanced.settings.tray-size-medium",
        large: "action-pack-enhanced.settings.tray-size-large"
      },
      type: String,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-inspiration-animation",
    {
      name: "action-pack-enhanced.settings.show-inspiration-animation",
      hint: "action-pack-enhanced.settings.show-inspiration-animation-hint",
      scope: "client",
      config: !0,
      default: !0,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-xp-info",
    {
      name: "action-pack-enhanced.settings.show-xp-info",
      hint: "action-pack-enhanced.settings.show-xp-info-hint",
      scope: "client",
      config: !0,
      default: !0,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "static-info",
    {
      name: "action-pack-enhanced.settings.static-info",
      hint: "action-pack-enhanced.settings.static-info-hint",
      scope: "client",
      config: !0,
      default: !1,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-death-saves",
    {
      name: "action-pack-enhanced.settings.show-death-saves",
      hint: "action-pack-enhanced.settings.show-death-saves-hint",
      scope: "client",
      config: !0,
      default: !0,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-spell-dots",
    {
      name: "action-pack-enhanced.settings.show-spell-dots",
      hint: "action-pack-enhanced.settings.show-spell-dots-hint",
      scope: "client",
      config: !0,
      default: !0,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-spell-uses",
    {
      name: "action-pack-enhanced.settings.show-spell-uses",
      hint: "action-pack-enhanced.settings.show-spell-uses-hint",
      scope: "client",
      config: !0,
      default: !0,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-spell-damage",
    {
      name: "action-pack-enhanced.settings.show-spell-damage",
      hint: "action-pack-enhanced.settings.show-spell-damage-hint",
      scope: "client",
      config: !0,
      default: !1,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-upcast-duplicates",
    {
      name: "action-pack-enhanced.settings.show-upcast-duplicates",
      hint: "action-pack-enhanced.settings.show-upcast-duplicates-hint",
      scope: "client",
      config: !0,
      default: !1,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "spellPointsTextColor",
    {
      name: "action-pack-enhanced.settings.spell-points-text-color",
      hint: "action-pack-enhanced.settings.spell-points-text-color-hint",
      scope: "client",
      config: a,
      default: "white",
      choices: {
        aliceblue: "aliceblue",
        antiquewhite: "antiquewhite",
        aqua: "aqua",
        aquamarine: "aquamarine",
        azure: "azure",
        beige: "beige",
        bisque: "bisque",
        black: "black",
        blanchedalmond: "blanchedalmond",
        blue: "blue",
        blueviolet: "blueviolet",
        brown: "brown",
        burlywood: "burlywood",
        cadetblue: "cadetblue",
        chartreuse: "chartreuse",
        chocolate: "chocolate",
        coral: "coral",
        cornflowerblue: "cornflowerblue",
        cornsilk: "cornsilk",
        crimson: "crimson",
        cyan: "cyan",
        darkblue: "darkblue",
        darkcyan: "darkcyan",
        darkgoldenrod: "darkgoldenrod",
        darkgray: "darkgray",
        darkgreen: "darkgreen",
        darkgrey: "darkgrey",
        darkkhaki: "darkkhaki",
        darkmagenta: "darkmagenta",
        darkolivegreen: "darkolivegreen",
        darkorange: "darkorange",
        darkorchid: "darkorchid",
        darkred: "darkred",
        darksalmon: "darksalmon",
        darkseagreen: "darkseagreen",
        darkslateblue: "darkslateblue",
        darkslategray: "darkslategray",
        darkslategrey: "darkslategrey",
        darkturquoise: "darkturquoise",
        darkviolet: "darkviolet",
        deeppink: "deeppink",
        deepskyblue: "deepskyblue",
        dimgray: "dimgray",
        dimgrey: "dimgrey",
        dodgerblue: "dodgerblue",
        firebrick: "firebrick",
        floralwhite: "floralwhite",
        forestgreen: "forestgreen",
        fuchsia: "fuchsia",
        gainsboro: "gainsboro",
        ghostwhite: "ghostwhite",
        gold: "gold",
        goldenrod: "goldenrod",
        gray: "gray",
        green: "green",
        greenyellow: "greenyellow",
        hotpink: "hotpink",
        indianred: "indianred",
        indigo: "indigo",
        ivory: "ivory",
        khaki: "khaki",
        lavender: "lavender",
        lavenderblush: "lavenderblush",
        lawngreen: "lawngreen",
        lemonchiffon: "lemonchiffon",
        lightblue: "lightblue",
        lightcoral: "lightcoral",
        lightcyan: "lightcyan",
        lightgoldenrodyellow: "lightgoldenrodyellow",
        lightgray: "lightgray",
        lightgreen: "lightgreen",
        lightgrey: "lightgrey",
        lightpink: "lightpink",
        lightsalmon: "lightsalmon",
        lightseagreen: "lightseagreen",
        lightskyblue: "lightskyblue",
        lightslategray: "lightslategray",
        lightslategrey: "lightslategrey",
        lightsteelblue: "lightsteelblue",
        lightyellow: "lightyellow",
        lime: "lime",
        limegreen: "limegreen",
        linen: "linen",
        magenta: "magenta",
        maroon: "maroon",
        mediumaquamarine: "mediumaquamarine",
        mediumblue: "mediumblue",
        mediumorchid: "mediumorchid",
        mediumpurple: "mediumpurple",
        mediumseagreen: "mediumseagreen",
        mediumslateblue: "mediumslateblue",
        mediumspringgreen: "mediumspringgreen",
        mediumturquoise: "mediumturquoise",
        mediumvioletred: "mediumvioletred",
        midnightblue: "midnightblue",
        mintcream: "mintcream",
        mistyrose: "mistyrose",
        moccasin: "moccasin",
        navajowhite: "navajowhite",
        navy: "navy",
        oldlace: "oldlace",
        olive: "olive",
        olivedrab: "olivedrab",
        orange: "orange",
        orangered: "orangered",
        orchid: "orchid",
        palegoldenrod: "palegoldenrod",
        palegreen: "palegreen",
        palevioletred: "palevioletred",
        papayawhip: "papayawhip",
        peachpuff: "peachpuff",
        peru: "peru",
        pink: "pink",
        plum: "plum",
        powderblue: "powderblue",
        purple: "purple",
        rebeccapurple: "rebeccapurple",
        red: "red",
        rosybrown: "rosybrown",
        royalblue: "royalblue",
        saddlebrown: "saddlebrown",
        salmon: "salmon",
        sandybrown: "sandybrown",
        seagreen: "seagreen",
        seashell: "seashell",
        sienna: "sienna",
        silver: "silver",
        skyblue: "skyblue",
        slateblue: "slateblue",
        slategray: "slategray",
        slategrey: "slategrey",
        snow: "snow",
        springgreen: "springgreen",
        steelblue: "steelblue",
        tan: "tan",
        teal: "teal",
        thistle: "thistle",
        tomato: "tomato",
        turquoise: "turquoise",
        violet: "violet",
        wheat: "wheat",
        white: "white",
        whitesmoke: "whitesmoke",
        yellow: "yellow",
        yellowgreen: "yellowgreen"
      },
      type: String,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "spellPointsBarColorStart",
    {
      name: "action-pack-enhanced.settings.spell-points-bar-color-start",
      hint: "action-pack-enhanced.settings.spell-points-bar-color-start-hint",
      scope: "client",
      config: a,
      default: "black",
      choices: {
        aliceblue: "aliceblue",
        antiquewhite: "antiquewhite",
        aqua: "aqua",
        aquamarine: "aquamarine",
        azure: "azure",
        beige: "beige",
        bisque: "bisque",
        black: "black",
        blanchedalmond: "blanchedalmond",
        blue: "blue",
        blueviolet: "blueviolet",
        brown: "brown",
        burlywood: "burlywood",
        cadetblue: "cadetblue",
        chartreuse: "chartreuse",
        chocolate: "chocolate",
        coral: "coral",
        cornflowerblue: "cornflowerblue",
        cornsilk: "cornsilk",
        crimson: "crimson",
        cyan: "cyan",
        darkblue: "darkblue",
        darkcyan: "darkcyan",
        darkgoldenrod: "darkgoldenrod",
        darkgray: "darkgray",
        darkgreen: "darkgreen",
        darkgrey: "darkgrey",
        darkkhaki: "darkkhaki",
        darkmagenta: "darkmagenta",
        darkolivegreen: "darkolivegreen",
        darkorange: "darkorange",
        darkorchid: "darkorchid",
        darkred: "darkred",
        darksalmon: "darksalmon",
        darkseagreen: "darkseagreen",
        darkslateblue: "darkslateblue",
        darkslategray: "darkslategray",
        darkslategrey: "darkslategrey",
        darkturquoise: "darkturquoise",
        darkviolet: "darkviolet",
        deeppink: "deeppink",
        deepskyblue: "deepskyblue",
        dimgray: "dimgray",
        dimgrey: "dimgrey",
        dodgerblue: "dodgerblue",
        firebrick: "firebrick",
        floralwhite: "floralwhite",
        forestgreen: "forestgreen",
        fuchsia: "fuchsia",
        gainsboro: "gainsboro",
        ghostwhite: "ghostwhite",
        gold: "gold",
        goldenrod: "goldenrod",
        gray: "gray",
        green: "green",
        greenyellow: "greenyellow",
        hotpink: "hotpink",
        indianred: "indianred",
        indigo: "indigo",
        ivory: "ivory",
        khaki: "khaki",
        lavender: "lavender",
        lavenderblush: "lavenderblush",
        lawngreen: "lawngreen",
        lemonchiffon: "lemonchiffon",
        lightblue: "lightblue",
        lightcoral: "lightcoral",
        lightcyan: "lightcyan",
        lightgoldenrodyellow: "lightgoldenrodyellow",
        lightgray: "lightgray",
        lightgreen: "lightgreen",
        lightgrey: "lightgrey",
        lightpink: "lightpink",
        lightsalmon: "lightsalmon",
        lightseagreen: "lightseagreen",
        lightskyblue: "lightskyblue",
        lightslategray: "lightslategray",
        lightslategrey: "lightslategrey",
        lightsteelblue: "lightsteelblue",
        lightyellow: "lightyellow",
        lime: "lime",
        limegreen: "limegreen",
        linen: "linen",
        magenta: "magenta",
        maroon: "maroon",
        mediumaquamarine: "mediumaquamarine",
        mediumblue: "mediumblue",
        mediumorchid: "mediumorchid",
        mediumpurple: "mediumpurple",
        mediumseagreen: "mediumseagreen",
        mediumslateblue: "mediumslateblue",
        mediumspringgreen: "mediumspringgreen",
        mediumturquoise: "mediumturquoise",
        mediumvioletred: "mediumvioletred",
        midnightblue: "midnightblue",
        mintcream: "mintcream",
        mistyrose: "mistyrose",
        moccasin: "moccasin",
        navajowhite: "navajowhite",
        navy: "navy",
        oldlace: "oldlace",
        olive: "olive",
        olivedrab: "olivedrab",
        orange: "orange",
        orangered: "orangered",
        orchid: "orchid",
        palegoldenrod: "palegoldenrod",
        palegreen: "palegreen",
        palevioletred: "palevioletred",
        papayawhip: "papayawhip",
        peachpuff: "peachpuff",
        peru: "peru",
        pink: "pink",
        plum: "plum",
        powderblue: "powderblue",
        purple: "purple",
        rebeccapurple: "rebeccapurple",
        red: "red",
        rosybrown: "rosybrown",
        royalblue: "royalblue",
        saddlebrown: "saddlebrown",
        salmon: "salmon",
        sandybrown: "sandybrown",
        seagreen: "seagreen",
        seashell: "seashell",
        sienna: "sienna",
        silver: "silver",
        skyblue: "skyblue",
        slateblue: "slateblue",
        slategray: "slategray",
        slategrey: "slategrey",
        snow: "snow",
        springgreen: "springgreen",
        steelblue: "steelblue",
        tan: "tan",
        teal: "teal",
        thistle: "thistle",
        tomato: "tomato",
        turquoise: "turquoise",
        violet: "violet",
        wheat: "wheat",
        white: "white",
        whitesmoke: "whitesmoke",
        yellow: "yellow",
        yellowgreen: "yellowgreen"
      },
      type: String,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "spellPointsBarColorEnd",
    {
      name: "action-pack-enhanced.settings.spell-points-bar-color-end",
      hint: "action-pack-enhanced.settings.spell-points-bar-color-end-hint",
      scope: "client",
      config: a,
      default: "gray",
      choices: {
        aliceblue: "aliceblue",
        antiquewhite: "antiquewhite",
        aqua: "aqua",
        aquamarine: "aquamarine",
        azure: "azure",
        beige: "beige",
        bisque: "bisque",
        black: "black",
        blanchedalmond: "blanchedalmond",
        blue: "blue",
        blueviolet: "blueviolet",
        brown: "brown",
        burlywood: "burlywood",
        cadetblue: "cadetblue",
        chartreuse: "chartreuse",
        chocolate: "chocolate",
        coral: "coral",
        cornflowerblue: "cornflowerblue",
        cornsilk: "cornsilk",
        crimson: "crimson",
        cyan: "cyan",
        darkblue: "darkblue",
        darkcyan: "darkcyan",
        darkgoldenrod: "darkgoldenrod",
        darkgray: "darkgray",
        darkgreen: "darkgreen",
        darkgrey: "darkgrey",
        darkkhaki: "darkkhaki",
        darkmagenta: "darkmagenta",
        darkolivegreen: "darkolivegreen",
        darkorange: "darkorange",
        darkorchid: "darkorchid",
        darkred: "darkred",
        darksalmon: "darksalmon",
        darkseagreen: "darkseagreen",
        darkslateblue: "darkslateblue",
        darkslategray: "darkslategray",
        darkslategrey: "darkslategrey",
        darkturquoise: "darkturquoise",
        darkviolet: "darkviolet",
        deeppink: "deeppink",
        deepskyblue: "deepskyblue",
        dimgray: "dimgray",
        dimgrey: "dimgrey",
        dodgerblue: "dodgerblue",
        firebrick: "firebrick",
        floralwhite: "floralwhite",
        forestgreen: "forestgreen",
        fuchsia: "fuchsia",
        gainsboro: "gainsboro",
        ghostwhite: "ghostwhite",
        gold: "gold",
        goldenrod: "goldenrod",
        gray: "gray",
        green: "green",
        greenyellow: "greenyellow",
        hotpink: "hotpink",
        indianred: "indianred",
        indigo: "indigo",
        ivory: "ivory",
        khaki: "khaki",
        lavender: "lavender",
        lavenderblush: "lavenderblush",
        lawngreen: "lawngreen",
        lemonchiffon: "lemonchiffon",
        lightblue: "lightblue",
        lightcoral: "lightcoral",
        lightcyan: "lightcyan",
        lightgoldenrodyellow: "lightgoldenrodyellow",
        lightgray: "lightgray",
        lightgreen: "lightgreen",
        lightgrey: "lightgrey",
        lightpink: "lightpink",
        lightsalmon: "lightsalmon",
        lightseagreen: "lightseagreen",
        lightskyblue: "lightskyblue",
        lightslategray: "lightslategray",
        lightslategrey: "lightslategrey",
        lightsteelblue: "lightsteelblue",
        lightyellow: "lightyellow",
        lime: "lime",
        limegreen: "limegreen",
        linen: "linen",
        magenta: "magenta",
        maroon: "maroon",
        mediumaquamarine: "mediumaquamarine",
        mediumblue: "mediumblue",
        mediumorchid: "mediumorchid",
        mediumpurple: "mediumpurple",
        mediumseagreen: "mediumseagreen",
        mediumslateblue: "mediumslateblue",
        mediumspringgreen: "mediumspringgreen",
        mediumturquoise: "mediumturquoise",
        mediumvioletred: "mediumvioletred",
        midnightblue: "midnightblue",
        mintcream: "mintcream",
        mistyrose: "mistyrose",
        moccasin: "moccasin",
        navajowhite: "navajowhite",
        navy: "navy",
        oldlace: "oldlace",
        olive: "olive",
        olivedrab: "olivedrab",
        orange: "orange",
        orangered: "orangered",
        orchid: "orchid",
        palegoldenrod: "palegoldenrod",
        palegreen: "palegreen",
        palevioletred: "palevioletred",
        papayawhip: "papayawhip",
        peachpuff: "peachpuff",
        peru: "peru",
        pink: "pink",
        plum: "plum",
        powderblue: "powderblue",
        purple: "purple",
        rebeccapurple: "rebeccapurple",
        red: "red",
        rosybrown: "rosybrown",
        royalblue: "royalblue",
        saddlebrown: "saddlebrown",
        salmon: "salmon",
        sandybrown: "sandybrown",
        seagreen: "seagreen",
        seashell: "seashell",
        sienna: "sienna",
        silver: "silver",
        skyblue: "skyblue",
        slateblue: "slateblue",
        slategray: "slategray",
        slategrey: "slategrey",
        snow: "snow",
        springgreen: "springgreen",
        steelblue: "steelblue",
        tan: "tan",
        teal: "teal",
        thistle: "thistle",
        tomato: "tomato",
        turquoise: "turquoise",
        violet: "violet",
        wheat: "wheat",
        white: "white",
        whitesmoke: "whitesmoke",
        yellow: "yellow",
        yellowgreen: "yellowgreen"
      },
      type: String,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-no-uses",
    {
      name: "action-pack-enhanced.settings.show-no-uses",
      hint: "action-pack-enhanced.settings.show-no-uses-hint",
      scope: "client",
      config: !0,
      default: !1,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "sort-alphabetic",
    {
      name: "action-pack-enhanced.settings.sort-alphabetic",
      hint: "action-pack-enhanced.settings.sort-alphabetic-hint",
      scope: "client",
      config: !0,
      default: !1,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-unprepared-cantrips",
    {
      name: "action-pack-enhanced.settings.show-unprepared-cantrips",
      hint: "action-pack-enhanced.settings.show-unprepared-cantrips-hint",
      scope: "client",
      config: !0,
      default: !1,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-unprepared-spells",
    {
      name: "action-pack-enhanced.settings.show-unprepared-spells",
      hint: "action-pack-enhanced.settings.show-unprepared-spells-hint",
      scope: "client",
      config: !0,
      default: !1,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "show-weapon-mastery",
    {
      name: "action-pack-enhanced.settings.show-weapon-mastery",
      hint: "action-pack-enhanced.settings.show-weapon-mastery-hint",
      scope: "client",
      config: !0,
      default: !1,
      type: Boolean,
      onChange: () => e()
    }
  ), game.settings.register(
    "action-pack-enhanced",
    "use-control-button",
    {
      name: "action-pack-enhanced.settings.use-control-button",
      hint: "action-pack-enhanced.settings.use-control-button-hint",
      scope: "client",
      config: !0,
      default: !0,
      type: Boolean,
      onChange: () => window.location.reload()
    }
  ), game.keybindings.register("action-pack-enhanced", "toggle-tray", {
    name: "action-pack-enhanced.keybindings.toggle-tray",
    editable: [
      { key: "KeyE", modifiers: [] }
    ],
    onDown: (l) => {
      s() || ($("#ape-app").toggleClass("is-open"), $("#ape-app .ape-skill-container").removeClass("is-open"));
    }
  });
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const G = globalThis, le = G.ShadowRoot && (G.ShadyCSS === void 0 || G.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ze = Symbol(), Se = /* @__PURE__ */ new WeakMap();
let vt = class {
  constructor(e, t, a) {
    if (this._$cssResult$ = !0, a !== ze) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (le && e === void 0) {
      const a = t !== void 0 && t.length === 1;
      a && (e = Se.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), a && Se.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const $t = (n) => new vt(typeof n == "string" ? n : n + "", void 0, ze), kt = (n, e) => {
  if (le) n.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const a = document.createElement("style"), s = G.litNonce;
    s !== void 0 && a.setAttribute("nonce", s), a.textContent = t.cssText, n.appendChild(a);
  }
}, Ae = le ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const a of e.cssRules) t += a.cssText;
  return $t(t);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: wt, defineProperty: _t, getOwnPropertyDescriptor: St, getOwnPropertyNames: At, getOwnPropertySymbols: xt, getPrototypeOf: Ct } = Object, x = globalThis, xe = x.trustedTypes, Et = xe ? xe.emptyScript : "", Q = x.reactiveElementPolyfillSupport, N = (n, e) => n, ne = { toAttribute(n, e) {
  switch (e) {
    case Boolean:
      n = n ? Et : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, e) {
  let t = n;
  switch (e) {
    case Boolean:
      t = n !== null;
      break;
    case Number:
      t = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(n);
      } catch {
        t = null;
      }
  }
  return t;
} }, je = (n, e) => !wt(n, e), Ce = { attribute: !0, type: String, converter: ne, reflect: !1, useDefault: !1, hasChanged: je };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), x.litPropertyMetadata ?? (x.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let R = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Ce) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const a = Symbol(), s = this.getPropertyDescriptor(e, a, t);
      s !== void 0 && _t(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, a) {
    const { get: s, set: i } = St(this.prototype, e) ?? { get() {
      return this[t];
    }, set(l) {
      this[t] = l;
    } };
    return { get: s, set(l) {
      const o = s == null ? void 0 : s.call(this);
      i == null || i.call(this, l), this.requestUpdate(e, o, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ce;
  }
  static _$Ei() {
    if (this.hasOwnProperty(N("elementProperties"))) return;
    const e = Ct(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(N("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(N("properties"))) {
      const t = this.properties, a = [...At(t), ...xt(t)];
      for (const s of a) this.createProperty(s, t[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [a, s] of t) this.elementProperties.set(a, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, a] of this.elementProperties) {
      const s = this._$Eu(t, a);
      s !== void 0 && this._$Eh.set(s, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const a = new Set(e.flat(1 / 0).reverse());
      for (const s of a) t.unshift(Ae(s));
    } else e !== void 0 && t.push(Ae(e));
    return t;
  }
  static _$Eu(e, t) {
    const a = t.attribute;
    return a === !1 ? void 0 : typeof a == "string" ? a : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const a of t.keys()) this.hasOwnProperty(a) && (e.set(a, this[a]), delete this[a]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return kt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var a;
      return (a = t.hostConnected) == null ? void 0 : a.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var a;
      return (a = t.hostDisconnected) == null ? void 0 : a.call(t);
    });
  }
  attributeChangedCallback(e, t, a) {
    this._$AK(e, a);
  }
  _$ET(e, t) {
    var i;
    const a = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, a);
    if (s !== void 0 && a.reflect === !0) {
      const l = (((i = a.converter) == null ? void 0 : i.toAttribute) !== void 0 ? a.converter : ne).toAttribute(t, a.type);
      this._$Em = e, l == null ? this.removeAttribute(s) : this.setAttribute(s, l), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var i, l;
    const a = this.constructor, s = a._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const o = a.getPropertyOptions(s), r = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((i = o.converter) == null ? void 0 : i.fromAttribute) !== void 0 ? o.converter : ne;
      this._$Em = s;
      const d = r.fromAttribute(t, o.type);
      this[s] = d ?? ((l = this._$Ej) == null ? void 0 : l.get(s)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, t, a, s = !1, i) {
    var l;
    if (e !== void 0) {
      const o = this.constructor;
      if (s === !1 && (i = this[e]), a ?? (a = o.getPropertyOptions(e)), !((a.hasChanged ?? je)(i, t) || a.useDefault && a.reflect && i === ((l = this._$Ej) == null ? void 0 : l.get(e)) && !this.hasAttribute(o._$Eu(e, a)))) return;
      this.C(e, t, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: a, reflect: s, wrapped: i }, l) {
    a && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, l ?? t ?? this[e]), i !== !0 || l !== void 0) || (this._$AL.has(e) || (this.hasUpdated || a || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var a;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [i, l] of this._$Ep) this[i] = l;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, l] of s) {
        const { wrapped: o } = l, r = this[i];
        o !== !0 || this._$AL.has(i) || r === void 0 || this.C(i, void 0, l, r);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (a = this._$EO) == null || a.forEach((s) => {
        var i;
        return (i = s.hostUpdate) == null ? void 0 : i.call(s);
      }), this.update(t)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((a) => {
      var s;
      return (s = a.hostUpdated) == null ? void 0 : s.call(a);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
R.elementStyles = [], R.shadowRootOptions = { mode: "open" }, R[N("elementProperties")] = /* @__PURE__ */ new Map(), R[N("finalized")] = /* @__PURE__ */ new Map(), Q == null || Q({ ReactiveElement: R }), (x.reactiveElementVersions ?? (x.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = globalThis, Ee = (n) => n, V = z.trustedTypes, Pe = V ? V.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, Be = "$lit$", A = `lit$${Math.random().toFixed(9).slice(2)}$`, Le = "?" + A, Pt = `<${Le}>`, D = document, j = () => D.createComment(""), B = (n) => n === null || typeof n != "object" && typeof n != "function", oe = Array.isArray, Ot = (n) => oe(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", ee = `[ 	
\f\r]`, H = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Oe = /-->/g, Te = />/g, O = RegExp(`>|${ee}(?:([^\\s"'>=/]+)(${ee}*=${ee}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), qe = /'/g, De = /"/g, Fe = /^(?:script|style|textarea|title)$/i, Tt = (n) => (e, ...t) => ({ _$litType$: n, strings: e, values: t }), g = Tt(1), U = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), Ue = /* @__PURE__ */ new WeakMap(), T = D.createTreeWalker(D, 129);
function We(n, e) {
  if (!oe(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Pe !== void 0 ? Pe.createHTML(e) : e;
}
const qt = (n, e) => {
  const t = n.length - 1, a = [];
  let s, i = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", l = H;
  for (let o = 0; o < t; o++) {
    const r = n[o];
    let d, p, c = -1, u = 0;
    for (; u < r.length && (l.lastIndex = u, p = l.exec(r), p !== null); ) u = l.lastIndex, l === H ? p[1] === "!--" ? l = Oe : p[1] !== void 0 ? l = Te : p[2] !== void 0 ? (Fe.test(p[2]) && (s = RegExp("</" + p[2], "g")), l = O) : p[3] !== void 0 && (l = O) : l === O ? p[0] === ">" ? (l = s ?? H, c = -1) : p[1] === void 0 ? c = -2 : (c = l.lastIndex - p[2].length, d = p[1], l = p[3] === void 0 ? O : p[3] === '"' ? De : qe) : l === De || l === qe ? l = O : l === Oe || l === Te ? l = H : (l = O, s = void 0);
    const m = l === O && n[o + 1].startsWith("/>") ? " " : "";
    i += l === H ? r + Pt : c >= 0 ? (a.push(d), r.slice(0, c) + Be + r.slice(c) + A + m) : r + A + (c === -2 ? o : m);
  }
  return [We(n, i + (n[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), a];
};
class L {
  constructor({ strings: e, _$litType$: t }, a) {
    let s;
    this.parts = [];
    let i = 0, l = 0;
    const o = e.length - 1, r = this.parts, [d, p] = qt(e, t);
    if (this.el = L.createElement(d, a), T.currentNode = this.el.content, t === 2 || t === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (s = T.nextNode()) !== null && r.length < o; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const c of s.getAttributeNames()) if (c.endsWith(Be)) {
          const u = p[l++], m = s.getAttribute(c).split(A), f = /([.?@])?(.*)/.exec(u);
          r.push({ type: 1, index: i, name: f[2], strings: m, ctor: f[1] === "." ? Ut : f[1] === "?" ? It : f[1] === "@" ? Rt : Z }), s.removeAttribute(c);
        } else c.startsWith(A) && (r.push({ type: 6, index: i }), s.removeAttribute(c));
        if (Fe.test(s.tagName)) {
          const c = s.textContent.split(A), u = c.length - 1;
          if (u > 0) {
            s.textContent = V ? V.emptyScript : "";
            for (let m = 0; m < u; m++) s.append(c[m], j()), T.nextNode(), r.push({ type: 2, index: ++i });
            s.append(c[u], j());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Le) r.push({ type: 2, index: i });
      else {
        let c = -1;
        for (; (c = s.data.indexOf(A, c + 1)) !== -1; ) r.push({ type: 7, index: i }), c += A.length - 1;
      }
      i++;
    }
  }
  static createElement(e, t) {
    const a = D.createElement("template");
    return a.innerHTML = e, a;
  }
}
function M(n, e, t = n, a) {
  var l, o;
  if (e === U) return e;
  let s = a !== void 0 ? (l = t._$Co) == null ? void 0 : l[a] : t._$Cl;
  const i = B(e) ? void 0 : e._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== i && ((o = s == null ? void 0 : s._$AO) == null || o.call(s, !1), i === void 0 ? s = void 0 : (s = new i(n), s._$AT(n, t, a)), a !== void 0 ? (t._$Co ?? (t._$Co = []))[a] = s : t._$Cl = s), s !== void 0 && (e = M(n, s._$AS(n, e.values), s, a)), e;
}
class Dt {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: a } = this._$AD, s = ((e == null ? void 0 : e.creationScope) ?? D).importNode(t, !0);
    T.currentNode = s;
    let i = T.nextNode(), l = 0, o = 0, r = a[0];
    for (; r !== void 0; ) {
      if (l === r.index) {
        let d;
        r.type === 2 ? d = new W(i, i.nextSibling, this, e) : r.type === 1 ? d = new r.ctor(i, r.name, r.strings, this, e) : r.type === 6 && (d = new Mt(i, this, e)), this._$AV.push(d), r = a[++o];
      }
      l !== (r == null ? void 0 : r.index) && (i = T.nextNode(), l++);
    }
    return T.currentNode = D, s;
  }
  p(e) {
    let t = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(e, a, t), t += a.strings.length - 2) : a._$AI(e[t])), t++;
  }
}
class W {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, a, s) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = a, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = M(this, e, t), B(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== U && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ot(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && B(this._$AH) ? this._$AA.nextSibling.data = e : this.T(D.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var i;
    const { values: t, _$litType$: a } = e, s = typeof a == "number" ? this._$AC(e) : (a.el === void 0 && (a.el = L.createElement(We(a.h, a.h[0]), this.options)), a);
    if (((i = this._$AH) == null ? void 0 : i._$AD) === s) this._$AH.p(t);
    else {
      const l = new Dt(s, this), o = l.u(this.options);
      l.p(t), this.T(o), this._$AH = l;
    }
  }
  _$AC(e) {
    let t = Ue.get(e.strings);
    return t === void 0 && Ue.set(e.strings, t = new L(e)), t;
  }
  k(e) {
    oe(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let a, s = 0;
    for (const i of e) s === t.length ? t.push(a = new W(this.O(j()), this.O(j()), this, this.options)) : a = t[s], a._$AI(i), s++;
    s < t.length && (this._$AR(a && a._$AB.nextSibling, s), t.length = s);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var a;
    for ((a = this._$AP) == null ? void 0 : a.call(this, !1, !0, t); e !== this._$AB; ) {
      const s = Ee(e).nextSibling;
      Ee(e).remove(), e = s;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class Z {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, a, s, i) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = i, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = h;
  }
  _$AI(e, t = this, a, s) {
    const i = this.strings;
    let l = !1;
    if (i === void 0) e = M(this, e, t, 0), l = !B(e) || e !== this._$AH && e !== U, l && (this._$AH = e);
    else {
      const o = e;
      let r, d;
      for (e = i[0], r = 0; r < i.length - 1; r++) d = M(this, o[a + r], t, r), d === U && (d = this._$AH[r]), l || (l = !B(d) || d !== this._$AH[r]), d === h ? e = h : e !== h && (e += (d ?? "") + i[r + 1]), this._$AH[r] = d;
    }
    l && !s && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ut extends Z {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class It extends Z {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class Rt extends Z {
  constructor(e, t, a, s, i) {
    super(e, t, a, s, i), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = M(this, e, t, 0) ?? h) === U) return;
    const a = this._$AH, s = e === h && a !== h || e.capture !== a.capture || e.once !== a.once || e.passive !== a.passive, i = e !== h && (a === h || s);
    s && this.element.removeEventListener(this.name, this, a), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Mt {
  constructor(e, t, a) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    M(this, e);
  }
}
const te = z.litHtmlPolyfillSupport;
te == null || te(L, W), (z.litHtmlVersions ?? (z.litHtmlVersions = [])).push("3.3.2");
const Ht = (n, e, t) => {
  const a = (t == null ? void 0 : t.renderBefore) ?? e;
  let s = a._$litPart$;
  if (s === void 0) {
    const i = (t == null ? void 0 : t.renderBefore) ?? null;
    a._$litPart$ = s = new W(e.insertBefore(j(), i), i, void 0, t ?? {});
  }
  return s._$AI(n), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const q = globalThis;
let _ = class extends R {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ht(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return U;
  }
};
var Re;
_._$litElement$ = !0, _.finalized = !0, (Re = q.litElementHydrateSupport) == null || Re.call(q, { LitElement: _ });
const ae = q.litElementPolyfillSupport;
ae == null || ae({ LitElement: _ });
(q.litElementVersions ?? (q.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Nt = { CHILD: 2 }, zt = (n) => (...e) => ({ _$litDirective$: n, values: e });
class jt {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, t, a) {
    this._$Ct = e, this._$AM = t, this._$Ci = a;
  }
  _$AS(e, t) {
    return this.update(e, t);
  }
  update(e, t) {
    return this.render(...t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class ie extends jt {
  constructor(e) {
    if (super(e), this.it = h, e.type !== Nt.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(e) {
    if (e === h || e == null) return this._t = void 0, this.it = e;
    if (e === U) return e;
    if (typeof e != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (e === this.it) return this._t;
    this.it = e;
    const t = [e];
    return t.raw = t, this._t = { _$litType$: this.constructor.resultType, strings: t, values: [] };
  }
}
ie.directiveName = "unsafeHTML", ie.resultType = 1;
const Bt = zt(ie);
class Xe extends _ {
  // Use Light DOM to inherit global styles
  createRenderRoot() {
    return this;
  }
  _onRoll(e) {
    e.preventDefault(), e.stopPropagation(), this.api.rollItem(this.item, e, this.castLevel);
  }
  _onRecharge(e) {
    e.preventDefault(), e.stopPropagation(), this.api.rollRecharge(this.item);
  }
  _onDragStart(e) {
    e.dataTransfer.setData("text/plain", JSON.stringify({
      type: "ActionPackItem",
      uuid: this.item.uuid,
      actionPack: !0
    })), e.stopPropagation();
  }
  async _onClick(e) {
    this.expanded = !this.expanded, this.expanded && !this.description && (this.description = await this.api.getItemDescription(this.item));
  }
  render() {
    var ue, he, ge, me, fe, ye, be, ve, $e, ke, we, _e;
    if (!this.item) return h;
    const e = this.item.system, t = this.item.actor, a = e.rarity !== "" ? e.rarity : this.item.type === "weapon" ? "common" : "", s = this.item.type === "spell", i = e.method === "innate", l = this.uses && (!s || i), o = (ue = e.properties) == null ? void 0 : ue.has("ritual"), r = (he = e.properties) == null ? void 0 : he.has("concentration"), d = ((ge = e.activation) == null ? void 0 : ge.type) === "bonus", p = ((me = e.activation) == null ? void 0 : me.type) === "reaction", c = ((fe = e.activation) == null ? void 0 : fe.type) === "legendary", u = (ye = this.item) == null ? void 0 : ye.hasRecharge, m = !this.item.isOnCooldown, f = e.equipped, k = this.item.type === "equipment" && (e.identified && e.identifier === "shield" || this.item.name.includes("Shield"));
    let S = null;
    if (u && ((be = e.uses) != null && be.recovery)) {
      const w = e.uses.recovery.find((J) => J.period === "recharge");
      w && (S = w.formula);
    }
    let E = !1, y = !1, b = "";
    if (game.modules.find((w) => w.id === "wm5e") && ((ve = game.modules.get("wm5e")) != null && ve.active) && (E = e.mastery || !1, E && this.item.type === "weapon")) {
      const w = ($e = e.type) == null ? void 0 : $e.baseItem, J = new Set(this.masteryIds || ((_e = (we = (ke = t.system.traits) == null ? void 0 : ke.weaponProf) == null ? void 0 : we.mastery) == null ? void 0 : _e.value) || []);
      y = w && J.has(w), b = game.i18n.localize(`action-pack-enhanced.masteries.${E}`);
    }
    const P = !!t.itemTypes.feat.find((w) => w.name === "Ritual Adept"), v = e.prepared === 0 && !(o && P);
    return g`
            <div class="item-name rollable flexrow ${v ? "unprepared" : ""}">
                <div class="item-image ${a}${v ? " unprepared" : ""}" 
                        style="background-image: url('${this.item.img}')"
                        @mousedown="${this._onRoll}">
                    <i class="fa fa-dice-d20"></i>
                </div>
                
                <div class="item-name-wrap flexrow">
                    <h4 @mousedown="${this._onClick}">
                        <span class="item-text ${a}">${this.item.name}</span>
                        ${l ? g` (${this.uses.available}${this.uses.maximum ? "/" + this.uses.maximum : ""})` : h}
                    </h4>
                    ${this.showWeaponMastery ? this._renderWeaponMastery(E, y, b) : h}
                </div>

                ${o ? g`<div class="ritual flag" title="${game.i18n.localize("action-pack-enhanced.flag.ritual-title")}"></div>` : h}
                ${r ? g`<div class="concentration flag" title="${game.i18n.localize("action-pack-enhanced.flag.concentration-title")}"></div>` : h}
                ${d ? g`<div class="bonus flag" title="${game.i18n.localize("action-pack-enhanced.flag.bonus-title")}">${game.i18n.localize("action-pack-enhanced.flag.bonus")}</div>` : h}
                ${p ? g`<div class="reaction flag" title="${game.i18n.localize("action-pack-enhanced.flag.reaction-title")}">${game.i18n.localize("action-pack-enhanced.flag.reaction")}</div>` : h}
                ${c ? g`<div class="legendary flag" title="${game.i18n.localize("action-pack-enhanced.flag.legendary-title")}">${game.i18n.localize("action-pack-enhanced.flag.legendary")}</div>` : h}

                ${u ? m ? g`<div class="flag"><i class="fas fa-bolt"></i></div>` : g`<div class="flag"><a class="rollable item-recharge" @mousedown="${this._onRecharge}"><i class="fas fa-dice-six"></i> ${S}+</a></div>` : h}

                ${v ? g`<div class="unprepared flag" title="${game.i18n.localize("action-pack-enhanced.flag.unprepared-title")}">${game.i18n.localize("action-pack-enhanced.flag.unprepared")}</div>` : h}
                ${(this.item.type === "weapon" || k) && !f ? g`<div class="unequipped flag" title="${game.i18n.localize("action-pack-enhanced.flag.unequipped-title")}" @mousedown="${this._onEquip}">${game.i18n.localize("action-pack-enhanced.flag.unequipped")}</div>` : h}
            </div>
            
            <div class="item-drag-handle"
                    draggable="true"
                    title="${game.i18n.localize("action-pack-enhanced.drag-to-target")}"
                    @dragstart="${this._onDragStart}">
                <i class="fas fa-grip-vertical"></i>
            </div>

            ${this._renderDamage()}

            ${this.expanded ? g`
                <div class="item-summary" style="display:block">
                    ${this._renderItemDetails()}
                    ${this.description ? g`<p>${Bt(this.description.description)}</p>` : g`<i class="fas fa-spinner fa-spin"></i>`}
                    <div class="item-properties">
                        ${this._renderItemProperties(this.item)}
                    </div>
                </div>
            ` : h}
        `;
  }
  _onEquip(e) {
    e.preventDefault(), e.stopPropagation(), this.item.update({ "system.equipped": !0 });
  }
  _renderDamage() {
    if (!this.showSpellDamage || !["spell", "weapon", "feat"].includes(this.item.type)) return h;
    const e = lt(this.item, this.castLevel);
    return e.length ? g`
            <div class="ape-item-damage">
                ${e.map((t) => g`
                    <span class="ape-damage ape-damage-${t.kind} ape-damage-type-${t.typeKey || "none"}">
                        ${t.formula}${t.typeLabel ? g` ${t.typeLabel}` : h}
                    </span>
                `)}
            </div>
        ` : h;
  }
  _renderItemDetails() {
    const e = et(this.item);
    return g`
            ${e.school ? g`<p><strong>School:</strong> ${e.school}</p>` : h}
            ${e.castingTime ? g`<p><strong>Casting Time:</strong> ${e.castingTime}</p>` : h}
            ${e.range ? g`<p><strong>Range:</strong> ${e.range}</p>` : h}
            ${e.duration ? g`<p><strong>Duration:</strong> ${e.duration}</p>` : h}
            ${e.materials ? g`<p><strong>Materials:</strong> ${e.materials}</p>` : h}
        `;
  }
  _renderItemProperties(e) {
    var i, l, o, r, d;
    const t = ((i = e == null ? void 0 : e.labels) == null ? void 0 : i.properties) || [], a = e.labels.hasOwnProperty("damageTypes") ? (o = (l = e == null ? void 0 : e.labels) == null ? void 0 : l.damageTypes) != null && o.includes(",") ? (r = e == null ? void 0 : e.labels) == null ? void 0 : r.damageTypes.split(",") : [(d = e == null ? void 0 : e.labels) == null ? void 0 : d.damageTypes] : [], s = [];
    if (a.length > 0) {
      const c = a.map((u) => ({ label: u })).map((u) => u.label);
      s.push(...c);
    }
    if (t.length > 0) {
      const p = t.map((c) => c.label);
      p.sort((c, u) => c.toLowerCase().localeCompare(u.toLowerCase())), s.push(...p);
    }
    return s.length === 0 ? h : g`
            ${s ? g`${s.map((p) => g`<span class="tag">${p}</span>`)} ` : h}
        `;
  }
  _renderWeaponMastery(e, t, a) {
    var s;
    return (s = game.modules.get("wm5e")) != null && s.active && e ? g`<div class="mastery ${t ? "active" : "inactive"} flag">${a}</div>` : h;
  }
}
I(Xe, "properties", {
  item: { type: Object },
  uses: { type: Object },
  api: { type: Object },
  masteryIds: { type: Array },
  castLevel: { type: Number },
  expanded: { type: Boolean, state: !0 },
  description: { type: Object, state: !0 },
  showSpellDamage: { type: Boolean },
  showWeaponMastery: { type: Boolean }
});
customElements.define("ape-item", Xe);
class Ge extends _ {
  _openJournal(e) {
    fromUuid(e).then((t) => {
      var a;
      return (a = t == null ? void 0 : t.sheet) == null ? void 0 : a.render(!0);
    });
  }
  constructor() {
    super(), this.isOpen = !0;
  }
  createRenderRoot() {
    return this;
  }
  updated(e) {
    this.classList.toggle("is-open", this.isOpen), e.has("forceOpen") && this.forceOpen && (this.isOpen || (this.isOpen = !0));
  }
  _toggleOpen(e) {
    e.stopPropagation(), this.isOpen = !this.isOpen;
  }
  _onDrop(e, t, a) {
    e.preventDefault();
    const s = JSON.parse(e.dataTransfer.getData("text/plain"));
    s.uuid && this.api.setWeaponSetItem(this.actor, t, a, s.uuid, s.rarity);
  }
  _renderWeaponSets() {
    return this.weaponSets ? g`
            <div class="ape-weapon-sets">
                ${this.weaponSets.map((e) => g`
                    <div class="ape-weapon-set ${e.active ? "active" : ""}" @click="${() => this.api.equipWeaponSet(this.actor, e.index)}">
                        <div class="ape-weapon-slot ${e.main ? "filled " + e.main.rarity : "empty"}" 
                                @drop="${(t) => this._onDrop(t, e.index, "main")}" 
                                @dragover="${(t) => t.preventDefault()}"
                                @contextmenu="${(t) => this.api.clearWeaponSetItem(this.actor, e.index, "main")}">
                            ${e.main ? g`<img src="${e.main.img}" title="${e.main.name}">` : g`<i class="fas fa-sword"></i>`}
                        </div>
                        <div class="ape-weapon-slot ${e.off ? "filled " + e.off.rarity : "empty"}" 
                                @drop="${(t) => this._onDrop(t, e.index, "off")}" 
                                @dragover="${(t) => t.preventDefault()}"
                                @contextmenu="${(t) => this.api.clearWeaponSetItem(this.actor, e.index, "off")}">
                            ${e.off ? g`<img src="${e.off.img}" title="${e.off.name}" style="height: 100%; width: auto;">` : g`<i class="fas fa-shield"></i>`}
                        </div>
                    </div>
                `)}
            </div>
        ` : h;
  }
  _getReversedPercent(e, t) {
    return Math.floor((t - e) / t * 100);
  }
  render() {
    return g`
            ${this.title ? g`
                <h2 @click="${this._toggleOpen}">
                    <span><i class="fas fa-caret-down"></i> ${game.i18n.localize(this.title)}</span>
                </h2>
            ` : h}

            ${this.uses ? g`<div class="section-uses" style="--percent: ${this._getReversedPercent(this.uses.available, this.uses.maximum)}%; --spellPointsTextColor: ${game.settings.get("action-pack-enhanced", "spellPointsTextColor")}; --spellPointsBarColorStart: ${game.settings.get("action-pack-enhanced", "spellPointsBarColorStart")}; --spellPointsBarColorEnd: ${game.settings.get("action-pack-enhanced", "spellPointsBarColorEnd")}">
                <div class="section-uses-text">${this.uses.available} / ${this.uses.maximum}</div>
                <div class="section-uses-bar"></div>
            </div>` : h}

            ${this._renderWeaponSets()}

            ${this.items && this.items.length > 0 ? g`
                <div class="ape-items">
                    ${this.items.map((e) => {
      var t, a, s, i, l;
      return g`
                        <ape-item class="ape-item item"
                            data-item-uuid="${e.item.uuid}"
                            .item="${e.item}"
                            .uses="${e.uses}"
                            .api="${this.api}"
                            .castLevel="${e.castLevel}"
                            .masteryIds="${(l = (i = (s = (a = (t = this.actor) == null ? void 0 : t.system) == null ? void 0 : a.traits) == null ? void 0 : s.weaponProf) == null ? void 0 : i.mastery) == null ? void 0 : l.value}"
                            .showSpellDamage="${this.showSpellDamage}"
                            .showWeaponMastery="${this.showWeaponMastery}">
                        </ape-item>
                    `;
    })}
                </div>
            ` : h}

            ${this.groups ? Object.entries(this.groups).map(([e, t]) => g`
                <ape-group 
                    class="ape-group"
                    .group="${t}" 
                    .groupName="${e}" 
                    .api="${this.api}"
                    .actor="${this.actor}"
                    .showSpellDots="${this.showSpellDots}"
                    .showSpellUses="${this.showSpellUses}"
                    .showSpellDamage="${this.showSpellDamage}">
                </ape-group>
            `) : h}
        `;
  }
}
I(Ge, "properties", {
  title: { type: String },
  uses: { type: Object },
  items: { type: Array },
  // Array of {item, uses} objects
  weaponSets: { type: Array },
  // Array of Weapon Sets
  groups: { type: Object },
  // Object of groups
  sectionId: { type: String },
  isOpen: { type: Boolean, state: !0 },
  api: { type: Object },
  showSpellDots: { type: Boolean },
  showSpellUses: { type: Boolean },
  showSpellDamage: { type: Boolean },
  actor: { type: Object },
  masteries: { type: Object },
  forceOpen: { type: Boolean },
  showWeaponMastery: { type: Boolean }
});
customElements.define("ape-section", Ge);
class Ve extends _ {
  constructor() {
    var e;
    super(), this.isOpen = !0, this.showCost = !!((e = game.modules.get("dnd5e-spellpoints")) != null && e.active);
  }
  createRenderRoot() {
    return this;
  }
  updated(e) {
    e.has("isOpen") && this.classList.toggle("is-open", this.isOpen), e.has("groupName") && (this.dataset.groupId = this.groupName);
  }
  _toggleOpen(e) {
    e.target.closest(".group-dots") || (this.isOpen = !this.isOpen);
  }
  render() {
    if (!this.group) return h;
    const { items: e, uses: t, title: a, cost: s } = this.group, i = e && e.length > 0, l = t && t.maximum, o = s || null;
    if (!i && !l) return h;
    const r = l && this.showSpellDots, d = t && this.showSpellUses, p = o && this.showCost, c = [
      "flexrow",
      "ape-group-header",
      r ? "has-dots" : "",
      d ? "has-uses" : "",
      p ? "has-cost" : ""
    ].filter(Boolean).join(" ");
    return g`
            <div class="${c}" @click="${this._toggleOpen}">
                <h3>
                    <i class="fas fa-caret-down"></i> ${game.i18n.localize(a)}
                </h3>
                ${r ? this._renderDots(t) : h}
                ${d ? g`<div class="group-uses">${t.available}/${t.maximum}</div>` : h}
                ${p ? g`<div class="group-cost">Cost: ${s} SP</div>` : h}
            </div>

            ${i ? g`
                <div class="ape-items">
                    ${e.map((u) => g`
                        <ape-item class="ape-item item" data-item-uuid="${u.item.uuid}" .item="${u.item}" .uses="${u.uses}" .api="${this.api}" .castLevel="${u.castLevel}" .showSpellDamage="${this.showSpellDamage}"></ape-item>
                    `)}
                </div>
            ` : h}
        `;
  }
  _renderDots(e) {
    return g`
            <div class="group-dots" data-group-name="${this.groupName}">
                ${Array.from({ length: e.maximum }).map((t, a) => g`
                    <div class="dot ${a < e.available ? "" : "empty"}" 
                         data-slot="${a}"
                         @click="${(s) => {
      s.stopPropagation(), this.api.adjustSpellSlot(this.actor, this.groupName, a);
    }}">
                    </div>
                `)}
            </div>
        `;
  }
}
I(Ve, "properties", {
  group: { type: Object },
  groupName: { type: String },
  api: { type: Object },
  actor: { type: Object },
  showSpellDots: { type: Boolean },
  showSpellUses: { type: Boolean },
  showSpellDamage: { type: Boolean },
  showCost: { type: Boolean },
  isOpen: { type: Boolean, state: !0 },
  forceOpen: { type: Boolean }
});
customElements.define("ape-group", Ve);
class Ke extends _ {
  createRenderRoot() {
    return this;
  }
  updated(e) {
    e.has("actorData") && this.actorData && (this.dataset.actorUuid = this.actorData.actor.uuid);
  }
  render() {
    if (!this.actorData) return h;
    const { actor: e, name: t, sections: a, needsInitiative: s } = this.actorData, i = e.system.attributes.hp, l = e.system.attributes.ac.value, o = e.type, r = i.value <= 0 && o === "character", d = e.system.attributes.inspiration;
    return g`
            <div class="ape-actor-header">
                <div class="ape-actor-header-wrap">
                    <a class="ape-actor-name" @click="${(p) => this.api.openSheet(e)}">${t.split(" ")[0]}</a>
                    <a class="ape-actor-inspiration ${d ? "ape-actor-inspiration-active" : ""}" title="${t} is ${d ? "inspired" : "not inspired"}!" @mousedown="${(p) => this.api.toggleInspiration(e, p)}">
                        <svg width="100%" height="100%" viewBox="0 0 163 191" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
                            <path class="${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M58.699,71.415l0,63.404"/>
                            <path class="${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M78.624,71.415l0,63.404"/>
                            <path class="${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M97.63,71.415l0,63.404"/>
                            <path class="${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M35.88,149.717c-4.526,3.624 -16.665,18.643 -20.574,22.552c30.949,15.518 96.969,17.912 122.372,-1.233c-4.18,-4.18 -18.011,-21.744 -18.295,-22.22c-0.881,9.201 -82.394,9.898 -83.502,0.9Zm-0.489,-101.365l83.626,0.267c0,0 0.366,79.504 0.366,100.197c0,9.081 -83.502,9.982 -83.502,0.9c0,-14.9 -0.489,-101.365 -0.489,-101.365Zm83.714,16.03c0,0 29.622,-0.424 33.244,2.76c4.154,3.651 6.015,31.36 0.334,41.72c-5.681,10.36 -33.166,19.636 -33.166,19.636l-0.412,-64.116Z"/>
                            <path id="foam" class="ape-actor-inspiration-foam ${d ? "ape-actor-inspiration-foam-active" : "ape-actor-inspiration-foam-hidden"} ${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M26.53,76.061c0,0 -24.573,-12.245 -19.621,-37.499c4.953,-25.254 36.384,-1.701 38.194,-0.34c1.81,1.361 -8.286,-33.928 21.049,-31.887c29.336,2.041 31.382,19.982 31.478,26.19c0.095,6.207 8.138,-23.223 34.718,-8.503c17.811,9.864 8.665,25.224 5.33,29.251c-3.364,4.062 -9.328,9.305 -14.471,11.091c-4.583,1.591 -20.853,3.096 -29.719,-11.516c-1.238,-2.041 -0.932,15.302 -9.097,16.357c-3.908,0.505 -14.578,3.667 -23.477,-13.095c-10.105,33.947 -34.384,19.951 -34.384,19.951Z"/>
                        </svg>
                    </a>
                    <span class="ape-actor-ac">
                        <img class="ape-actor-ac-icon" src="/modules/action-pack-enhanced/images/ac-icon.svg">
                        <span class="ape-actor-ac-display">${l}</span>
                    </span>
                 </div>
            </div>

            ${this.globalData.staticInfo ? g`
                <div class="ape-static-info">
                    ${o === "character" ? g`
                        <div class="ape-actor-race-class">
                            ${this._renderRaceClass(e)}
                        </div>
                    ` : h}

                    ${game.settings.get("action-pack-enhanced", "show-xp-info") && o === "character" ? this._renderExperience(e) : h}

                    ${this._renderHpBar(e, i)}

                    <div class="ape-actor-rest-buttons rest-row">
                        <button class="btn ape-actor-rest-button" @click="${() => this.api.shortRest(e)}"><i class="fa-solid fa-utensils"></i> Short Rest</button>
                        <button class="btn ape-actor-rest-button" @click="${() => this.api.longRest(e)}"><i class="fa-solid fa-campground"></i> Long Rest</button>
                    </div>
                </div>
            ` : g`
                <div class="ape-accordion ${this._infoOpen ? "is-open" : ""}">
                    <h2 class="ape-accordion-header" @click="${() => this._toggleAccordion("info")}">
                        <i class="fas fa-caret-down"></i> XP/HP/Rest
                    </h2>
                    <div class="ape-accordion-body">
                        ${o === "character" ? g`
                            <div class="ape-actor-race-class">
                                ${this._renderRaceClass(e)}
                            </div>
                        ` : h}

                        ${game.settings.get("action-pack-enhanced", "show-xp-info") && o === "character" ? this._renderExperience(e) : h}

                        ${this._renderHpBar(e, i)}

                        <div class="ape-actor-rest-buttons rest-row">
                            <button class="btn ape-actor-rest-button" @click="${() => this.api.shortRest(e)}"><i class="fa-solid fa-utensils"></i> Short Rest</button>
                            <button class="btn ape-actor-rest-button" @click="${() => this.api.longRest(e)}"><i class="fa-solid fa-campground"></i> Long Rest</button>
                        </div>
                    </div>
                </div>
            `}

            ${r && !game.settings.get("action-pack-enhanced", "show-death-saves") ? this._renderDeathSaves(e) : h}

            ${s ? g`
                <div class="ape-initiative" @click="${() => this.api.rollInitiative(e)}">
                    <i class="fas fa-swords ape-initiative-icon"></i>
                    <span class="ape-initiative-text">${game.i18n.localize("action-pack-enhanced.roll-initiative")}</span>
                </div>
            ` : h}

            <div class="ape-accordion ${this._abilitiesOpen ? "is-open" : ""}">
                <h2 class="ape-accordion-header" @click="${() => this._toggleAccordion("abilities")}">
                    <i class="fas fa-caret-down"></i> Ability Checks/Saves
                </h2>
                <div class="ape-accordion-body">
                    ${this._renderAbilities(e)}
                </div>
            </div>


            ${this._renderSkills(e)}

            <!-- Sections -->
            ${this._renderSections(e, a)}
        `;
  }
  _renderExperience(e) {
    const t = e.system.details, a = t.xp.pct, s = t.xp.max, i = t.xp.min, l = t.xp.value;
    return g`
            <div class="ape-actor-xp bar-group">
                <div class="bar-label">
                    <span>XP</span>
                    <span class="ape-actor-xp-info">
                        <span class="ape-actor-xp-current" @click="${this._toggleXpActions}">${l}</span>
                        <span class="ape-actor-xp-separator"> / </span>
                        <span class="ape-actor-xp-max">${s}</span>
                    </span>
                </div>
                <div class="bar-track ape-actor-xp-bar"><div class="bar-fill xp-fill" style="width: ${a}%"></div></div>
                <div class="ape-actor-xp-actions ${this._xpActionsOpen ? "active" : "inactive"}">
                    <button class="ape-actor-xp-close" @click="${this._toggleXpActions}">close</button>
                    <p>Choose an amount to add to or subtract from ${e.name}'s XP</p>
                    <div class="ape-actor-xp-increment">
                        <button class="ape-actor-xp-button" ?disabled="${l >= s}" @click="${() => this.api.updateXP(e, l + 1)}">+1</button>
                        <button class="ape-actor-xp-button" ?disabled="${l >= s}" @click="${() => this.api.updateXP(e, l + 10)}">+10</button>
                        <button class="ape-actor-xp-button" ?disabled="${l >= s}" @click="${() => this.api.updateXP(e, l + 100)}">+100</button>
                        <button class="ape-actor-xp-button" ?disabled="${l >= s}" @click="${() => this.api.updateXP(e, l + 1e3)}">+1000</button>
                    </div>
                    <div class="ape-actor-xp-decrement">
                        <button class="ape-actor-xp-button" ?disabled="${l <= i}" @click="${() => this.api.updateXP(e, l - 1)}">-1</button>
                        <button class="ape-actor-xp-button" ?disabled="${l <= i}" @click="${() => this.api.updateXP(e, l - 10)}">-10</button>
                        <button class="ape-actor-xp-button" ?disabled="${l <= i}" @click="${() => this.api.updateXP(e, l - 100)}">-100</button>
                        <button class="ape-actor-xp-button" ?disabled="${l <= i}" @click="${() => this.api.updateXP(e, l - 1e3)}">-1000</button>
                    </div>
                    <div class="ape-actor-xp-max">
                        <button class="ape-actor-xp-button" ?disabled="${l >= s}" @click="${() => this.api.updateXP(e, s)}">Max</button>
                    </div>
                </div>
            </div>
        `;
  }
  _toggleXpActions() {
    this._xpActionsOpen = !this._xpActionsOpen, this.requestUpdate();
  }
  _toggleAccordion(e) {
    this[`_${e}Open`] = !this[`_${e}Open`], this.requestUpdate();
  }
  _renderRaceClass(e) {
    const t = ut(e);
    return g`<div style="display:contents" .innerHTML="${t}"></div>`;
  }
  _renderHpBar(e, t) {
    const a = Math.min(100, Math.max(0, t.value / t.max * 100));
    return g`
            <div class="ape-actor-hp-wrapper hp-container">
                <div class="hp-main">
                    <div class="bar-label">
                        <span style="color:#34d399;">HP</span>
                        <span class="ape-actor-hp-text" style="color:#f8fafc;">
                            <span class="ape-actor-hp-display" @click="${this._toggleHpInput}">
                                <span class="ape-actor-hp-value">${t.value}</span>
                                <span class="ape-actor-hp-separator"> / </span>
                                <span class="ape-actor-hp-max">${t.max}</span>
                            </span>
                            <input type="text" class="ape-actor-hp-input" value="${t.value}" 
                                   style="display:none"
                                   @blur="${this._finishHpEdit}"
                                   @keydown="${this._hpInputKey}"
                                   @change="${(s) => this.api.updateHP(e, parseInt(s.target.value))}">
                        </span>
                    </div>
                    <div class="bar-track ape-actor-hp"><div class="bar-fill hp-fill" style="width: ${a}%"></div></div>
                </div>
                <div class="ape-actor-temp hp-temp">
                     <span class="ape-actor-temp-display hp-temp-val" @click="${this._toggleTempInput}">${t.temp || 0}</span>
                     <input type="text" class="ape-actor-temp-input hp-temp-val" value="${t.temp || 0}" 
                            style="display:none; width: 100%; text-align: center; background: transparent; border: none; color: inherit; font-family: inherit;padding:0;line-height:1;height:fit-content"
                            @blur="${this._finishTempEdit}"
                            @keydown="${this._hpInputKey}"
                            @change="${(s) => this.api.updateTempHP(e, parseInt(s.target.value))}">
                     <span class="hp-temp-lbl">Temp</span>
                </div>
             </div>
        `;
  }
  _toggleHpInput(e) {
    const t = e.currentTarget, a = t.nextElementSibling;
    t.style.display = "none", a.style.display = "inline-block", a.focus(), a.select();
  }
  _finishHpEdit(e) {
    const t = e.currentTarget, a = t.previousElementSibling;
    t.style.display = "none", a.style.display = "";
  }
  _toggleTempInput(e) {
    const t = e.currentTarget, a = t.nextElementSibling;
    t.style.display = "none", a.style.display = "inline-block", a.focus(), a.select();
  }
  _finishTempEdit(e) {
    const t = e.currentTarget, a = t.previousElementSibling;
    t.style.display = "none", a.style.display = "";
  }
  _hpInputKey(e) {
    e.key === "Enter" && e.currentTarget.blur();
  }
  _renderAbilities(e) {
    const t = this.globalData.abilityColumns;
    return g`
            <div class="ape-abilities">
                ${t.map((a) => g`
                    <div class="flex-col">
                        <span class="ape-ability">
                             <span class="ape-ability-label">&nbsp;</span>
                             <span class="ape-ability-hdr">check</span>
                             <span class="ape-ability-hdr">save</span>
                        </span>
                        ${a.map((s) => {
      const i = e.system.abilities[s.key];
      return g`
                                <span class="ape-ability">
                                    <span class="ape-ability-label">${s.key}</span>
                                    <a class="fas fa-dice-d20 ape-ability-check" 
                                       title="${s.label} check"
                                       @click="${(l) => this.api.rollAbilityCheck(e, s.key, l)}">
                                        <span class="ape-ability-text">${Y(i.mod)}</span>
                                    </a>
                                    <a class="fas fa-dice-d20 ape-ability-save" 
                                       title="${s.label} saving throw"
                                       @click="${(l) => this.api.rollSavingThrow(e, s.key, l)}">
                                        <span class="ape-ability-text">${Y(i.save.value)}</span>
                                    </a>
                                </span>
                            `;
    })}
                    </div>
                `)}
            </div>
        `;
  }
  _renderSkills(e) {
    const t = this.actorData.skills, a = e.system.skills;
    return g`
            <div class="ape-accordion ape-skill-container ${this._skillsOpen ? "is-open" : ""}">
                <h2 class="ape-accordion-header ape-skill-header" @click="${() => this._toggleAccordion("skills")}">
                    <i class="fas fa-caret-down"></i> Skills
                </h2>
                <div class="ape-accordion-body ape-skills">
                    ${Object.keys(a).map((s) => {
      const i = a[s], l = t[s];
      if (!l) return h;
      let o = "far fa-circle";
      return i.proficient === 0.5 ? o = "fas fa-adjust" : i.proficient === 1 ? o = "fas fa-check" : i.proficient === 2 && (o = "fas fa-star"), g`
                            <div class="ape-skill-row flexrow ${i.proficient === 1 ? "proficient" : i.proficient === 2 ? "expert" : ""}"
                               @click="${(r) => this.api.rollSkill(e, s, r)}"
                               @contextmenu="${(r) => this.api.rollSkill(e, s, r, !0)}">
                                <span class="ape-skill-icon ${o}"></span>
                                <span class="ape-skill-ability">${i.ability}</span>
                                <span class="ape-skill-label">${l.label}</span>
                                <span class="ape-skill-bonus">${Y(i.total)}</span>
                                <span class="ape-skill-passive">(${i.passive})</span>
                            </div>
                        `;
    })}
                </div>
            </div>
        `;
  }
  _renderDeathSaves(e) {
    const t = e.system.attributes.death.failure, a = e.system.attributes.death.success, s = (l, o, r) => Array.from({ length: 3 }).map((d, p) => g`
                <span class="ape-death-dot ${p < l ? "filled" : ""}">
                    ${p < l ? g`<span class="fas ${r}"></span>` : h}
                </span>
             `), i = t < 3 && a < 3;
    return g`
             <div class="ape-death-saving">
                <span class="ape-death-throws failed">
                    ${s(t, "failed", "fa-skull-crossbones")}
                </span>
                <span class="ape-death-icon" 
                      style="${i ? "cursor:pointer" : "cursor:default"}"
                      @mousedown="${i ? (l) => this.api.rollDeathSave(e, l) : null}"></span>
                <span class="ape-death-throws saved">
                    ${s(a, "saved", "fa-check")}
                </span>
             </div>
        `;
  }
  _renderSections(e, t) {
    return ["equipped", "feature", "spell", "inventory", "passive"].map((s) => {
      const i = t[s];
      return i ? g`
                <ape-section 
                    class="ape-category"
                    .title="${i.title}" 
                    .uses="${i.uses}"
                    .items="${i.items}"
                    .weaponSets="${i.weaponSets}"
                    .groups="${i.groups}"
                    .sectionId="${s}"
                    .api="${this.api}"
                    .actor="${e}"
                    .showSpellDots="${this.globalData.showSpellDots}"
                    .showSpellUses="${this.globalData.showSpellUses}"
                    .showSpellDamage="${this.globalData.showSpellDamage}"
                    .showWeaponMastery="${this.globalData.showWeaponMastery}"
                    .forceOpen="${i.forceOpen}">
                </ape-section>
            ` : h;
    });
  }
}
I(Ke, "properties", {
  actorData: { type: Object },
  // The object returned by data-builder
  globalData: { type: Object },
  // Global settings/options
  api: { type: Object },
  _xpActionsOpen: { state: !1 },
  _infoOpen: { state: !1 },
  _skillsOpen: { state: !1 },
  _abilitiesOpen: { state: !1 }
});
customElements.define("ape-actor", Ke);
class Ze extends _ {
  createRenderRoot() {
    return this;
  }
  updated(e) {
    e.has("data") && this._restoreScroll();
  }
  _restoreScroll() {
    if (this.data.scrollPosition && this.data.actors.length === 1 && this.data.actors[0].actor.uuid === this.data.scrollPosition.uuid) {
      const e = this.querySelector(".ape-container");
      e && (e.scrollTop = this.data.scrollPosition.scroll || 0);
    }
  }
  _onScroll(e) {
    if (this.data.actors.length === 1) {
      const t = this.data.actors[0].actor.uuid, a = e.target.scrollTop, s = !!this.querySelector(".ape-skill-container.is-open");
      this.api.setScrollPosition({ uuid: t, scroll: a, showSkills: s });
    }
  }
  render() {
    if (!this.data) return h;
    const { actors: e } = this.data, t = !e || e.length === 0;
    return g`
            <div class="${[
      "ape-wrapper"
    ].join(" ")}" @scroll="${this._onScroll}">
                ${this._renderHeader()}

                <div class="ape-actors">
                    ${t ? g`
                        <div class="ape-empty-tray">
                            <i class="fas fa-dice-d20"></i>
                        </div>
                    ` : e.map((s) => g`
                        <ape-actor 
                            class="ape-actor"
                            .actorData="${s}"
                            .globalData="${this.globalData}"
                            .api="${this.api}">
                        </ape-actor>
                    `)}
                </div>

                <div class="ape-end-turn" @click="${() => this.api.endTurn()}">
                    ${game.i18n.localize("action-pack-enhanced.end-turn")}
                </div>
            </div>
        `;
  }
  _renderHeader() {
    return h;
  }
}
I(Ze, "properties", {
  data: { type: Object },
  // Contains actors
  globalData: { type: Object },
  // Contains abilityColumns, showSpellDots
  api: { type: Object }
});
customElements.define("ape-app", Ze);
let K, F, Ie, se;
function Lt(n) {
  var l;
  if (!n || n === "") return null;
  let e = n.split(".");
  if (e[0] === "Compendium")
    return null;
  const [t, a] = e.slice(0, 2);
  e = e.slice(2);
  const s = (l = CONFIG[t]) == null ? void 0 : l.collection.instance;
  if (!s) return null;
  let i = s.get(a);
  for (; i && e.length > 1; ) {
    const [o, r] = e.slice(0, 2);
    i = i.getEmbeddedDocument(o, r), e = e.slice(2);
  }
  return i || null;
}
function Kt(n) {
  if (n instanceof CONFIG.Actor.documentClass)
    return n;
  if (n instanceof CONFIG.Token.documentClass)
    return n.object.actor;
}
function re() {
  const n = canvas.tokens.controlled.map((t) => t.actor), e = document.querySelector("#ape-app");
  e && (game.combat && n.includes(F) ? e.classList.add("is-current-combatant") : e.classList.remove("is-current-combatant"));
}
Hooks.on("ready", () => {
  var n, e;
  if (!document.querySelector("#ape-app")) {
    const t = document.createElement("ape-app");
    t.id = "ape-app", t.classList.add("ape-container"), game.modules.get("foundry-taskbar") && t.classList.add("has-taskbar");
    const a = document.getElementById("interface");
    a && document.body.insertBefore(t, a), Ie = new Qe(), t.api = Ie;
  }
  K = (e = (n = game.combat) == null ? void 0 : n.turns.find((t) => {
    var a;
    return t.id == ((a = game.combat) == null ? void 0 : a.current.combatantId);
  })) == null ? void 0 : e.actor, F = K, ce() && $("#ape-app").addClass("is-open always-on"), de();
});
function Ft() {
  const n = game.settings.get("action-pack-enhanced", "tray-display");
  return n === "selected" || n === "auto";
}
function ce() {
  return game.settings.get("action-pack-enhanced", "tray-display") === "always";
}
function X() {
  const n = canvas.tokens.controlled.filter((e) => {
    var t;
    return ["character", "npc"].includes((t = e.actor) == null ? void 0 : t.type);
  });
  return n.length ? n.map((e) => e.actor) : game.user.character && game.settings.get("action-pack-enhanced", "assume-default-character") ? [game.user.character] : [];
}
Hooks.on("controlToken", async () => {
  de();
});
Hooks.on("updateActor", (n) => {
  X().includes(n) && C();
});
function pe(n) {
  X().includes(n.actor) && C();
}
Hooks.on("updateItem", (n) => {
  pe(n);
});
Hooks.on("deleteItem", (n) => {
  pe(n);
});
Hooks.on("createItem", (n) => {
  pe(n);
});
Hooks.on("updateCombat", (n) => {
  var e;
  F = (e = n.turns.find((t) => t.id == n.current.combatantId)) == null ? void 0 : e.actor, re(), K = F;
});
Hooks.on("createCombatant", (n) => {
  X().includes(n.actor) && C();
});
Hooks.on("updateCombatant", (n, e) => {
  X().includes(n.actor) && C();
});
Hooks.on("deleteCombat", (n) => {
  game.combat || (F = null, K = null, re());
});
Hooks.on("init", () => {
  bt({
    updateTray: C,
    updateTrayState: de
  });
});
Hooks.on("getSceneControlButtons", (n) => {
  if (game.settings.get("action-pack-enhanced", "use-control-button") && !ce()) {
    const e = n.tokens.tools;
    e && (e.apeApp = {
      name: "apeApp",
      title: game.i18n.localize("action-pack-enhanced.control-icon"),
      icon: "fas fa-user-shield",
      visible: !0,
      onClick: () => {
        $("#ape-app").toggleClass("is-open"), $("#ape-app .ape-skill-container").removeClass("is-open");
      },
      button: 1
    });
  }
});
function de() {
  const n = $("#ape-app");
  Ft() && (canvas.tokens.controlled.filter((t) => {
    var a;
    return ["character", "npc"].includes((a = t.actor) == null ? void 0 : a.type);
  }).length ? n.addClass("is-open") : n.removeClass("is-open")), ce() ? n.addClass("is-open always-on") : n.removeClass("always-on"), re(), C();
}
async function C() {
  se || (se = new yt());
  const n = X(), e = se.build(n, {
    /* scrollPosition stub */
  });
  function t(m, f) {
    return m && [f, m].join("-");
  }
  const a = t(game.settings.get("action-pack-enhanced", "icon-size"), "icon"), s = t(game.settings.get("action-pack-enhanced", "tray-size"), "tray"), i = game.settings.get("action-pack-enhanced", "show-spell-dots"), l = game.settings.get("action-pack-enhanced", "show-spell-uses"), o = game.settings.get("action-pack-enhanced", "show-spell-damage"), r = game.settings.get("action-pack-enhanced", "show-weapon-mastery"), d = game.settings.get("action-pack-enhanced", "static-info"), p = Object.entries(CONFIG.DND5E.abilities), c = [
    p.slice(0, 3).map(([m, f]) => ({ key: m, label: f.label })),
    p.slice(3, 6).map(([m, f]) => ({ key: m, label: f.label }))
  ], u = document.querySelector("#ape-app");
  Array.from(u.classList).forEach((m) => {
    (m.startsWith("tray-") || m.startsWith("icon-")) && u.classList.remove(m);
  }), u.classList.add(a), u.classList.add(s), u && (u.data = {
    actors: e
  }, u.globalData = {
    abilityColumns: c,
    showSpellDots: i,
    showSpellUses: l,
    showSpellDamage: o,
    showWeaponMastery: r,
    staticInfo: d
  });
}
Hooks.on("dnd5e.getItemContextOptions", (n, e) => {
  var t;
  (t = n.system.activation) != null && t.type && n.system.activation.type !== "none" && (n.getFlag("action-pack-enhanced", "hidden") ? e.push({
    name: game.i18n.localize("action-pack-enhanced.item-context.show"),
    icon: "<i class='fas fa-eye'></i>",
    callback: async () => {
      await n.setFlag("action-pack-enhanced", "hidden", !1), C();
    }
  }) : e.push({
    name: game.i18n.localize("action-pack-enhanced.item-context.hide"),
    icon: "<i class='fas fa-eye-slash'></i>",
    callback: async () => {
      await n.setFlag("ape", "hidden", !0), C();
    }
  }));
});
Hooks.on("dropCanvasData", (n, e) => {
  var t;
  if (e.type === "ActionPackItem" && e.uuid) {
    const a = Lt(e.uuid);
    if (!a) return;
    const s = n.tokens.placeables.find((i) => e.x >= i.x && e.x <= i.x + i.w && e.y >= i.y && e.y <= i.y + i.h);
    if (s) {
      const i = (t = a.system) == null ? void 0 : t.activities;
      if (!i) return;
      (i.contents[0].target.affects.count || 1) === 1 && s.setTarget(!0, { user: game.user, releaseOthers: !0, groupSelection: !0 });
    }
    return a.use(), !1;
  }
});
export {
  Kt as fudgeToActor
};
//# sourceMappingURL=ape.mjs.map
