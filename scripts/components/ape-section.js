import { LitElement, html, nothing } from 'lit';
import './ape-item.js';

export class ApeSection extends LitElement {
    static properties = {
        title: { type: String },
        uses: { type: Object },
        items: { type: Array }, // Array of {item, uses} objects
        weaponSets: { type: Array }, // Array of Weapon Sets
        groups: { type: Object }, // Object of groups
        sectionId: { type: String },
        isOpen: { type: Boolean, state: true },
        api: { type: Object },
        showSpellDots: { type: Boolean },
        showSpellUses: { type: Boolean },
        showSpellDamage: { type: Boolean },
        actor: { type: Object },
        masteries: { type: Object },
        forceOpen: { type: Boolean },
        showWeaponMastery: { type: Boolean }
    };

    _openJournal(uuid) {
        fromUuid(uuid).then(doc => doc?.sheet?.render(true));
    }

    constructor() {
        super();
        this.isOpen = true; // Default open
    }

    createRenderRoot() {
        return this;
    }

    updated(changedProperties) {
        // Always sync class state to ensure visual correctness
        this.classList.toggle('is-open', this.isOpen);

        if (changedProperties.has('forceOpen') && this.forceOpen) {
            // Only force open if not already open
            if (!this.isOpen) {
               this.isOpen = true;
            }
        }
    }

    _toggleOpen(e) {
        e.stopPropagation();
        this.isOpen = !this.isOpen;
    }

    _onDrop(e, setIndex, slot) {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (data.uuid) {
            this.api.setWeaponSetItem(this.actor, setIndex, slot, data.uuid, data.rarity);
        }
    }

    _renderWeaponSets() {
        if (!this.weaponSets) return nothing;
        return html`
            <div class="ape-weapon-sets">
                ${this.weaponSets.map(set => html`
                    <div class="ape-weapon-set ${set.active ? 'active' : ''}" @click="${() => this.api.equipWeaponSet(this.actor, set.index)}">
                        <div class="ape-weapon-slot ${set.main ? 'filled ' + set.main.rarity : 'empty'}" 
                                @drop="${(e) => this._onDrop(e, set.index, 'main')}" 
                                @dragover="${(e) => e.preventDefault()}"
                                @contextmenu="${(e) => this.api.clearWeaponSetItem(this.actor, set.index, 'main')}">
                            ${set.main ? html`<img src="${set.main.img}" title="${set.main.name}">` : html`<i class="fas fa-sword"></i>`}
                        </div>
                        <div class="ape-weapon-slot ${set.off ? 'filled ' + set.off.rarity : 'empty'}" 
                                @drop="${(e) => this._onDrop(e, set.index, 'off')}" 
                                @dragover="${(e) => e.preventDefault()}"
                                @contextmenu="${(e) => this.api.clearWeaponSetItem(this.actor, set.index, 'off')}">
                            ${set.off ? html`<img src="${set.off.img}" title="${set.off.name}" style="height: 100%; width: auto;">` : html`<i class="fas fa-shield"></i>`}
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    _getReversedPercent(available, maximum) {
        return Math.floor(((maximum - available) / maximum) * 100);
    }

    render() {
        return html`
            ${this.title ? html`
                <h2 @click="${this._toggleOpen}">
                    <span><i class="fas fa-caret-down"></i> ${game.i18n.localize(this.title)}</span>
                </h2>
            ` : nothing}

            ${this.uses ? html`<div class="section-uses" style="--percent: ${this._getReversedPercent(this.uses.available, this.uses.maximum)}%; --spellPointsTextColor: ${game.settings.get("action-pack-enhanced", "spellPointsTextColor")}; --spellPointsBarColorStart: ${game.settings.get("action-pack-enhanced", "spellPointsBarColorStart")}; --spellPointsBarColorEnd: ${game.settings.get("action-pack-enhanced", "spellPointsBarColorEnd")}">
                <div class="section-uses-text">${this.uses.available} / ${this.uses.maximum}</div>
                <div class="section-uses-bar"></div>
            </div>` : nothing}

            ${this._renderWeaponSets()}

            ${this.items && this.items.length > 0 ? html`
                <div class="ape-items">
                    ${this.items.map(entry => html`
                        <ape-item class="ape-item item"
                            data-item-uuid="${entry.item.uuid}"
                            .item="${entry.item}"
                            .uses="${entry.uses}"
                            .api="${this.api}"
                            .castLevel="${entry.castLevel}"
                            .masteryIds="${this.actor?.system?.traits?.weaponProf?.mastery?.value}"
                            .showSpellDamage="${this.showSpellDamage}"
                            .showWeaponMastery="${this.showWeaponMastery}">
                        </ape-item>
                    `)}
                </div>
            ` : nothing}

            ${this.groups ? Object.entries(this.groups).map(([groupName, group]) => html`
                <ape-group 
                    class="ape-group"
                    .group="${group}" 
                    .groupName="${groupName}" 
                    .api="${this.api}"
                    .actor="${this.actor}"
                    .showSpellDots="${this.showSpellDots}"
                    .showSpellUses="${this.showSpellUses}"
                    .showSpellDamage="${this.showSpellDamage}">
                </ape-group>
            `) : nothing}
        `;
    }
}
customElements.define('ape-section', ApeSection);

export class ApeGroup extends LitElement {
    static properties = {
        group: { type: Object },
        groupName: { type: String },
        api: { type: Object },
        actor: { type: Object },
        showSpellDots: { type: Boolean },
        showSpellUses: { type: Boolean },
        showSpellDamage: { type: Boolean },
        showCost: { type: Boolean },
        isOpen: { type: Boolean, state: true },
        forceOpen: { type: Boolean }
    };
    
    constructor() {
        super();
        this.isOpen = true;
        this.showCost = game.modules.get("dnd5e-spellpoints")?.active ? true : false;
    }

    createRenderRoot() { return this; }

    updated(changedProperties) {
        if (changedProperties.has('isOpen')) {
            this.classList.toggle('is-open', this.isOpen);
        }
        if (changedProperties.has('groupName')) {
            this.dataset.groupId = this.groupName;
        }
    }

    _toggleOpen(e) {
        if (e.target.closest('.group-dots')) return;
        this.isOpen = !this.isOpen;
    }

    render() {
        if (!this.group) return nothing;
        const { items, uses, title, cost } = this.group;
        const hasItems = items && items.length > 0;
        const hasSlots = uses && uses.maximum;
        const hasCost = cost ? cost : null;

        if (!hasItems && !hasSlots) return nothing;

        const displayDots = hasSlots && this.showSpellDots;
        const displayUses = uses && this.showSpellUses;
        const displayCost = hasCost && this.showCost;

        const headerClasses = [
            'flexrow',
            'ape-group-header',
            displayDots ? 'has-dots' : '',
            displayUses ? 'has-uses' : '',
            displayCost ? 'has-cost' : ''
        ].filter(Boolean).join(' ');

        return html`
            <div class="${headerClasses}" @click="${this._toggleOpen}">
                <h3>
                    <i class="fas fa-caret-down"></i> ${game.i18n.localize(title)}
                </h3>
                ${displayDots ? this._renderDots(uses) : nothing}
                ${displayUses ? html`<div class="group-uses">${uses.available}/${uses.maximum}</div>` : nothing}
                ${displayCost ? html`<div class="group-cost">Cost: ${cost} SP</div>` : nothing}
            </div>

            ${hasItems ? html`
                <div class="ape-items">
                    ${items.map(entry => html`
                        <ape-item class="ape-item item" data-item-uuid="${entry.item.uuid}" .item="${entry.item}" .uses="${entry.uses}" .api="${this.api}" .castLevel="${entry.castLevel}" .showSpellDamage="${this.showSpellDamage}"></ape-item>
                    `)}
                </div>
            ` : nothing}
        `;
    }

    _renderDots(uses) {
        return html`
            <div class="group-dots" data-group-name="${this.groupName}">
                ${Array.from({length: uses.maximum}).map((_, i) => html`
                    <div class="dot ${i < uses.available ? '' : 'empty'}" 
                         data-slot="${i}"
                         @click="${(e) => { e.stopPropagation(); this.api.adjustSpellSlot(this.actor, this.groupName, i); }}">
                    </div>
                `)}
            </div>
        `;
    }
}
customElements.define('ape-group', ApeGroup);
