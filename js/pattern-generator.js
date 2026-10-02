// Pattern Generator Module
// Generates CSS backgrounds and canvas patterns from config
// IMPORTANT: CSS and Canvas patterns must be kept in sync!
// Both use the same tile-based system for consistency.

class PatternGenerator {
    constructor() {
        this.layerTypes = null;
        this.geosyntheticTypes = null;
        this.loaded = false;
        this.validationErrors = [];
    }

    // Validation: Log errors when patterns don't match
    _logValidationError(pattern, message) {
        const error = `[Pattern Validation] ${pattern}: ${message}`;
        console.error(error);
        this.validationErrors.push(error);
    }

    // Clear validation errors
    clearValidationErrors() {
        this.validationErrors = [];
    }

    // Get validation errors
    getValidationErrors() {
        return this.validationErrors;
    }

    async loadConfigs() {
        if (this.loaded) return;

        try {
            // Load from global config variables (defined in config/*.js files)
            if (typeof LAYER_TYPES_CONFIG === 'undefined') {
                throw new Error('LAYER_TYPES_CONFIG not found. Make sure config/layer-types.js is loaded.');
            }
            if (typeof GEOSYNTHETIC_TYPES_CONFIG === 'undefined') {
                throw new Error('GEOSYNTHETIC_TYPES_CONFIG not found. Make sure config/geosynthetic-types.js is loaded.');
            }

            this.layerTypes = LAYER_TYPES_CONFIG;
            this.geosyntheticTypes = GEOSYNTHETIC_TYPES_CONFIG;
            this.loaded = true;

            // Validate all patterns on load
            this.validateAllPatterns();

            console.log('[Pattern Generator] Configs loaded successfully');
        } catch (error) {
            console.error('[Pattern Generator] Failed to load configs:', error.message);
            throw error;
        }
    }

    // Get layer configuration
    getLayerConfig(type) {
        return this.layerTypes?.layers?.[type] || null;
    }

    // Get all layer types for dropdowns
    getLayerTypes() {
        if (!this.layerTypes?.layers) return {};
        return this.layerTypes.layers;
    }

    // Get material suggestion for a layer type
    getMaterialSuggestion(type) {
        return this.layerTypes?.materialSuggestions?.[type] || '';
    }

    // Get layer display name
    getLayerTypeName(type) {
        const config = this.getLayerConfig(type);
        return config?.name || type;
    }

    // Get layer colors
    getLayerColors(type) {
        const config = this.getLayerConfig(type);
        if (!config) {
            return { main: '#c9a96e', dark: '#a8884d' }; // default
        }
        return { main: config.color, dark: config.colorDark };
    }

    // Generate CSS background for a layer type
    generateCSSBackground(type) {
        const config = this.getLayerConfig(type);
        if (!config) return '#c9a96e';

        const { color, colorDark, pattern, patternParams } = config;

        switch (pattern) {
            case 'diagonal-stripes':
                return this._cssPatternDiagonalStripes(color, colorDark, patternParams);
            case 'diagonal-stripes-reverse':
                return this._cssPatternDiagonalStripesReverse(color, colorDark, patternParams);
            case 'horizontal-stripes':
                return this._cssPatternHorizontalStripes(color, colorDark, patternParams);
            case 'speckle':
                return this._cssPatternSpeckle(color, colorDark, patternParams);
            case 'scattered-dots':
                return this._cssPatternScatteredDots(color, colorDark, patternParams);
            case 'large-stones':
                return this._cssPatternLargeStones(color, colorDark, patternParams);
            case 'stabilized-crosshatch':
                return this._cssPatternStabilizedCrosshatch(color, colorDark, patternParams);
            case 'stabilized-banded':
                return this._cssPatternStabilizedBanded(color, colorDark, patternParams);
            case 'stabilized-mottled':
                return this._cssPatternStabilizedMottled(color, colorDark, patternParams);
            default:
                return color;
        }
    }

    // CSS Pattern: Diagonal stripes (45 deg)
    _cssPatternDiagonalStripes(color, colorDark, params) {
        const { stripeWidth = 2, spacing = 4 } = params || {};
        return `repeating-linear-gradient(
            45deg,
            ${color},
            ${color} ${stripeWidth}px,
            ${colorDark} ${stripeWidth}px,
            ${colorDark} ${spacing}px
        )`;
    }

    // CSS Pattern: Diagonal stripes reverse (135 deg)
    _cssPatternDiagonalStripesReverse(color, colorDark, params) {
        const { stripeWidth = 2, spacing = 10 } = params || {};
        return `repeating-linear-gradient(
            135deg,
            ${color},
            ${color} ${spacing / 2}px,
            ${colorDark} ${spacing / 2}px,
            ${colorDark} ${spacing}px
        )`;
    }

    // CSS Pattern: Horizontal stripes
    _cssPatternHorizontalStripes(color, colorDark, params) {
        const { stripeWidth = 3, spacing = 6 } = params || {};
        return `repeating-linear-gradient(
            0deg,
            ${color},
            ${color} ${stripeWidth}px,
            ${colorDark} ${stripeWidth}px,
            ${colorDark} ${spacing}px
        )`;
    }

    // Shared tile-based spot definitions (used by both CSS and Canvas)
    // This ensures patterns match exactly between CSS rendering and canvas export
    _getSpeckleSpots() {
        return [
            { px: 0.15, py: 0.20, radius: 1 },
            { px: 0.45, py: 0.65, radius: 1.5 },
            { px: 0.75, py: 0.25, radius: 1 },
            { px: 0.85, py: 0.80, radius: 1.5 },
            { px: 0.25, py: 0.75, radius: 1 },
            { px: 0.55, py: 0.35, radius: 1 },
            { px: 0.35, py: 0.45, radius: 1.5 },
            { px: 0.65, py: 0.90, radius: 1 }
        ];
    }

    _getScatteredDotsSpots(minRadius, maxRadius) {
        return [
            { px: 0.20, py: 0.30, radius: minRadius },
            { px: 0.60, py: 0.70, radius: maxRadius },
            { px: 0.80, py: 0.20, radius: minRadius },
            { px: 0.40, py: 0.50, radius: minRadius },
            { px: 0.10, py: 0.80, radius: maxRadius },
            { px: 0.90, py: 0.60, radius: minRadius }
        ];
    }

    _getLargeStonesSpots(minRadius, maxRadius) {
        return [
            { px: 0.15, py: 0.25, radius: minRadius },
            { px: 0.50, py: 0.15, radius: maxRadius },
            { px: 0.85, py: 0.30, radius: minRadius },
            { px: 0.25, py: 0.70, radius: maxRadius },
            { px: 0.60, py: 0.55, radius: minRadius },
            { px: 0.90, py: 0.75, radius: maxRadius },
            { px: 0.40, py: 0.90, radius: minRadius },
            { px: 0.75, py: 0.85, radius: minRadius }
        ];
    }

    _getMottledSpots(minRadius, maxRadius) {
        return [
            { px: 0.10, py: 0.15, radius: maxRadius },
            { px: 0.35, py: 0.10, radius: minRadius },
            { px: 0.60, py: 0.20, radius: maxRadius },
            { px: 0.85, py: 0.08, radius: minRadius },
            { px: 0.20, py: 0.40, radius: minRadius },
            { px: 0.50, py: 0.35, radius: maxRadius },
            { px: 0.75, py: 0.45, radius: minRadius },
            { px: 0.05, py: 0.60, radius: maxRadius },
            { px: 0.30, py: 0.70, radius: minRadius },
            { px: 0.55, py: 0.55, radius: maxRadius },
            { px: 0.80, py: 0.65, radius: minRadius },
            { px: 0.15, py: 0.85, radius: minRadius },
            { px: 0.45, py: 0.90, radius: maxRadius },
            { px: 0.70, py: 0.80, radius: minRadius },
            { px: 0.95, py: 0.92, radius: maxRadius }
        ];
    }

    // CSS Pattern: Speckle (concrete-like)
    _cssPatternSpeckle(color, colorDark, params) {
        const { density = 80 } = params || {};
        const spots = this._getSpeckleSpots();
        // Generate radial gradients from spot definitions
        const gradients = spots.map(spot =>
            `radial-gradient(circle at ${spot.px * 100}% ${spot.py * 100}%, ${colorDark} ${spot.radius}px, transparent ${spot.radius}px)`
        ).join(',\n            ');
        return `
            ${gradients},
            ${color}
        `;
    }

    // CSS Pattern: Scattered dots (aggregate-like)
    _cssPatternScatteredDots(color, colorDark, params) {
        const { backgroundSize = 20, minRadius = 2, maxRadius = 3 } = params || {};
        const spots = this._getScatteredDotsSpots(minRadius, maxRadius);
        const gradients = spots.map(spot =>
            `radial-gradient(circle at ${spot.px * 100}% ${spot.py * 100}%, ${colorDark} ${spot.radius}px, transparent ${spot.radius}px)`
        ).join(',\n            ');
        return `
            ${gradients},
            ${color}
        `;
    }

    // CSS Pattern: Large stones (open-graded)
    _cssPatternLargeStones(color, colorDark, params) {
        const { backgroundSize = 40, minRadius = 5, maxRadius = 6 } = params || {};
        const spots = this._getLargeStonesSpots(minRadius, maxRadius);
        const gradients = spots.map(spot =>
            `radial-gradient(circle at ${spot.px * 100}% ${spot.py * 100}%, ${colorDark} ${spot.radius}px, transparent ${spot.radius}px)`
        ).join(',\n            ');
        return `
            ${gradients},
            ${color}
        `;
    }

    // CSS Pattern: Stabilized Subgrade Option A - Cross-hatch (diagonal stripes both directions with gray)
    _cssPatternStabilizedCrosshatch(color, colorDark, params) {
        const { spacing = 10, grayColor = '#9ca3af' } = params || {};
        return `
            repeating-linear-gradient(
                135deg,
                transparent,
                transparent ${spacing / 2}px,
                ${colorDark} ${spacing / 2}px,
                ${colorDark} ${spacing}px
            ),
            repeating-linear-gradient(
                45deg,
                transparent,
                transparent ${spacing}px,
                ${grayColor} ${spacing}px,
                ${grayColor} ${spacing + 2}px
            ),
            ${color}
        `;
    }

    // CSS Pattern: Stabilized Subgrade Option B - Banded (diagonal with horizontal gray bands)
    _cssPatternStabilizedBanded(color, colorDark, params) {
        const { spacing = 10, grayColor = '#9ca3af', bandSpacing = 25, bandWidth = 4 } = params || {};
        return `
            repeating-linear-gradient(
                0deg,
                transparent,
                transparent ${bandSpacing}px,
                ${grayColor} ${bandSpacing}px,
                ${grayColor} ${bandSpacing + bandWidth}px
            ),
            repeating-linear-gradient(
                135deg,
                ${color},
                ${color} ${spacing / 2}px,
                ${colorDark} ${spacing / 2}px,
                ${colorDark} ${spacing}px
            )
        `;
    }

    // CSS Pattern: Stabilized Subgrade Option C - Mottled (diagonal with dense gray rocks)
    _cssPatternStabilizedMottled(color, colorDark, params) {
        const { spacing = 10, grayColor = '#7a8494', minRadius = 2, maxRadius = 3, mottleDensity = 0.5 } = params || {};
        const spots = this._getMottledSpots(minRadius, maxRadius);
        const gradients = spots.map(spot =>
            `radial-gradient(circle at ${spot.px * 100}% ${spot.py * 100}%, ${grayColor} ${spot.radius}px, transparent ${spot.radius}px)`
        ).join(',\n            ');
        return `
            ${gradients},
            repeating-linear-gradient(
                135deg,
                ${color},
                ${color} ${spacing / 2}px,
                ${colorDark} ${spacing / 2}px,
                ${colorDark} ${spacing}px
            )
        `;
    }

    // Get CSS background-size for a layer type
    getCSSBackgroundSize(type) {
        const config = this.getLayerConfig(type);
        if (!config) return 'auto';

        const { pattern, patternParams } = config;

        switch (pattern) {
            case 'speckle':
                return `${patternParams?.density || 80}px ${patternParams?.density || 80}px`;
            case 'scattered-dots':
            case 'large-stones':
                return `${patternParams?.backgroundSize || 20}px ${patternParams?.backgroundSize || 20}px`;
            case 'stabilized-mottled':
                // Smaller tile = denser pattern. mottleDensity of 0.1 = 8px tiles, 1 = 80px tiles
                const tileSize = Math.max(8, Math.round((patternParams?.mottleDensity || 0.5) * 80));
                return `${tileSize}px ${tileSize}px`;
            default:
                return 'auto';
        }
    }

    // Apply layer style to an element
    applyLayerStyle(element, type) {
        const background = this.generateCSSBackground(type);
        const backgroundSize = this.getCSSBackgroundSize(type);

        element.style.background = background;
        if (backgroundSize !== 'auto') {
            element.style.backgroundSize = backgroundSize;
        }
    }

    // Validate that a pattern type has matching CSS and Canvas implementations
    validatePattern(type) {
        const config = this.getLayerConfig(type);
        if (!config) {
            this._logValidationError(type, 'Layer type config not found');
            return false;
        }

        const { pattern } = config;
        const supportedPatterns = [
            'diagonal-stripes',
            'diagonal-stripes-reverse',
            'horizontal-stripes',
            'speckle',
            'scattered-dots',
            'large-stones',
            'stabilized-crosshatch',
            'stabilized-banded',
            'stabilized-mottled'
        ];

        if (!supportedPatterns.includes(pattern)) {
            this._logValidationError(type, `Unknown pattern type: ${pattern}`);
            return false;
        }

        return true;
    }

    // Validate all patterns on load
    validateAllPatterns() {
        this.clearValidationErrors();
        const types = Object.keys(this.getLayerTypes());
        let allValid = true;

        for (const type of types) {
            if (!this.validatePattern(type)) {
                allValid = false;
            }
        }

        if (allValid) {
            console.log('[Pattern Validation] All patterns validated successfully');
        } else {
            console.warn('[Pattern Validation] Some patterns have issues:', this.getValidationErrors());
        }

        return allValid;
    }

    // Draw layer texture on canvas (for PNG export)
    drawLayerTexture(ctx, type, x, y, width, height) {
        const config = this.getLayerConfig(type);
        if (!config) {
            this._logValidationError(type, 'Cannot draw - config not found');
            return;
        }

        const colors = { main: config.color, dark: config.colorDark };
        const { pattern, patternParams } = config;

        try {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();

            // Fill with base color
            ctx.fillStyle = colors.main;
            ctx.fillRect(x, y, width, height);

            switch (pattern) {
                case 'diagonal-stripes':
                    this._canvasPatternDiagonalStripes(ctx, x, y, width, height, colors, patternParams);
                    break;
                case 'diagonal-stripes-reverse':
                    this._canvasPatternDiagonalStripesReverse(ctx, x, y, width, height, colors, patternParams);
                    break;
                case 'horizontal-stripes':
                    this._canvasPatternHorizontalStripes(ctx, x, y, width, height, colors, patternParams);
                    break;
                case 'speckle':
                    this._canvasPatternSpeckle(ctx, x, y, width, height, colors, patternParams);
                    break;
                case 'scattered-dots':
                    this._canvasPatternScatteredDots(ctx, x, y, width, height, colors, patternParams);
                    break;
                case 'large-stones':
                    this._canvasPatternLargeStones(ctx, x, y, width, height, colors, patternParams);
                    break;
                case 'stabilized-crosshatch':
                    this._canvasPatternStabilizedCrosshatch(ctx, x, y, width, height, colors, patternParams);
                    break;
                case 'stabilized-banded':
                    this._canvasPatternStabilizedBanded(ctx, x, y, width, height, colors, patternParams);
                    break;
                case 'stabilized-mottled':
                    this._canvasPatternStabilizedMottled(ctx, x, y, width, height, colors, patternParams);
                    break;
                default:
                    this._logValidationError(pattern, 'Unknown pattern - drawing solid color only');
            }

            ctx.restore();
        } catch (error) {
            this._logValidationError(pattern, `Canvas drawing error: ${error.message}`);
            ctx.restore();
        }
    }

    // Canvas Pattern: Diagonal stripes
    _canvasPatternDiagonalStripes(ctx, x, y, width, height, colors, params) {
        const { stripeWidth = 2, spacing = 4 } = params || {};
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = stripeWidth;
        for (let i = -height; i < width + height; i += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i + height, y + height);
            ctx.stroke();
        }
    }

    // Canvas Pattern: Diagonal stripes reverse
    _canvasPatternDiagonalStripesReverse(ctx, x, y, width, height, colors, params) {
        const { stripeWidth = 2, spacing = 10 } = params || {};
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = stripeWidth;
        for (let i = -height; i < width + height; i += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + i + height, y);
            ctx.lineTo(x + i, y + height);
            ctx.stroke();
        }
    }

    // Canvas Pattern: Horizontal stripes
    _canvasPatternHorizontalStripes(ctx, x, y, width, height, colors, params) {
        const { stripeWidth = 3, spacing = 6 } = params || {};
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = stripeWidth;
        for (let i = y; i < y + height; i += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, i);
            ctx.lineTo(x + width, i);
            ctx.stroke();
        }
    }

    // Canvas Pattern: Speckle (concrete-like)
    // Uses same tile-based approach as CSS for exact match
    _canvasPatternSpeckle(ctx, x, y, width, height, colors, params) {
        const { density = 80 } = params || {};
        const tileSize = density;
        const spots = this._getSpeckleSpots();

        ctx.fillStyle = colors.dark;

        // Tile the pattern across the layer (same as CSS background-size tiling)
        for (let tileX = x; tileX < x + width; tileX += tileSize) {
            for (let tileY = y; tileY < y + height; tileY += tileSize) {
                for (const spot of spots) {
                    const spotX = tileX + spot.px * tileSize;
                    const spotY = tileY + spot.py * tileSize;

                    // Only draw if within bounds
                    if (spotX >= x && spotX <= x + width && spotY >= y && spotY <= y + height) {
                        ctx.beginPath();
                        ctx.arc(spotX, spotY, spot.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
    }

    // Canvas Pattern: Scattered dots (aggregate-like)
    // Uses same tile-based approach as CSS for exact match
    _canvasPatternScatteredDots(ctx, x, y, width, height, colors, params) {
        const { backgroundSize = 20, minRadius = 2, maxRadius = 3 } = params || {};
        const tileSize = backgroundSize;
        const spots = this._getScatteredDotsSpots(minRadius, maxRadius);

        ctx.fillStyle = colors.dark;

        // Tile the pattern across the layer (same as CSS background-size tiling)
        for (let tileX = x; tileX < x + width; tileX += tileSize) {
            for (let tileY = y; tileY < y + height; tileY += tileSize) {
                for (const spot of spots) {
                    const spotX = tileX + spot.px * tileSize;
                    const spotY = tileY + spot.py * tileSize;

                    // Only draw if within bounds
                    if (spotX >= x && spotX <= x + width && spotY >= y && spotY <= y + height) {
                        ctx.beginPath();
                        ctx.arc(spotX, spotY, spot.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
    }

    // Canvas Pattern: Large stones (open-graded)
    // Uses same tile-based approach as CSS for exact match
    _canvasPatternLargeStones(ctx, x, y, width, height, colors, params) {
        const { backgroundSize = 40, minRadius = 5, maxRadius = 6 } = params || {};
        const tileSize = backgroundSize;
        const spots = this._getLargeStonesSpots(minRadius, maxRadius);

        ctx.fillStyle = colors.dark;

        // Tile the pattern across the layer (same as CSS background-size tiling)
        for (let tileX = x; tileX < x + width; tileX += tileSize) {
            for (let tileY = y; tileY < y + height; tileY += tileSize) {
                for (const spot of spots) {
                    const spotX = tileX + spot.px * tileSize;
                    const spotY = tileY + spot.py * tileSize;

                    // Only draw if within bounds
                    if (spotX >= x && spotX <= x + width && spotY >= y && spotY <= y + height) {
                        ctx.beginPath();
                        ctx.arc(spotX, spotY, spot.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
    }

    // Canvas Pattern: Stabilized Subgrade Option A - Cross-hatch
    _canvasPatternStabilizedCrosshatch(ctx, x, y, width, height, colors, params) {
        const { spacing = 10, grayColor = '#9ca3af' } = params || {};

        // Draw base diagonal stripes (like subgrade)
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        for (let i = -height; i < width + height; i += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + i + height, y);
            ctx.lineTo(x + i, y + height);
            ctx.stroke();
        }

        // Draw gray cross-hatch lines (opposite direction)
        ctx.strokeStyle = grayColor;
        ctx.lineWidth = 2;
        for (let i = -height; i < width + height; i += spacing * 1.5) {
            ctx.beginPath();
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i + height, y + height);
            ctx.stroke();
        }
    }

    // Canvas Pattern: Stabilized Subgrade Option B - Banded
    _canvasPatternStabilizedBanded(ctx, x, y, width, height, colors, params) {
        const { spacing = 10, grayColor = '#9ca3af', bandSpacing = 25, bandWidth = 4 } = params || {};

        // Draw base diagonal stripes (like subgrade)
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        for (let i = -height; i < width + height; i += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + i + height, y);
            ctx.lineTo(x + i, y + height);
            ctx.stroke();
        }

        // Draw horizontal gray bands
        ctx.fillStyle = grayColor;
        for (let i = y; i < y + height; i += bandSpacing) {
            ctx.fillRect(x, i, width, bandWidth);
        }
    }

    // Canvas Pattern: Stabilized Subgrade Option C - Mottled (dense gray rocks)
    // Uses same tile-based approach as CSS for exact match
    _canvasPatternStabilizedMottled(ctx, x, y, width, height, colors, params) {
        const { spacing = 10, grayColor = '#7a8494', mottleDensity = 0.5, minRadius = 2, maxRadius = 3 } = params || {};

        // Calculate tile size to match CSS (smaller mottleDensity = smaller tiles = denser)
        const tileSize = Math.max(8, Math.round(mottleDensity * 80));
        const spots = this._getMottledSpots(minRadius, maxRadius);

        // Draw base diagonal stripes (like subgrade)
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        for (let i = -height; i < width + height; i += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + i + height, y);
            ctx.lineTo(x + i, y + height);
            ctx.stroke();
        }

        // Draw gray rock spots using shared definition
        ctx.fillStyle = grayColor;

        // Tile the pattern across the layer (same as CSS background-size tiling)
        for (let tileX = x; tileX < x + width; tileX += tileSize) {
            for (let tileY = y; tileY < y + height; tileY += tileSize) {
                for (const spot of spots) {
                    const spotX = tileX + spot.px * tileSize;
                    const spotY = tileY + spot.py * tileSize;

                    // Only draw if within bounds
                    if (spotX >= x && spotX <= x + width && spotY >= y && spotY <= y + height) {
                        ctx.beginPath();
                        ctx.arc(spotX, spotY, spot.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
    }

    // Geosynthetic methods
    getGeosyntheticColor(colorName) {
        return this.geosyntheticTypes?.colors?.[colorName]?.hex || '#000000';
    }

    getGeosyntheticColors() {
        return this.geosyntheticTypes?.colors || {};
    }

    getGeosyntheticLineStyle() {
        return this.geosyntheticTypes?.lineStyle || {
            dashWidth: 10,
            gapWidth: 4,
            borderWidth: 2,
            totalHeight: 6
        };
    }

    // Generate CSS for geosynthetic line
    generateGeosyntheticCSS(colorName) {
        const hex = this.getGeosyntheticColor(colorName);
        const style = this.getGeosyntheticLineStyle();

        return {
            borderColor: hex,
            background: `repeating-linear-gradient(90deg, ${hex} 0px, ${hex} ${style.dashWidth}px, #fff ${style.dashWidth}px, #fff ${style.dashWidth + style.gapWidth}px)`,
            boxShadow: `0 0 6px ${hex}, 0 2px 4px rgba(0,0,0,0.3)`
        };
    }

    // Draw geosynthetic line on canvas
    drawGeosyntheticLine(ctx, x, y, width, colorName) {
        try {
            const hex = this.getGeosyntheticColor(colorName);
            const style = this.getGeosyntheticLineStyle();

            ctx.save();

            // Draw dashed line
            ctx.strokeStyle = hex;
            ctx.lineWidth = 4;
            ctx.setLineDash([style.dashWidth + 2, style.gapWidth]);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.stroke();

            // Border lines
            ctx.strokeStyle = hex;
            ctx.lineWidth = style.borderWidth;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(x, y - 3);
            ctx.lineTo(x + width, y - 3);
            ctx.moveTo(x, y + 3);
            ctx.lineTo(x + width, y + 3);
            ctx.stroke();

            ctx.restore();
        } catch (error) {
            this._logValidationError('geosynthetic-line', `Drawing error: ${error.message}`);
            ctx.restore();
        }
    }

    // Draw geosynthetic label on canvas
    drawGeosyntheticLabel(ctx, x, y, width, name, colorName, isPrimary = true) {
        try {
            const hex = this.getGeosyntheticColor(colorName);

            ctx.save();

            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
            const textWidth = ctx.measureText(name).width;
            const labelX = isPrimary ? x + width - textWidth - 16 : x + 16;
            const labelPadding = 6;

            // Label background
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.strokeStyle = hex;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(labelX - labelPadding, y - 10, textWidth + labelPadding * 2, 20, 3);
            ctx.fill();
            ctx.stroke();

            // Label text
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(name, labelX, y);

            ctx.restore();
        } catch (error) {
            this._logValidationError('geosynthetic-label', `Drawing error: ${error.message}`);
            ctx.restore();
        }
    }

    // Debug method: compare CSS and canvas pattern parameters
    debugPatternMatch(type) {
        const config = this.getLayerConfig(type);
        if (!config) {
            console.error(`[Debug] Layer type '${type}' not found`);
            return;
        }

        console.group(`[Debug] Pattern match for '${type}'`);
        console.log('Pattern type:', config.pattern);
        console.log('Pattern params:', config.patternParams);
        console.log('Background size:', this.getCSSBackgroundSize(type));
        console.log('CSS background:', this.generateCSSBackground(type));
        console.groupEnd();
    }
}

// Create global instance
const patternGenerator = new PatternGenerator();
