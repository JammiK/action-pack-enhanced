import { LitElement, html, nothing } from 'lit';
import { formatNumber, generateRaceClassDisplay } from '../utils.js';
import './ape-section.js';

export class ApeActor extends LitElement {
    static properties = {
        actorData: { type: Object }, // The object returned by data-builder
        globalData: { type: Object }, // Global settings/options
        api: { type: Object },
        _xpActionsOpen: { state: false },
        _infoOpen: { state: false },
        _skillsOpen: { state: false },
        _abilitiesOpen: { state: false }
    };

    createRenderRoot() { return this; }

    updated(changedProperties) {
        if (changedProperties.has('actorData') && this.actorData) {
            this.dataset.actorUuid = this.actorData.actor.uuid;
        }
    }

    render() {
        if (!this.actorData) return nothing;
        const { actor, name, sections, needsInitiative } = this.actorData;
        const hp = actor.system.attributes.hp;
        const ac = actor.system.attributes.ac.value;
        const type = actor.type;
        const isDead = hp.value <= 0 && type === "character";
        const isInspired = actor.system.attributes.inspiration;

        return html`
            <div class="ape-actor-header">
                <div class="ape-actor-header-wrap">
                    <a class="ape-actor-name" @click="${(e) => this.api.openSheet(actor)}">${name.split(' ')[0]}</a>
                    <a class="ape-actor-inspiration ${isInspired ? 'ape-actor-inspiration-active' : ''}" title="${name} is ${isInspired ? 'inspired' : 'not inspired'}!" @mousedown="${(e) => this.api.toggleInspiration(actor, e)}">
                        <svg width="100%" height="100%" viewBox="0 0 163 191" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
                            <path class="${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M58.699,71.415l0,63.404"/>
                            <path class="${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M78.624,71.415l0,63.404"/>
                            <path class="${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M97.63,71.415l0,63.404"/>
                            <path class="${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M35.88,149.717c-4.526,3.624 -16.665,18.643 -20.574,22.552c30.949,15.518 96.969,17.912 122.372,-1.233c-4.18,-4.18 -18.011,-21.744 -18.295,-22.22c-0.881,9.201 -82.394,9.898 -83.502,0.9Zm-0.489,-101.365l83.626,0.267c0,0 0.366,79.504 0.366,100.197c0,9.081 -83.502,9.982 -83.502,0.9c0,-14.9 -0.489,-101.365 -0.489,-101.365Zm83.714,16.03c0,0 29.622,-0.424 33.244,2.76c4.154,3.651 6.015,31.36 0.334,41.72c-5.681,10.36 -33.166,19.636 -33.166,19.636l-0.412,-64.116Z"/>
                            <path id="foam" class="ape-actor-inspiration-foam ${isInspired ? 'ape-actor-inspiration-foam-active' : 'ape-actor-inspiration-foam-hidden'} ${game.settings.get("action-pack-enhanced", "show-inspiration-animation") ? "animated" : ""}" d="M26.53,76.061c0,0 -24.573,-12.245 -19.621,-37.499c4.953,-25.254 36.384,-1.701 38.194,-0.34c1.81,1.361 -8.286,-33.928 21.049,-31.887c29.336,2.041 31.382,19.982 31.478,26.19c0.095,6.207 8.138,-23.223 34.718,-8.503c17.811,9.864 8.665,25.224 5.33,29.251c-3.364,4.062 -9.328,9.305 -14.471,11.091c-4.583,1.591 -20.853,3.096 -29.719,-11.516c-1.238,-2.041 -0.932,15.302 -9.097,16.357c-3.908,0.505 -14.578,3.667 -23.477,-13.095c-10.105,33.947 -34.384,19.951 -34.384,19.951Z"/>
                        </svg>
                    </a>
                    <span class="ape-actor-ac">
                        <img class="ape-actor-ac-icon" src="/modules/action-pack-enhanced/images/ac-icon.svg">
                        <span class="ape-actor-ac-display">${ac}</span>
                    </span>
                 </div>
            </div>

            ${this.globalData.staticInfo ? html`
                <div class="ape-static-info">
                    ${type === "character" ? html`
                        <div class="ape-actor-race-class">
                            ${this._renderRaceClass(actor)}
                        </div>
                    ` : nothing}

                    ${game.settings.get("action-pack-enhanced", "show-xp-info") && type === "character" ? this._renderExperience(actor) : nothing}

                    ${this._renderHpBar(actor, hp)}

                    <div class="ape-actor-rest-buttons rest-row">
                        <button class="btn ape-actor-rest-button" @click="${() => this.api.shortRest(actor)}"><i class="fa-solid fa-utensils"></i> Short Rest</button>
                        <button class="btn ape-actor-rest-button" @click="${() => this.api.longRest(actor)}"><i class="fa-solid fa-campground"></i> Long Rest</button>
                    </div>
                </div>
            ` : html`
                <div class="ape-accordion ${this._infoOpen ? 'is-open' : ''}">
                    <h2 class="ape-accordion-header" @click="${() => this._toggleAccordion('info')}">
                        <i class="fas fa-caret-down"></i> XP/HP/Rest
                    </h2>
                    <div class="ape-accordion-body">
                        ${type === "character" ? html`
                            <div class="ape-actor-race-class">
                                ${this._renderRaceClass(actor)}
                            </div>
                        ` : nothing}

                        ${game.settings.get("action-pack-enhanced", "show-xp-info") && type === "character" ? this._renderExperience(actor) : nothing}

                        ${this._renderHpBar(actor, hp)}

                        <div class="ape-actor-rest-buttons rest-row">
                            <button class="btn ape-actor-rest-button" @click="${() => this.api.shortRest(actor)}"><i class="fa-solid fa-utensils"></i> Short Rest</button>
                            <button class="btn ape-actor-rest-button" @click="${() => this.api.longRest(actor)}"><i class="fa-solid fa-campground"></i> Long Rest</button>
                        </div>
                    </div>
                </div>
            `}

            ${isDead && !game.settings.get("action-pack-enhanced", "show-death-saves") ? this._renderDeathSaves(actor) : nothing}

            ${needsInitiative ? html`
                <div class="ape-initiative" @click="${() => this.api.rollInitiative(actor)}">
                    <i class="fas fa-swords ape-initiative-icon"></i>
                    <span class="ape-initiative-text">${game.i18n.localize("action-pack-enhanced.roll-initiative")}</span>
                </div>
            ` : nothing}

            <div class="ape-accordion ${this._abilitiesOpen ? 'is-open' : ''}">
                <h2 class="ape-accordion-header" @click="${() => this._toggleAccordion('abilities')}">
                    <i class="fas fa-caret-down"></i> Ability Checks/Saves
                </h2>
                <div class="ape-accordion-body">
                    ${this._renderAbilities(actor)}
                </div>
            </div>


            ${this._renderSkills(actor)}

            <!-- Sections -->
            ${this._renderSections(actor, sections)}
        `;
    }

    _renderExperience(actor) {
        const details = actor.system.details;
        const percent = details.xp.pct;
        const maxXP = details.xp.max;
        const minXP = details.xp.min;
        const currentXP = details.xp.value;
        return html`
            <div class="ape-actor-xp bar-group">
                <div class="bar-label">
                    <span>XP</span>
                    <span class="ape-actor-xp-info">
                        <span class="ape-actor-xp-current" @click="${this._toggleXpActions}">${currentXP}</span>
                        <span class="ape-actor-xp-separator"> / </span>
                        <span class="ape-actor-xp-max">${maxXP}</span>
                    </span>
                </div>
                <div class="bar-track ape-actor-xp-bar"><div class="bar-fill xp-fill" style="width: ${percent}%"></div></div>
                <div class="ape-actor-xp-actions ${this._xpActionsOpen ? 'active' : 'inactive'}">
                    <button class="ape-actor-xp-close" @click="${this._toggleXpActions}">close</button>
                    <p>Choose an amount to add to or subtract from ${actor.name}'s XP</p>
                    <div class="ape-actor-xp-increment">
                        <button class="ape-actor-xp-button" ?disabled="${currentXP >= maxXP}" @click="${() => this.api.updateXP(actor, currentXP + 1)}">+1</button>
                        <button class="ape-actor-xp-button" ?disabled="${currentXP >= maxXP}" @click="${() => this.api.updateXP(actor, currentXP + 10)}">+10</button>
                        <button class="ape-actor-xp-button" ?disabled="${currentXP >= maxXP}" @click="${() => this.api.updateXP(actor, currentXP + 100)}">+100</button>
                        <button class="ape-actor-xp-button" ?disabled="${currentXP >= maxXP}" @click="${() => this.api.updateXP(actor, currentXP + 1000)}">+1000</button>
                    </div>
                    <div class="ape-actor-xp-decrement">
                        <button class="ape-actor-xp-button" ?disabled="${currentXP <= minXP}" @click="${() => this.api.updateXP(actor, currentXP - 1)}">-1</button>
                        <button class="ape-actor-xp-button" ?disabled="${currentXP <= minXP}" @click="${() => this.api.updateXP(actor, currentXP - 10)}">-10</button>
                        <button class="ape-actor-xp-button" ?disabled="${currentXP <= minXP}" @click="${() => this.api.updateXP(actor, currentXP - 100)}">-100</button>
                        <button class="ape-actor-xp-button" ?disabled="${currentXP <= minXP}" @click="${() => this.api.updateXP(actor, currentXP - 1000)}">-1000</button>
                    </div>
                    <div class="ape-actor-xp-max">
                        <button class="ape-actor-xp-button" ?disabled="${currentXP >= maxXP}" @click="${() => this.api.updateXP(actor, maxXP)}">Max</button>
                    </div>
                </div>
            </div>
        `;
    }

    _toggleXpActions() {
        this._xpActionsOpen = !this._xpActionsOpen;
        this.requestUpdate();
    }

    _toggleAccordion(section) {
        this[`_${section}Open`] = !this[`_${section}Open`];
        this.requestUpdate();
    }

    _renderRaceClass(actor) {
        const htmlString = generateRaceClassDisplay(actor);
        return html`<div style="display:contents" .innerHTML="${htmlString}"></div>`;
    }

    _renderHpBar(actor, hp) {
        const percent = Math.min(100, Math.max(0, (hp.value / hp.max) * 100));
        return html`
            <div class="ape-actor-hp-wrapper hp-container">
                <div class="hp-main">
                    <div class="bar-label">
                        <span style="color:#34d399;">HP</span>
                        <span class="ape-actor-hp-text" style="color:#f8fafc;">
                            <span class="ape-actor-hp-display" @click="${this._toggleHpInput}">
                                <span class="ape-actor-hp-value">${hp.value}</span>
                                <span class="ape-actor-hp-separator"> / </span>
                                <span class="ape-actor-hp-max">${hp.max}</span>
                            </span>
                            <input type="text" class="ape-actor-hp-input" value="${hp.value}" 
                                   style="display:none"
                                   @blur="${this._finishHpEdit}"
                                   @keydown="${this._hpInputKey}"
                                   @change="${(e) => this.api.updateHP(actor, parseInt(e.target.value))}">
                        </span>
                    </div>
                    <div class="bar-track ape-actor-hp"><div class="bar-fill hp-fill" style="width: ${percent}%"></div></div>
                </div>
                <div class="ape-actor-temp hp-temp">
                     <span class="ape-actor-temp-display hp-temp-val" @click="${this._toggleTempInput}">${hp.temp || 0}</span>
                     <input type="text" class="ape-actor-temp-input hp-temp-val" value="${hp.temp || 0}" 
                            style="display:none; width: 100%; text-align: center; background: transparent; border: none; color: inherit; font-family: inherit;padding:0;line-height:1;height:fit-content"
                            @blur="${this._finishTempEdit}"
                            @keydown="${this._hpInputKey}"
                            @change="${(e) => this.api.updateTempHP(actor, parseInt(e.target.value))}">
                     <span class="hp-temp-lbl">Temp</span>
                </div>
             </div>
        `;
    }

    _toggleHpInput(e) {
        const display = e.currentTarget;
        const input = display.nextElementSibling;
        display.style.display = 'none';
        input.style.display = 'inline-block';
        input.focus();
        input.select();
    }

    _finishHpEdit(e) {
        const input = e.currentTarget;
        const display = input.previousElementSibling;
        input.style.display = 'none';
        display.style.display = '';
    }

    _toggleTempInput(e) {
        const display = e.currentTarget;
        const input = display.nextElementSibling;
        display.style.display = 'none';
        input.style.display = 'inline-block';
        input.focus();
        input.select();
    }

    _finishTempEdit(e) {
        // Same logic, different structure? Temp display has input next to it
        const input = e.currentTarget;
        const display = input.previousElementSibling;
        input.style.display = 'none';
        display.style.display = '';
    }

    _hpInputKey(e) {
        if (e.key === 'Enter') e.currentTarget.blur();
    }

    _renderAbilities(actor) {
        const columns = this.globalData.abilityColumns;
        return html`
            <div class="ape-abilities">
                ${columns.map(col => html`
                    <div class="flex-col">
                        <span class="ape-ability">
                             <span class="ape-ability-label">&nbsp;</span>
                             <span class="ape-ability-hdr">check</span>
                             <span class="ape-ability-hdr">save</span>
                        </span>
                        ${col.map(c => {
                            const details = actor.system.abilities[c.key];
                            return html`
                                <span class="ape-ability">
                                    <span class="ape-ability-label">${c.key}</span>
                                    <a class="fas fa-dice-d20 ape-ability-check" 
                                       title="${c.label} check"
                                       @click="${(e) => this.api.rollAbilityCheck(actor, c.key, e)}">
                                        <span class="ape-ability-text">${formatNumber(details.mod)}</span>
                                    </a>
                                    <a class="fas fa-dice-d20 ape-ability-save" 
                                       title="${c.label} saving throw"
                                       @click="${(e) => this.api.rollSavingThrow(actor, c.key, e)}">
                                        <span class="ape-ability-text">${formatNumber(details.save.value)}</span>
                                    </a>
                                </span>
                            `;
                        })}
                    </div>
                `)}
            </div>
        `;
    }

    _renderSkills(actor) {
        const skillsObj = this.actorData.skills;
        const actorSkills = actor.system.skills;

        return html`
            <div class="ape-accordion ape-skill-container ${this._skillsOpen ? 'is-open' : ''}">
                <h2 class="ape-accordion-header ape-skill-header" @click="${() => this._toggleAccordion('skills')}">
                    <i class="fas fa-caret-down"></i> Skills
                </h2>
                <div class="ape-accordion-body ape-skills">
                    ${Object.keys(actorSkills).map(key => {
                        const skill = actorSkills[key];
                        const config = skillsObj[key];
                        if (!config) return nothing;
                        
                        let iconClass = 'far fa-circle';
                        if (skill.proficient === 0.5) iconClass = 'fas fa-adjust';
                        else if (skill.proficient === 1) iconClass = 'fas fa-check';
                        else if (skill.proficient === 2) iconClass = 'fas fa-star';

                        return html`
                            <div class="ape-skill-row flexrow ${skill.proficient === 1 ? 'proficient' : skill.proficient === 2 ? 'expert' : ''}"
                               @click="${(e) => this.api.rollSkill(actor, key, e)}"
                               @contextmenu="${(e) => this.api.rollSkill(actor, key, e, true)}">
                                <span class="ape-skill-icon ${iconClass}"></span>
                                <span class="ape-skill-ability">${skill.ability}</span>
                                <span class="ape-skill-label">${config.label}</span>
                                <span class="ape-skill-bonus">${formatNumber(skill.total)}</span>
                                <span class="ape-skill-passive">(${skill.passive})</span>
                            </div>
                        `;
                    })}
                </div>
            </div>
        `;
    }

    _renderDeathSaves(actor) {
        const deathFails = actor.system.attributes.death.failure;
        const deathSaves = actor.system.attributes.death.success;
        
        // Helper to render dots
        const renderDots = (count, filledClass, icon) => {
             return Array.from({length: 3}).map((_, i) => html`
                <span class="ape-death-dot ${i < count ? 'filled' : ''}">
                    ${i < count ? html`<span class="fas ${icon}"></span>` : nothing}
                </span>
             `);
        };

        const canRoll = deathFails < 3 && deathSaves < 3;

        return html`
             <div class="ape-death-saving">
                <span class="ape-death-throws failed">
                    ${renderDots(deathFails, 'failed', 'fa-skull-crossbones')}
                </span>
                <span class="ape-death-icon" 
                      style="${canRoll ? 'cursor:pointer' : 'cursor:default'}"
                      @mousedown="${canRoll ? (e) => this.api.rollDeathSave(actor, e) : null}"></span>
                <span class="ape-death-throws saved">
                    ${renderDots(deathSaves, 'saved', 'fa-check')}
                </span>
             </div>
        `;
    }

    _renderSections(actor, sections) {
        // Sections: equipped, feature, spell, inventory, passive
        const list = ['equipped', 'feature', 'spell', 'inventory', 'passive'];
        return list.map(id => {
            const data = sections[id];
            if (!data) return nothing;
            return html`
                <ape-section 
                    class="ape-category"
                    .title="${data.title}" 
                    .uses="${data.uses}"
                    .items="${data.items}"
                    .weaponSets="${data.weaponSets}"
                    .groups="${data.groups}"
                    .sectionId="${id}"
                    .api="${this.api}"
                    .actor="${actor}"
                    .showSpellDots="${this.globalData.showSpellDots}"
                    .showSpellUses="${this.globalData.showSpellUses}"
                    .showSpellDamage="${this.globalData.showSpellDamage}"
                    .showWeaponMastery="${this.globalData.showWeaponMastery}"
                    .forceOpen="${data.forceOpen}">
                </ape-section>
            `;
        });
    }
}
customElements.define('ape-actor', ApeActor);
