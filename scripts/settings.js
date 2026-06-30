export function registerSettings(callbacks) {
    const { updateTray, updateTrayState, resetScroll } = callbacks;

    const spellPointsInstalled = !!game.modules.get("dnd5e-spellpoints")?.active;

    // we need to reset the loclaStroage settings for the spell-dots and spell-uses when the module is installed
    // if (spellPointsInstalled) {
    //     let dots = localStorage.getItem("dnd5e-spellpoints.spell-dots");
    //     let uses = localStorage.getItem("dnd5e-spellpoints.spell-uses");
    //     if (dots) {
    //         localStorage.setItem("dnd5e-spellpoints.spell-dots", false);
    //     }
    //     if (uses) {
    //         localStorage.setItem("dnd5e-spellpoints.spell-uses", true);
    //     }
    // }

    function isTrayAlwaysOn() {
        const config = game.settings.get("action-pack-enhanced", "tray-display");
        return config === "always";
    }

    game.settings.register(
        "action-pack-enhanced",
        "tray-display",
        {
            name: "action-pack-enhanced.settings.tray-display",
            hint: "action-pack-enhanced.settings.tray-display-hint",
            scope: "client",
            config: true,
            default: "auto",
            choices: {
                auto: "action-pack-enhanced.settings.tray-display-auto",
                toggle: "action-pack-enhanced.settings.tray-display-toggle",
                selected: "action-pack-enhanced.settings.tray-display-selected",
                always: "action-pack-enhanced.settings.tray-display-always"
            },
            type: String,
            onChange: () => {
                ui.controls.initialize();
                updateTrayState();
            }
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "assume-default-character",
        {
            name: "action-pack-enhanced.settings.assume-default-character",
            hint: "action-pack-enhanced.settings.assume-default-character-hint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => updateTrayState()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "icon-size",
        {
            name: "action-pack-enhanced.settings.icon-size",
            scope: "client",
            config: true,
            default: "medium",
            choices: {
                small: "action-pack-enhanced.settings.icon-size-small",
                medium: "action-pack-enhanced.settings.icon-size-medium",
                large: "action-pack-enhanced.settings.icon-size-large"
            },
            type: String,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "tray-size",
        {
            name: "action-pack-enhanced.settings.tray-size",
            scope: "client",
            config: true,
            default: "large",
            choices: {
                small: "action-pack-enhanced.settings.tray-size-small",
                medium: "action-pack-enhanced.settings.tray-size-medium",
                large: "action-pack-enhanced.settings.tray-size-large"
            },
            type: String,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-inspiration-animation",
        {
            name: "action-pack-enhanced.settings.show-inspiration-animation",
            hint: "action-pack-enhanced.settings.show-inspiration-animation-hint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    // game.settings.register(
    //     "action-pack-enhanced",
    //     "use-custom-icons",
    //     {
    //         name: "action-pack-enhanced.settings.use-custom-icons",
    //         hint: "action-pack-enhanced.settings.use-custom-icons-hint",
    //         scope: "client",
    //         config: true,
    //         default: false,
    //         type: Boolean,
    //         onChange: () => updateTray()
    //     }
    // );

    game.settings.register(
        "action-pack-enhanced",
        "show-xp-info",
        {
            name: "action-pack-enhanced.settings.show-xp-info",
            hint: "action-pack-enhanced.settings.show-xp-info-hint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "static-info",
        {
            name: "action-pack-enhanced.settings.static-info",
            hint: "action-pack-enhanced.settings.static-info-hint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-death-saves",
        {
            name: "action-pack-enhanced.settings.show-death-saves",
            hint: "action-pack-enhanced.settings.show-death-saves-hint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-spell-dots",
        {
            name: "action-pack-enhanced.settings.show-spell-dots",
            hint: "action-pack-enhanced.settings.show-spell-dots-hint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-spell-uses",
        {
            name: "action-pack-enhanced.settings.show-spell-uses",
            hint: "action-pack-enhanced.settings.show-spell-uses-hint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-spell-damage",
        {
            name: "action-pack-enhanced.settings.show-spell-damage",
            hint: "action-pack-enhanced.settings.show-spell-damage-hint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-upcast-duplicates",
        {
            name: "action-pack-enhanced.settings.show-upcast-duplicates",
            hint: "action-pack-enhanced.settings.show-upcast-duplicates-hint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "spellPointsTextColor",
        {
            name: "action-pack-enhanced.settings.spell-points-text-color",
            hint: "action-pack-enhanced.settings.spell-points-text-color-hint",
            scope: "client",
            config: spellPointsInstalled,
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
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "spellPointsBarColorStart",
        {
            name: "action-pack-enhanced.settings.spell-points-bar-color-start",
            hint: "action-pack-enhanced.settings.spell-points-bar-color-start-hint",
            scope: "client",
            config: spellPointsInstalled,
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
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "spellPointsBarColorEnd",
        {
            name: "action-pack-enhanced.settings.spell-points-bar-color-end",
            hint: "action-pack-enhanced.settings.spell-points-bar-color-end-hint",
            scope: "client",
            config: spellPointsInstalled,
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
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-no-uses",
        {
            name: "action-pack-enhanced.settings.show-no-uses",
            hint: "action-pack-enhanced.settings.show-no-uses-hint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "sort-alphabetic",
        {
            name: "action-pack-enhanced.settings.sort-alphabetic",
            hint: "action-pack-enhanced.settings.sort-alphabetic-hint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-unprepared-cantrips",
        {
            name: "action-pack-enhanced.settings.show-unprepared-cantrips",
            hint: "action-pack-enhanced.settings.show-unprepared-cantrips-hint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-unprepared-spells",
        {
            name: "action-pack-enhanced.settings.show-unprepared-spells",
            hint: "action-pack-enhanced.settings.show-unprepared-spells-hint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "show-weapon-mastery",
        {
            name: "action-pack-enhanced.settings.show-weapon-mastery",
            hint: "action-pack-enhanced.settings.show-weapon-mastery-hint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => updateTray()
        }
    );

    game.settings.register(
        "action-pack-enhanced",
        "use-control-button",
        {
            name: "action-pack-enhanced.settings.use-control-button",
            hint: "action-pack-enhanced.settings.use-control-button-hint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => window.location.reload()
        }
    );

    game.keybindings.register("action-pack-enhanced", "toggle-tray", {
        name: "action-pack-enhanced.keybindings.toggle-tray",
        editable: [
            { key: "KeyE", modifiers: [] }
        ],
        onDown: (ctx) => {
            if (!isTrayAlwaysOn()) {
                $('#ape-app').toggleClass("is-open");
                $('#ape-app .ape-skill-container').removeClass("is-open");
            }
        }
    });

}
