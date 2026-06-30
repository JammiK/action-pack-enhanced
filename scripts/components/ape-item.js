import { LitElement, html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getItemDetails, getDamageParts } from '../utils.js';

export class ApeItem extends LitElement {
    static properties = {
        item: { type: Object },
        uses: { type: Object },
        api: { type: Object },
        masteryIds: { type: Array },
        castLevel: { type: Number },
        expanded: { type: Boolean, state: true },
        description: { type: Object, state: true },
        showSpellDamage: { type: Boolean },
        showWeaponMastery: { type: Boolean }
    };

    // Use Light DOM to inherit global styles
    createRenderRoot() {
        return this;
    }

    _onRoll(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent toggling when clicking the die
        this.api.rollItem(this.item, e, this.castLevel);
    }

    _onRecharge(e) {
        e.preventDefault();
        e.stopPropagation();
        this.api.rollRecharge(this.item);
    }

    _onDragStart(e) {
        e.dataTransfer.setData("text/plain", JSON.stringify({
            type: "ActionPackItem",
            uuid: this.item.uuid,
            actionPack: true
        }));
        e.stopPropagation();
    }

    async _onClick(e) {
        this.expanded = !this.expanded;
        if (this.expanded && !this.description) {
            this.description = await this.api.getItemDescription(this.item);
        }
    }

    render() {
        if (!this.item) return nothing;
        const sys = this.item.system;
        const actor = this.item.actor;
        const rarity = sys.rarity !== '' ? sys.rarity : this.item.type === 'weapon' ? 'common' : '';
        const isSpell = this.item.type === 'spell';
        const isInnate = sys.method === 'innate';
        const showUses = this.uses && (!isSpell || isInnate);
        
        // Flags
        const isRitual = sys.properties?.has("ritual");
        const isConcentration = sys.properties?.has("concentration");
        const isBonus = sys.activation?.type === 'bonus';
        const isReaction = sys.activation?.type === 'reaction';
        const isLegendary = sys.activation?.type === 'legendary';
        const isRecharge = this.item?.hasRecharge;
        const isCharged = !this.item.isOnCooldown;
        const isEquipped = sys.equipped;
        const isShield = this.item.type === "equipment" && ((sys.identified && sys.identifier === "shield") || this.item.name.includes("Shield"));

        let rechargeValue = null;
        if (isRecharge && sys.uses?.recovery) {
            const recoveryOption = sys.uses.recovery.find(r => r.period === "recharge");
            if (recoveryOption) {
                rechargeValue = recoveryOption.formula;
            }
        }

        let itemMastery = false;
        let isMastered = false;
        let localizedMastery = '';

        if(game.modules.find(i => i.id === 'wm5e') && game.modules.get('wm5e')?.active) {   
            itemMastery = sys.mastery || false;

            if (itemMastery && this.item.type === 'weapon') {
                const baseItem = sys.type?.baseItem;
                // Use the passed masteryIds if available, otherwise fallback to actor data
                const currentMasteries = new Set(this.masteryIds || actor.system.traits?.weaponProf?.mastery?.value || []);
                isMastered = baseItem && currentMasteries.has(baseItem);
                localizedMastery = game.i18n.localize(`action-pack-enhanced.masteries.${itemMastery}`);
            }
        }
        
        // Unprepared Check (simplistic)
        const canCastUnpreparedRituals = !!actor.itemTypes.feat.find(i => i.name === "Ritual Adept");
        const isUnprepared = sys.prepared === 0 && !(isRitual && canCastUnpreparedRituals);

        return html`
            <div class="item-name rollable flexrow ${isUnprepared ? 'unprepared' : ''}">
                <div class="item-image ${rarity}${isUnprepared ? ' unprepared' : ''}" 
                        style="background-image: url('${this.item.img}')"
                        @mousedown="${this._onRoll}">
                    <i class="fa fa-dice-d20"></i>
                </div>
                
                <div class="item-name-wrap flexrow">
                    <h4 @mousedown="${this._onClick}">
                        <span class="item-text ${rarity}">${this.item.name}</span>
                        ${showUses ? html` (${this.uses.available}${this.uses.maximum ? '/' + this.uses.maximum : ''})` : nothing}
                    </h4>
                    ${this.showWeaponMastery ? this._renderWeaponMastery(itemMastery, isMastered, localizedMastery) : nothing}
                </div>

                ${isRitual ? html`<div class="ritual flag" title="${game.i18n.localize("action-pack-enhanced.flag.ritual-title")}"></div>` : nothing}
                ${isConcentration ? html`<div class="concentration flag" title="${game.i18n.localize("action-pack-enhanced.flag.concentration-title")}"></div>` : nothing}
                ${isBonus ? html`<div class="bonus flag" title="${game.i18n.localize("action-pack-enhanced.flag.bonus-title")}">${game.i18n.localize("action-pack-enhanced.flag.bonus")}</div>` : nothing}
                ${isReaction ? html`<div class="reaction flag" title="${game.i18n.localize("action-pack-enhanced.flag.reaction-title")}">${game.i18n.localize("action-pack-enhanced.flag.reaction")}</div>` : nothing}
                ${isLegendary ? html`<div class="legendary flag" title="${game.i18n.localize("action-pack-enhanced.flag.legendary-title")}">${game.i18n.localize("action-pack-enhanced.flag.legendary")}</div>` : nothing}

                ${isRecharge ? (isCharged ? 
                    html`<div class="flag"><i class="fas fa-bolt"></i></div>` : 
                    html`<div class="flag"><a class="rollable item-recharge" @mousedown="${this._onRecharge}"><i class="fas fa-dice-six"></i> ${rechargeValue}+</a></div>`
                ) : nothing}

                ${isUnprepared ? html`<div class="unprepared flag" title="${game.i18n.localize("action-pack-enhanced.flag.unprepared-title")}">${game.i18n.localize("action-pack-enhanced.flag.unprepared")}</div>` : nothing}
                ${(this.item.type === "weapon" || isShield) && !isEquipped ? html`<div class="unequipped flag" title="${game.i18n.localize("action-pack-enhanced.flag.unequipped-title")}" @mousedown="${this._onEquip}">${game.i18n.localize("action-pack-enhanced.flag.unequipped")}</div>` : nothing}
            </div>
            
            <div class="item-drag-handle"
                    draggable="true"
                    title="${game.i18n.localize("action-pack-enhanced.drag-to-target")}"
                    @dragstart="${this._onDragStart}">
                <i class="fas fa-grip-vertical"></i>
            </div>

            ${this._renderDamage()}

            ${this.expanded ? html`
                <div class="item-summary" style="display:block">
                    ${this._renderItemDetails()}
                    ${this.description ? html`<p>${unsafeHTML(this.description.description)}</p>` : html`<i class="fas fa-spinner fa-spin"></i>`}
                    <div class="item-properties">
                        ${this._renderItemProperties(this.item)}
                    </div>
                </div>
            ` : nothing}
        `;
    }

    _onEquip(event) {
        event.preventDefault();
        event.stopPropagation();
        this.item.update({ "system.equipped": true });
    }

    _renderDamage() {
        if (!this.showSpellDamage) return nothing;
        if (!["spell", "weapon", "feat"].includes(this.item.type)) return nothing;

        const parts = getDamageParts(this.item, this.castLevel);
        if (!parts.length) return nothing;

        return html`
            <div class="ape-item-damage">
                ${parts.map(part => html`
                    <span class="ape-damage ape-damage-${part.kind} ape-damage-type-${part.typeKey || 'none'}">
                        ${part.formula}${part.typeLabel ? html` ${part.typeLabel}` : nothing}
                    </span>
                `)}
            </div>
        `;
    }

    _renderItemDetails() {
        const details = getItemDetails(this.item);
        return html`
            ${details.school ? html`<p><strong>School:</strong> ${details.school}</p>` : nothing}
            ${details.castingTime ? html`<p><strong>Casting Time:</strong> ${details.castingTime}</p>` : nothing}
            ${details.range ? html`<p><strong>Range:</strong> ${details.range}</p>` : nothing}
            ${details.duration ? html`<p><strong>Duration:</strong> ${details.duration}</p>` : nothing}
            ${details.materials ? html`<p><strong>Materials:</strong> ${details.materials}</p>` : nothing}
        `;
    }

    _renderItemProperties(item) {
        // loop over the set of properties and return them as a list
        const properties = item?.labels?.properties || [];
        const dmgType = item.labels.hasOwnProperty('damageTypes') ? (item?.labels?.damageTypes?.includes(',') ? item?.labels?.damageTypes.split(',') : [item?.labels?.damageTypes] || []) : [];

        const allProperties = [];

        if (dmgType.length > 0) {
            const types = dmgType.map(t => {return {label: t}});
            const labels = types.map(t => t.label);
            allProperties.push(...labels);
        }

        if (properties.length > 0) {
            const labels = properties.map(p => p.label);
            labels.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            allProperties.push(...labels);
        }

        if(allProperties.length === 0) return nothing;

        return html`
            ${allProperties ? html`${allProperties.map(p => html`<span class="tag">${p}</span>`)} ` : nothing}
        `;
    }

    _renderWeaponMastery(itemMastery, isMastered, localizedMastery) {
        if (game.modules.get('wm5e')?.active) {
            if(!itemMastery) return nothing;

            return html`<div class="mastery ${isMastered ? 'active' : 'inactive'} flag">${localizedMastery}</div>`;
        }
        return nothing;
    }
}
customElements.define('ape-item', ApeItem);
