// Layer Types Configuration
// Add new layer types here - they will automatically appear in the app

const LAYER_TYPES_CONFIG = {
    layers: {
        asphalt: {
            name: "Asphalt/HMA",
            color: "#2d2d2d",
            colorDark: "#1a1a1a",
            pattern: "diagonal-stripes",
            patternParams: {
                stripeWidth: 2,
                spacing: 4,
                angle: 45
            }
        },
        concrete: {
            name: "Concrete/PCC",
            color: "#b8b8b8",
            colorDark: "#8a8a8a",
            pattern: "speckle",
            patternParams: {
                density: 80,
                minRadius: 0.5,
                maxRadius: 1.5
            }
        },
        aggregate: {
            name: "DGA Base",
            color: "#d4a76a",
            colorDark: "#b8905a",
            pattern: "scattered-dots",
            patternParams: {
                density: 200,
                minRadius: 2,
                maxRadius: 4,
                backgroundSize: 30
            }
        },
        crushedstone: {
            name: "Crushed Stone Base",
            color: "#d4a76a",
            colorDark: "#b8905a",
            pattern: "scattered-dots",
            patternParams: {
                density: 100,
                minRadius: 3,
                maxRadius: 5,
                backgroundSize: 30
            }
        },
        largestone3: {
            name: "#3's",
            color: "#a0a0a0",
            colorDark: "#606060",
            pattern: "large-stones",
            patternParams: {
                density: 400,
                minRadius: 2,
                maxRadius: 5,
                backgroundSize: 40
            }
        },
        largestone23: {
            name: "#23's",
            color: "#a0a0a0",
            colorDark: "#606060",
            pattern: "large-stones",
            patternParams: {
                density: 400,
                minRadius: 3,
                maxRadius: 7,
                backgroundSize: 40
            }
        },
        largeston2: {
            name: "#2's",
            color: "#a0a0a0",
            colorDark: "#606060",
            pattern: "large-stones",
            patternParams: {
                density: 400,
                minRadius: 3,
                maxRadius: 6,
                backgroundSize: 40
            }
        },
        subgrade: {
            name: "Subgrade",
            color: "#e8d4a8",
            colorDark: "#d4c090",
            pattern: "diagonal-stripes-reverse",
            patternParams: {
                stripeWidth: 2,
                spacing: 10,
                angle: 135
            }
        },
        // Three stabilized subgrade options - choose your preferred style
        stabilizedSubgradeA: {
            name: "Stabilized Subgrade (Cross-hatch)",
            color: "#e8d4a8",
            colorDark: "#d4c090",
            pattern: "stabilized-crosshatch",
            patternParams: {
                stripeWidth: 2,
                spacing: 10,
                grayColor: "#9ca3af"
            }
        },
        stabilizedSubgradeC: {
            name: "Stabilized Subgrade (Mottled)",
            color: "#e8d4a8",
            colorDark: "#d4c090",
            pattern: "stabilized-mottled",
            patternParams: {
                stripeWidth: 2,
                spacing: 10,
                grayColor: "#7a8494",
                mottleDensity: .5,
                minRadius: 2,
                maxRadius: 3
            }
        }
    },
    materialSuggestions: {
        asphalt: "Surface Mix PG 64-22",
        concrete: "Portland Cement Concrete (PCC)",
        aggregate: "Dense Graded Aggregate (DGA)",
        opengraded: "Open Graded Drainage Layer (OGDL)",
        subgrade: "Compacted Subgrade",
        stabilizedSubgradeA: "Stabilized Subgrade",
        stabilizedSubgradeC: "Stabilized Subgrade"
    }
};
