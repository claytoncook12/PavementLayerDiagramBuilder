// Pavement Layer Diagram Builder - Main Application

class PavementDiagramBuilder {
    constructor() {
        this.layers = [];
        this.editingLayerIndex = null;
        this.scale = 20; // pixels per inch
        this.diagramWidth = 300; // diagram width in pixels
        this.patternGenerator = patternGenerator;
    }

    async init() {
        // Load pattern configs first
        await this.patternGenerator.loadConfigs();

        this.initElements();
        this.initEventListeners();
        this.populateLayerTypeDropdown();
        this.renderLegend();
        this.loadLastSavedDiagram();
    }

    loadLastSavedDiagram() {
        const savedDiagrams = this.getSavedDiagrams();
        if (savedDiagrams.length > 0) {
            // Find the diagram with the most recent savedAt timestamp
            const lastDiagram = savedDiagrams.reduce((latest, current) => {
                return new Date(current.savedAt) > new Date(latest.savedAt) ? current : latest;
            });
            this.layers = lastDiagram.layers;
            this.scale = lastDiagram.scale || 20;
            this.diagramWidth = lastDiagram.diagramWidth || 300;
            this.scaleInput.value = this.scale;
            this.widthInput.value = this.diagramWidth;
            this.diagramTitleInput.value = lastDiagram.diagramTitle || '';
        }
        this.renderLayersList();
        this.renderDiagram();
        this.renderSavedDiagramsList();
    }

    initElements() {
        // Buttons
        this.addLayerBtn = document.getElementById('addLayerBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.loadExampleBtn = document.getElementById('loadExampleBtn');
        this.exportPngBtn = document.getElementById('exportPngBtn');
        this.exportSvgBtn = document.getElementById('exportSvgBtn');

        // Modal
        this.modal = document.getElementById('layerModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.closeModalBtn = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.layerForm = document.getElementById('layerForm');

        // Form fields
        this.layerTypeSelect = document.getElementById('layerType');
        this.materialNameInput = document.getElementById('materialName');
        this.thicknessInput = document.getElementById('thickness');
        this.infiniteGroup = document.getElementById('infiniteGroup');
        this.infiniteLayerCheckbox = document.getElementById('infiniteLayer');

        // Geosynthetic fields
        this.geosyntheticPositionSelect = document.getElementById('geosyntheticPosition');
        this.geosyntheticEnabledCheckbox = document.getElementById('geosyntheticEnabled');
        this.geosyntheticOptions = document.getElementById('geosyntheticOptions');
        this.geosyntheticNameInput = document.getElementById('geosyntheticName');
        this.geosyntheticColorSelect = document.getElementById('geosyntheticColor');

        // Geosynthetic 2 fields
        this.geosynthetic2EnabledCheckbox = document.getElementById('geosynthetic2Enabled');
        this.geosynthetic2Options = document.getElementById('geosynthetic2Options');
        this.geosynthetic2NameInput = document.getElementById('geosynthetic2Name');
        this.geosynthetic2ColorSelect = document.getElementById('geosynthetic2Color');

        // Display elements
        this.layersList = document.getElementById('layersList');
        this.pavementDiagram = document.getElementById('pavementDiagram');
        this.totalThicknessSpan = document.getElementById('totalThickness');
        this.scaleInput = document.getElementById('scaleInput');
        this.widthInput = document.getElementById('widthInput');
        this.diagramTitleInput = document.getElementById('diagramTitle');

        // Save/Load elements
        this.saveDiagramBtn = document.getElementById('saveDiagramBtn');
        this.saveModal = document.getElementById('saveModal');
        this.closeSaveModalBtn = document.getElementById('closeSaveModal');
        this.cancelSaveBtn = document.getElementById('cancelSaveBtn');
        this.saveForm = document.getElementById('saveForm');
        this.diagramNameInput = document.getElementById('diagramName');
        this.savedDiagramsList = document.getElementById('savedDiagramsList');

        // Legend
        this.legendItems = document.getElementById('legendItems');
    }

    initEventListeners() {
        // Add layer button
        this.addLayerBtn.addEventListener('click', () => this.openModal());

        // Clear all button
        this.clearAllBtn.addEventListener('click', () => this.clearAllLayers());

        // Load example button
        this.loadExampleBtn.addEventListener('click', () => this.loadExample());

        // Export PNG button
        this.exportPngBtn.addEventListener('click', () => this.exportToPng());

        // Export SVG button
        this.exportSvgBtn.addEventListener('click', () => this.exportToSvg());

        // Modal controls
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Form submission
        this.layerForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Top geosynthetic checkbox change
        this.geosyntheticEnabledCheckbox.addEventListener('change', () => {
            this.geosyntheticOptions.style.display =
                this.geosyntheticEnabledCheckbox.checked ? 'block' : 'none';
        });

        // Bottom geosynthetic checkbox change
        this.geosynthetic2EnabledCheckbox.addEventListener('change', () => {
            this.geosynthetic2Options.style.display =
                this.geosynthetic2EnabledCheckbox.checked ? 'block' : 'none';
        });

        // Layer type change - auto-fill material name suggestions and show/hide infinite option
        this.layerTypeSelect.addEventListener('change', () => {
            this.suggestMaterialName();
            // Show infinite option only for subgrade
            this.infiniteGroup.style.display =
                this.layerTypeSelect.value === 'subgrade' ? 'block' : 'none';
            if (this.layerTypeSelect.value !== 'subgrade') {
                this.infiniteLayerCheckbox.checked = false;
                this.thicknessInput.parentElement.style.display = 'block';
                this.thicknessInput.required = true;
            }
        });

        // Infinite checkbox change - hide/show thickness input
        this.infiniteLayerCheckbox.addEventListener('change', () => {
            if (this.infiniteLayerCheckbox.checked) {
                this.thicknessInput.parentElement.style.display = 'none';
                this.thicknessInput.required = false;
            } else {
                this.thicknessInput.parentElement.style.display = 'block';
                this.thicknessInput.required = true;
            }
        });

        // Scale input change
        this.scaleInput.addEventListener('change', () => {
            this.scale = parseInt(this.scaleInput.value) || 20;
            this.renderDiagram();
        });

        // Width input change
        this.widthInput.addEventListener('change', () => {
            this.diagramWidth = parseInt(this.widthInput.value) || 300;
            this.renderDiagram();
        });

        // Title input change - update diagram display
        this.diagramTitleInput.addEventListener('input', () => {
            this.renderDiagram();
        });

        // Save diagram button
        this.saveDiagramBtn.addEventListener('click', () => this.openSaveModal());

        // Save modal controls
        this.closeSaveModalBtn.addEventListener('click', () => this.closeSaveModal());
        this.cancelSaveBtn.addEventListener('click', () => this.closeSaveModal());
        this.saveModal.addEventListener('click', (e) => {
            if (e.target === this.saveModal) this.closeSaveModal();
        });

        // Save form submission
        this.saveForm.addEventListener('submit', (e) => this.handleSaveSubmit(e));

        // Load saved diagrams list on init
        this.renderSavedDiagramsList();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    suggestMaterialName() {
        const type = this.layerTypeSelect.value;
        if (type && !this.materialNameInput.value) {
            this.materialNameInput.value = this.patternGenerator.getMaterialSuggestion(type);
        }
    }

    openModal(layerIndex = null) {
        this.editingLayerIndex = layerIndex;

        if (layerIndex !== null) {
            // Edit mode
            this.modalTitle.textContent = 'Edit Layer';
            const layer = this.layers[layerIndex];
            this.layerTypeSelect.value = layer.type;
            this.materialNameInput.value = layer.material;
            this.thicknessInput.value = layer.thickness;

            // Handle infinite option
            this.infiniteGroup.style.display = layer.type === 'subgrade' ? 'block' : 'none';
            this.infiniteLayerCheckbox.checked = layer.infinite || false;

            // Hide thickness input if infinite
            if (layer.infinite) {
                this.thicknessInput.parentElement.style.display = 'none';
                this.thicknessInput.required = false;
            } else {
                this.thicknessInput.parentElement.style.display = 'block';
                this.thicknessInput.required = true;
            }

            // Handle geosynthetics
            this.geosyntheticPositionSelect.value = layer.geosyntheticPosition || 'bottom';

            this.geosyntheticEnabledCheckbox.checked = layer.geosyntheticEnabled || false;
            this.geosyntheticOptions.style.display = layer.geosyntheticEnabled ? 'block' : 'none';
            this.geosyntheticNameInput.value = layer.geosyntheticName || '';
            this.geosyntheticColorSelect.value = layer.geosyntheticColor || 'black';

            this.geosynthetic2EnabledCheckbox.checked = layer.geosynthetic2Enabled || false;
            this.geosynthetic2Options.style.display = layer.geosynthetic2Enabled ? 'block' : 'none';
            this.geosynthetic2NameInput.value = layer.geosynthetic2Name || '';
            this.geosynthetic2ColorSelect.value = layer.geosynthetic2Color || 'black';
        } else {
            // Add mode
            this.modalTitle.textContent = 'Add Layer';
            this.layerForm.reset();
            this.infiniteGroup.style.display = 'none';
            this.infiniteLayerCheckbox.checked = false;
            this.geosyntheticOptions.style.display = 'none';
            this.geosynthetic2Options.style.display = 'none';
        }

        this.modal.classList.add('active');
        this.layerTypeSelect.focus();
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.editingLayerIndex = null;
        this.layerForm.reset();
        this.infiniteGroup.style.display = 'none';
        this.infiniteLayerCheckbox.checked = false;
        this.thicknessInput.parentElement.style.display = 'block';
        this.thicknessInput.required = true;
        // Reset geosynthetic fields
        this.geosyntheticOptions.style.display = 'none';
        this.geosynthetic2Options.style.display = 'none';
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const layerData = {
            type: this.layerTypeSelect.value,
            material: this.materialNameInput.value.trim(),
            thickness: parseFloat(this.thicknessInput.value),
            infinite: this.layerTypeSelect.value === 'subgrade' && this.infiniteLayerCheckbox.checked,
            // Geosynthetics (shared position)
            geosyntheticPosition: this.geosyntheticPositionSelect.value,
            geosyntheticEnabled: this.geosyntheticEnabledCheckbox.checked,
            geosyntheticName: this.geosyntheticNameInput.value.trim(),
            geosyntheticColor: this.geosyntheticColorSelect.value,
            geosynthetic2Enabled: this.geosynthetic2EnabledCheckbox.checked,
            geosynthetic2Name: this.geosynthetic2NameInput.value.trim(),
            geosynthetic2Color: this.geosynthetic2ColorSelect.value
        };

        if (this.editingLayerIndex !== null) {
            // Update existing layer
            this.layers[this.editingLayerIndex] = layerData;
        } else {
            // Add new layer
            this.layers.push(layerData);
        }

        this.closeModal();
        this.renderLayersList();
        this.renderDiagram();
    }

    deleteLayer(index) {
        if (confirm('Are you sure you want to delete this layer?')) {
            this.layers.splice(index, 1);
            this.renderLayersList();
            this.renderDiagram();
        }
    }

    moveLayer(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.layers.length) return;

        const temp = this.layers[index];
        this.layers[index] = this.layers[newIndex];
        this.layers[newIndex] = temp;

        this.renderLayersList();
        this.renderDiagram();
    }

    clearAllLayers() {
        if (this.layers.length === 0) return;
        if (confirm('Are you sure you want to clear all layers?')) {
            this.layers = [];
            this.renderLayersList();
            this.renderDiagram();
        }
    }

    loadExample() {
        this.layers = [
            {
                type: 'asphalt',
                material: 'Surface Mix PG 76-22',
                thickness: 1.5,
                geosyntheticPosition: 'bottom',
                geosyntheticEnabled: false,
                geosyntheticName: '',
                geosyntheticColor: 'black',
                geosynthetic2Enabled: false,
                geosynthetic2Name: '',
                geosynthetic2Color: 'black'
            },
            {
                type: 'asphalt',
                material: 'Binder Mix PG 64-22',
                thickness: 3,
                geosyntheticPosition: 'bottom',
                geosyntheticEnabled: false,
                geosyntheticName: '',
                geosyntheticColor: 'black',
                geosynthetic2Enabled: false,
                geosynthetic2Name: '',
                geosynthetic2Color: 'black'
            },
            {
                type: 'asphalt',
                material: 'Base Mix PG 64-22',
                thickness: 4,
                geosyntheticPosition: 'bottom',
                geosyntheticEnabled: true,
                geosyntheticName: 'Tensar TX5',
                geosyntheticColor: 'red',
                geosynthetic2Enabled: true,
                geosynthetic2Name: 'Tensar TX7',
                geosynthetic2Color: 'blue'
            },
            {
                type: 'aggregate',
                material: 'Dense Graded Aggregate Base (DGA)',
                thickness: 8,
                geosyntheticPosition: 'bottom',
                geosyntheticEnabled: true,
                geosyntheticName: 'Tensar NX750',
                geosyntheticColor: 'green',
                geosynthetic2Enabled: false,
                geosynthetic2Name: '',
                geosynthetic2Color: 'black'
            },
            {
                type: 'subgrade',
                material: 'Compacted Subgrade (A-7-6)',
                thickness: 12,
                geosyntheticPosition: 'bottom',
                geosyntheticEnabled: false,
                geosyntheticName: '',
                geosyntheticColor: 'black',
                geosynthetic2Enabled: false,
                geosynthetic2Name: '',
                geosynthetic2Color: 'black'
            }
        ];

        this.renderLayersList();
        this.renderDiagram();
    }

    getLayerTypeName(type) {
        return this.patternGenerator.getLayerTypeName(type);
    }

    getGeosyntheticDisplayName(geosynthetic, customGeosynthetic) {
        if (!geosynthetic) return null;

        const names = {
            'biaxial-light': 'Biaxial Light Duty',
            'biaxial-heavy': 'Biaxial Heavy Duty',
            'triaxial-light': 'Triaxial Light Duty',
            'triaxial-heavy': 'Triaxial Heavy Duty',
            'NX750': 'Tensar NX750',
            'NX850': 'Tensar NX850',
            'TX5': 'Tensar TX5',
            'TX7': 'Tensar TX7',
            'other': customGeosynthetic || 'Custom Geosynthetic'
        };
        return names[geosynthetic] || geosynthetic;
    }

    renderLayersList() {
        if (this.layers.length === 0) {
            this.layersList.innerHTML = `
                <div class="diagram-placeholder" style="padding: 2rem; text-align: center; color: #6b7280;">
                    No layers added yet. Click "Add Layer" to begin.
                </div>
            `;
            return;
        }

        this.layersList.innerHTML = this.layers.map((layer, index) => {
            const layerColors = this.patternGenerator.getLayerColors(layer.type);
            return `
            <div class="layer-card" data-index="${index}">
                <div class="layer-card-header">
                    <div class="layer-number">${index + 1}</div>
                    <div class="layer-type-indicator" style="background: ${layerColors.main};"></div>
                    <div class="layer-info">
                        <div class="layer-material">${this.escapeHtml(layer.material)}</div>
                        <div class="layer-details">
                            ${this.getLayerTypeName(layer.type)}${layer.infinite ? '' : ' &bull; ' + layer.thickness + '" thick'}
                        </div>
                    </div>
                    <div class="layer-actions">
                        <button class="btn btn-icon btn-sm" onclick="app.moveLayer(${index}, -1)" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                            &#9650;
                        </button>
                        <button class="btn btn-icon btn-sm" onclick="app.moveLayer(${index}, 1)" title="Move Down" ${index === this.layers.length - 1 ? 'disabled' : ''}>
                            &#9660;
                        </button>
                        <button class="btn btn-icon btn-sm" onclick="app.openModal(${index})" title="Edit">
                            &#9998;
                        </button>
                        <button class="btn btn-icon btn-sm" onclick="app.deleteLayer(${index})" title="Delete">
                            &#10005;
                        </button>
                    </div>
                </div>
                ${(layer.geosyntheticEnabled || layer.geosynthetic2Enabled) ? `
                    <div class="layer-geosynthetic-badges">
                        ${layer.geosyntheticEnabled ? `<div class="layer-geosynthetic-badge" style="border-color: ${this.patternGenerator.getGeosyntheticColor(layer.geosyntheticColor)};">${this.escapeHtml(layer.geosyntheticName) || 'Geosynthetic 1'}</div>` : ''}
                        ${layer.geosynthetic2Enabled ? `<div class="layer-geosynthetic-badge" style="border-color: ${this.patternGenerator.getGeosyntheticColor(layer.geosynthetic2Color)};">${this.escapeHtml(layer.geosynthetic2Name) || 'Geosynthetic 2'}</div>` : ''}
                        <span class="geosynthetic-position-label">(${layer.geosyntheticPosition === 'top' ? 'Top' : 'Bottom'})</span>
                    </div>
                ` : ''}
            </div>
        `}).join('');
    }

    renderDiagram() {
        if (this.layers.length === 0) {
            this.pavementDiagram.innerHTML = `
                <div class="diagram-placeholder">
                    Add layers to see the diagram
                </div>
            `;
            this.totalThicknessSpan.textContent = '0';
            return;
        }

        const totalThickness = this.layers.reduce((sum, layer) => layer.infinite ? sum : sum + layer.thickness, 0);
        this.totalThicknessSpan.textContent = totalThickness.toFixed(1);

        // Calculate minimum height for readability
        const minLayerHeight = 30; // Minimum pixels for any layer

        let thicknessColumnHTML = '';
        let layersColumnHTML = '';

        this.layers.forEach((layer, index) => {
            // Calculate height based on thickness, with minimum (infinite layers get fixed height)
            let layerHeight = layer.infinite ? 60 : Math.max(layer.thickness * this.scale, minLayerHeight);

            // Build geosynthetic indicator HTML (both at same position)
            const geosyntheticPosition = layer.geosyntheticPosition || 'bottom';
            let geosyntheticHTML = '';
            let geosyntheticLabelsHTML = '';

            if (layer.geosyntheticEnabled) {
                const displayName = layer.geosyntheticName || 'Geosynthetic 1';
                const geoColor = this.patternGenerator.getGeosyntheticColor(layer.geosyntheticColor);

                geosyntheticHTML = `
                    <div class="geosynthetic-indicator position-${geosyntheticPosition} geosynthetic-primary">
                        <div class="geosynthetic-line" data-geo-color="${layer.geosyntheticColor}"></div>
                    </div>
                `;
                geosyntheticLabelsHTML += `<span class="geosynthetic-label-standalone position-${geosyntheticPosition} label-primary" style="border-color: ${geoColor};">${this.escapeHtml(displayName)}</span>`;
            }

            // Build second geosynthetic indicator HTML (same position, offset)
            let geosynthetic2HTML = '';
            if (layer.geosynthetic2Enabled) {
                const displayName2 = layer.geosynthetic2Name || 'Geosynthetic 2';
                const geo2Color = this.patternGenerator.getGeosyntheticColor(layer.geosynthetic2Color);

                geosynthetic2HTML = `
                    <div class="geosynthetic-indicator position-${geosyntheticPosition} geosynthetic-secondary">
                        <div class="geosynthetic-line" data-geo-color="${layer.geosynthetic2Color}"></div>
                    </div>
                `;
                geosyntheticLabelsHTML += `<span class="geosynthetic-label-standalone position-${geosyntheticPosition} label-secondary" style="border-color: ${geo2Color};">${this.escapeHtml(displayName2)}</span>`;
            }

            // Thickness column cell
            thicknessColumnHTML += `
                <div class="thickness-cell" style="height: ${layerHeight}px;">
                    ${layer.infinite ? '' : layer.thickness + '"'}
                </div>
            `;

            // Layer visual
            layersColumnHTML += `
                <div class="diagram-layer" style="height: ${layerHeight}px;" data-index="${index}">
                    <div class="layer-visual" data-layer-type="${layer.type}">
                        <div class="layer-label">${this.escapeHtml(layer.material)}</div>
                        ${geosyntheticHTML}
                        ${geosynthetic2HTML}
                        ${geosyntheticLabelsHTML}
                    </div>
                </div>
            `;
        });

        const diagramTitle = this.diagramTitleInput.value.trim();
        const titleHTML = diagramTitle ? `<div class="diagram-title-display">${this.escapeHtml(diagramTitle)}</div>` : '';

        this.pavementDiagram.innerHTML = `
            <div class="diagram-content">
                <div class="diagram-wrapper">
                    <div class="thickness-column">
                        ${thicknessColumnHTML}
                    </div>
                    <div class="layers-column">
                        ${layersColumnHTML}
                    </div>
                </div>
            </div>
            ${titleHTML}
        `;

        // Apply dynamic width
        this.pavementDiagram.style.width = (this.diagramWidth + 50) + 'px'; // +50 for thickness column

        // Apply dynamic layer styles from config
        this.applyLayerStyles();

        // Apply geosynthetic styles
        this.applyGeosyntheticStyles();
    }

    applyLayerStyles() {
        const layerVisuals = this.pavementDiagram.querySelectorAll('.layer-visual[data-layer-type]');
        layerVisuals.forEach(element => {
            const type = element.dataset.layerType;
            this.patternGenerator.applyLayerStyle(element, type);
        });
    }

    applyGeosyntheticStyles() {
        const geoLines = this.pavementDiagram.querySelectorAll('.geosynthetic-line[data-geo-color]');
        geoLines.forEach(element => {
            const colorName = element.dataset.geoColor;
            const css = this.patternGenerator.generateGeosyntheticCSS(colorName);
            const backgroundSize = this.patternGenerator.getGeosyntheticBackgroundSize(colorName);
            element.style.borderColor = css.borderColor;
            element.style.background = css.background;
            element.style.backgroundSize = backgroundSize;
            element.style.boxShadow = css.boxShadow;
        });
    }

    populateLayerTypeDropdown() {
        const layerTypes = this.patternGenerator.getLayerTypes();
        let html = '<option value="">Select layer type...</option>';

        for (const [type, config] of Object.entries(layerTypes)) {
            html += `<option value="${type}">${config.name}</option>`;
        }

        this.layerTypeSelect.innerHTML = html;
    }

    renderLegend() {
        const layerTypes = this.patternGenerator.getLayerTypes();
        let html = '';

        // Generate legend items for each layer type
        for (const [type, config] of Object.entries(layerTypes)) {
            const background = this.patternGenerator.generateCSSBackground(type);
            const backgroundSize = this.patternGenerator.getCSSBackgroundSize(type);

            html += `
                <div class="legend-item">
                    <div class="legend-color" data-layer-type="${type}"></div>
                    <span>${config.name}</span>
                </div>
            `;
        }

        // Add geosynthetic legend item
        html += `
            <div class="legend-item">
                <div class="legend-geosynthetic"></div>
                <span>Geosynthetic</span>
            </div>
        `;

        this.legendItems.innerHTML = html;

        // Apply styles via JavaScript to avoid HTML attribute quote issues
        const legendColors = this.legendItems.querySelectorAll('.legend-color[data-layer-type]');
        legendColors.forEach(el => {
            const type = el.dataset.layerType;
            this.patternGenerator.applyLayerStyle(el, type);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async exportToPng() {
        if (this.layers.length === 0) {
            alert('No layers to export. Add layers first.');
            return;
        }

        try {
            // Use html2canvas to capture the exact HTML render
            const canvas = await html2canvas(this.pavementDiagram, {
                scale: 4, // High resolution (4x)
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            });

            // Download PNG
            const link = document.createElement('a');
            link.download = 'pavement-section-diagram.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('PNG export failed:', err);
            alert('PNG export failed. Please try again.');
        }
    }

    exportToSvg() {
        if (this.layers.length === 0) {
            alert('No layers to export. Add layers first.');
            return;
        }

        const { svg } = this.generateSvgString();

        // Download
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'pavement-section-diagram.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    generateSvgString() {
        const minLayerHeight = 30;
        const thicknessColWidth = 50;
        const layerWidth = this.diagramWidth;
        const padding = 20;
        const totalWidth = thicknessColWidth + layerWidth + padding * 2;

        // Calculate total height
        let totalLayerHeight = 0;
        this.layers.forEach(layer => {
            const layerHeight = layer.infinite ? 60 : Math.max(layer.thickness * this.scale, minLayerHeight);
            totalLayerHeight += layerHeight;
        });

        const diagramTitle = this.diagramTitleInput.value.trim();
        const titleHeight = diagramTitle ? 40 : 0;
        const totalHeight = totalLayerHeight + padding * 2 + titleHeight;

        // Build SVG patterns in defs
        let defs = '<defs>\n';
        const usedPatterns = new Set();

        this.layers.forEach(layer => {
            if (!usedPatterns.has(layer.type)) {
                usedPatterns.add(layer.type);
                defs += this.generateSvgPattern(layer.type);
            }
        });

        defs += '</defs>\n';

        // Build SVG content
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">\n`;
        svg += '<style>\n';
        svg += '  .label-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }\n';
        svg += '</style>\n';
        svg += defs;

        // White background
        svg += `<rect width="${totalWidth}" height="${totalHeight}" fill="#ffffff"/>\n`;

        // Draw layers
        let currentY = padding;
        const layerX = padding + thicknessColWidth;
        const geosyntheticsToRender = [];

        this.layers.forEach((layer, index) => {
            const layerHeight = layer.infinite ? 60 : Math.max(layer.thickness * this.scale, minLayerHeight);

            // Thickness column cell
            svg += `<rect x="${padding}" y="${currentY}" width="${thicknessColWidth}" height="${layerHeight}" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>\n`;

            // Thickness text
            if (!layer.infinite) {
                svg += `<text x="${padding + thicknessColWidth / 2}" y="${currentY + layerHeight / 2}" text-anchor="middle" dominant-baseline="middle" class="label-text" font-size="12" font-weight="bold" fill="#1f2937">${layer.thickness}"</text>\n`;
            }

            // Layer rectangle with pattern
            svg += `<rect x="${layerX}" y="${currentY}" width="${layerWidth}" height="${layerHeight}" fill="url(#pattern-${layer.type})" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>\n`;

            // Material label with background
            const labelText = this.escapeXml(layer.material);
            const labelX = layerX + 8;
            const labelY = currentY + layerHeight / 2;
            const estimatedTextWidth = this.estimateTextWidth(layer.material, 12);
            const labelPadding = 4;

            svg += `<rect x="${labelX - labelPadding}" y="${labelY - 10}" width="${estimatedTextWidth + labelPadding * 2}" height="20" rx="3" fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>\n`;
            svg += `<text x="${labelX}" y="${labelY}" dominant-baseline="middle" class="label-text" font-size="12" fill="#1f2937">${labelText}</text>\n`;

            // Collect geosynthetics
            const geosyntheticPosition = layer.geosyntheticPosition || 'bottom';
            const baseY = geosyntheticPosition === 'top' ? currentY : currentY + layerHeight;
            const offset = geosyntheticPosition === 'top' ? 8 : -8;
            const hasBothGeosynthetics = layer.geosyntheticEnabled && layer.geosynthetic2Enabled;
            const geosyntheticLabelY = hasBothGeosynthetics ? baseY + (offset / 2) : baseY;

            if (layer.geosyntheticEnabled) {
                geosyntheticsToRender.push({
                    x: layerX, y: baseY, labelY: geosyntheticLabelY, width: layerWidth,
                    name: layer.geosyntheticName || 'Geosynthetic 1',
                    color: layer.geosyntheticColor, isPrimary: true
                });
            }

            if (layer.geosynthetic2Enabled) {
                geosyntheticsToRender.push({
                    x: layerX, y: baseY + offset, labelY: hasBothGeosynthetics ? geosyntheticLabelY : baseY + offset,
                    width: layerWidth, name: layer.geosynthetic2Name || 'Geosynthetic 2',
                    color: layer.geosynthetic2Color, isPrimary: false
                });
            }

            currentY += layerHeight;
        });

        // Draw geosynthetic lines first (so labels appear on top)
        geosyntheticsToRender.forEach(geo => {
            svg += this.generateSvgGeosyntheticLines(geo);
        });

        // Then draw geosynthetic labels on top
        geosyntheticsToRender.forEach(geo => {
            svg += this.generateSvgGeosyntheticLabel(geo);
        });

        // Outer border
        svg += `<rect x="${padding}" y="${padding}" width="${thicknessColWidth + layerWidth}" height="${totalLayerHeight}" fill="none" stroke="#e5e7eb" stroke-width="2"/>\n`;

        // Title
        if (diagramTitle) {
            svg += `<text x="${totalWidth / 2}" y="${padding + totalLayerHeight + titleHeight / 2 + 5}" text-anchor="middle" dominant-baseline="middle" class="label-text" font-size="14" font-weight="bold" fill="#1f2937">${this.escapeXml(diagramTitle)}</text>\n`;
        }

        svg += '</svg>';

        return { svg, width: totalWidth, height: totalHeight };
    }

    generateSvgPattern(type) {
        const config = this.patternGenerator.getLayerConfig(type);
        if (!config) return '';

        const { color, colorDark, pattern, patternParams } = config;
        const params = patternParams || {};
        const id = `pattern-${type}`;

        switch (pattern) {
            case 'diagonal-stripes': {
                // CSS 45deg gradient = stripes run \ (top-left to bottom-right)
                const spacing = params.spacing || 4;
                return `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}">
                    <rect width="${spacing}" height="${spacing}" fill="${color}"/>
                    <line x1="0" y1="0" x2="${spacing}" y2="${spacing}" stroke="${colorDark}" stroke-width="${params.stripeWidth || 2}"/>
                </pattern>\n`;
            }

            case 'diagonal-stripes-reverse': {
                // CSS 135deg gradient = stripes run / (bottom-left to top-right)
                const spacing = params.spacing || 10;
                return `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}">
                    <rect width="${spacing}" height="${spacing}" fill="${color}"/>
                    <line x1="0" y1="${spacing}" x2="${spacing}" y2="0" stroke="${colorDark}" stroke-width="${params.stripeWidth || 2}"/>
                </pattern>\n`;
            }

            case 'speckle': {
                const size = params.density || 80;
                const minR = params.minRadius || 0.5;
                const maxR = params.maxRadius || 1.5;
                let circles = '';
                // 8 spots per tile to match CSS
                const spots = [
                    [0.15, 0.20], [0.45, 0.65], [0.75, 0.25], [0.85, 0.80],
                    [0.25, 0.75], [0.55, 0.35], [0.35, 0.45], [0.65, 0.90]
                ];
                spots.forEach(([px, py], i) => {
                    const r = i % 2 === 0 ? minR : maxR;
                    circles += `<circle cx="${px * size}" cy="${py * size}" r="${r}" fill="${colorDark}"/>`;
                });
                return `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
                    <rect width="${size}" height="${size}" fill="${color}"/>
                    ${circles}
                </pattern>\n`;
            }

            case 'scattered-dots': {
                const size = params.backgroundSize || 30;
                const minR = params.minRadius || 2;
                const maxR = params.maxRadius || 4;
                // 6 spots per tile to match CSS
                const spots = [
                    [0.20, 0.30, minR], [0.60, 0.70, maxR], [0.80, 0.20, minR],
                    [0.40, 0.50, minR], [0.10, 0.80, maxR], [0.90, 0.60, minR]
                ];
                let circles = '';
                spots.forEach(([px, py, r]) => {
                    circles += `<circle cx="${px * size}" cy="${py * size}" r="${r}" fill="${colorDark}"/>`;
                });
                return `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
                    <rect width="${size}" height="${size}" fill="${color}"/>
                    ${circles}
                </pattern>\n`;
            }

            case 'large-stones': {
                const size = params.backgroundSize || 40;
                const minR = params.minRadius || 5;
                const maxR = params.maxRadius || 6;
                // 8 spots per tile to match CSS
                const spots = [
                    [0.15, 0.25, minR], [0.50, 0.15, maxR], [0.85, 0.30, minR], [0.25, 0.70, maxR],
                    [0.60, 0.55, minR], [0.90, 0.75, maxR], [0.40, 0.90, minR], [0.75, 0.85, minR]
                ];
                let circles = '';
                spots.forEach(([px, py, r]) => {
                    circles += `<circle cx="${px * size}" cy="${py * size}" r="${r}" fill="${colorDark}"/>`;
                });
                return `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
                    <rect width="${size}" height="${size}" fill="${color}"/>
                    ${circles}
                </pattern>\n`;
            }

            case 'stabilized-crosshatch': {
                // CSS: 135deg (colorDark) = /, 45deg (grayColor) = \
                const spacing = params.spacing || 10;
                const grayColor = params.grayColor || '#9ca3af';
                return `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}">
                    <rect width="${spacing}" height="${spacing}" fill="${color}"/>
                    <line x1="0" y1="${spacing}" x2="${spacing}" y2="0" stroke="${colorDark}" stroke-width="2"/>
                    <line x1="0" y1="0" x2="${spacing}" y2="${spacing}" stroke="${grayColor}" stroke-width="2"/>
                </pattern>\n`;
            }

            case 'stabilized-banded': {
                // CSS: 135deg = / direction stripes
                const spacing = params.spacing || 10;
                const grayColor = params.grayColor || '#9ca3af';
                const bandSpacing = params.bandSpacing || 25;
                const bandWidth = params.bandWidth || 4;
                return `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="${spacing}" height="${bandSpacing}">
                    <rect width="${spacing}" height="${bandSpacing}" fill="${color}"/>
                    <line x1="${spacing}" y1="0" x2="0" y2="${spacing}" stroke="${colorDark}" stroke-width="2"/>
                    <line x1="${spacing}" y1="${spacing}" x2="0" y2="${spacing * 2}" stroke="${colorDark}" stroke-width="2"/>
                    <rect x="0" y="${bandSpacing - bandWidth}" width="${spacing}" height="${bandWidth}" fill="${grayColor}"/>
                </pattern>\n`;
            }

            case 'stabilized-mottled': {
                const spacing = params.spacing || 10;
                const grayColor = params.grayColor || '#7a8494';
                const mottleDensity = params.mottleDensity || 0.5;
                const size = Math.max(8, Math.round(mottleDensity * 80));
                const minR = params.minRadius || 2;
                const maxR = params.maxRadius || 3;
                // 15 spots per tile to match CSS
                const spots = [
                    [0.10, 0.15, maxR], [0.35, 0.10, minR], [0.60, 0.20, maxR], [0.85, 0.08, minR],
                    [0.20, 0.40, minR], [0.50, 0.35, maxR], [0.75, 0.45, minR], [0.05, 0.60, maxR],
                    [0.30, 0.70, minR], [0.55, 0.55, maxR], [0.80, 0.65, minR], [0.15, 0.85, minR],
                    [0.45, 0.90, maxR], [0.70, 0.80, minR], [0.95, 0.92, maxR]
                ];
                let circles = '';
                spots.forEach(([px, py, r]) => {
                    circles += `<circle cx="${px * size}" cy="${py * size}" r="${r}" fill="${grayColor}"/>`;
                });
                // Diagonal stripes as background
                const numStripes = Math.ceil(size / spacing) + 1;
                let stripes = '';
                for (let i = -numStripes; i <= numStripes * 2; i++) {
                    const offset = i * spacing;
                    stripes += `<line x1="${offset + size}" y1="0" x2="${offset}" y2="${size}" stroke="${colorDark}" stroke-width="2"/>`;
                }
                return `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
                    <rect width="${size}" height="${size}" fill="${color}"/>
                    ${stripes}
                    ${circles}
                </pattern>\n`;
            }

            default:
                return `
                <pattern id="${id}" patternUnits="userSpaceOnUse" width="10" height="10">
                    <rect width="10" height="10" fill="${color}"/>
                </pattern>\n`;
        }
    }

    generateSvgGeosyntheticLines(geo) {
        const lineColor = this.patternGenerator.getGeosyntheticColor(geo.color);
        return `
        <line x1="${geo.x}" y1="${geo.y}" x2="${geo.x + geo.width}" y2="${geo.y}" stroke="${lineColor}" stroke-width="4" stroke-dasharray="12,4"/>
        <line x1="${geo.x}" y1="${geo.y - 3}" x2="${geo.x + geo.width}" y2="${geo.y - 3}" stroke="${lineColor}" stroke-width="2"/>
        <line x1="${geo.x}" y1="${geo.y + 3}" x2="${geo.x + geo.width}" y2="${geo.y + 3}" stroke="${lineColor}" stroke-width="2"/>
        `;
    }

    generateSvgGeosyntheticLabel(geo) {
        const lineColor = this.patternGenerator.getGeosyntheticColor(geo.color);
        const labelText = this.escapeXml(geo.name);
        const textWidth = this.estimateTextWidth(geo.name, 11);
        const padding = 4;
        const labelX = geo.isPrimary ? geo.x + geo.width - textWidth - padding - 12 : geo.x + 12;

        return `
        <rect x="${labelX - padding}" y="${geo.labelY - 10}" width="${textWidth + padding * 2}" height="20" rx="3" fill="rgba(255,255,255,0.92)" stroke="${lineColor}" stroke-width="2"/>
        <text x="${labelX}" y="${geo.labelY}" dominant-baseline="middle" class="label-text" font-size="11" font-weight="bold" fill="#000000">${labelText}</text>
        `;
    }

    escapeXml(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Estimate text width based on character types (for SVG labels)
    estimateTextWidth(text, fontSize = 12) {
        const scale = fontSize / 12;
        let width = 0;
        for (const char of text) {
            if (char >= 'A' && char <= 'Z') {
                // Uppercase letters are wider
                width += 8.5;
            } else if (char >= 'a' && char <= 'z') {
                // Lowercase letters
                width += 7;
            } else if (char >= '0' && char <= '9') {
                // Numbers
                width += 7;
            } else if (char === ' ') {
                // Space
                width += 4;
            } else if ('()[]<>'.includes(char)) {
                // Narrow punctuation
                width += 5;
            } else {
                // Other characters (comma, period, dash, etc.)
                width += 6;
            }
        }
        return width * scale;
    }

    drawLayerTexture(ctx, type, x, y, width, height, colors) {
        const config = this.patternGenerator.getLayerConfig(type);
        const pattern = config?.pattern || 'scattered-dots';
        const params = config?.patternParams || {};

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        if (pattern === 'diagonal-stripes') {
            // Diagonal stripes (asphalt) - use config spacing
            const spacing = params.spacing || 4;
            ctx.strokeStyle = colors.dark;
            ctx.lineWidth = params.stripeWidth || 2;
            for (let i = -height; i < width + height; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i + height, y + height);
                ctx.stroke();
            }
        } else if (pattern === 'speckle') {
            // Fine speckled pattern (concrete)
            // CSS: 8 spots per tile, tileSize = density (default 80)
            const tileSize = params.density || 80;
            const spotsPerTile = 8;
            const minR = params.minRadius || 0.5;
            const maxR = params.maxRadius || 1.5;
            // Calculate total spots to match CSS tiling density
            const numSpots = Math.ceil((width * height) / (tileSize * tileSize) * spotsPerTile);

            ctx.fillStyle = colors.dark;
            for (let i = 0; i < numSpots; i++) {
                const dotX = x + Math.random() * width;
                const dotY = y + Math.random() * height;
                const radius = minR + Math.random() * (maxR - minR);
                ctx.beginPath();
                ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern === 'scattered-dots') {
            // Scattered dots (aggregate)
            // CSS: 6 spots per tile, tileSize = backgroundSize (default 30)
            const tileSize = params.backgroundSize || 30;
            const spotsPerTile = 6;
            const minR = params.minRadius || 2;
            const maxR = params.maxRadius || 4;
            // Calculate total spots to match CSS tiling density
            const numSpots = Math.ceil((width * height) / (tileSize * tileSize) * spotsPerTile);

            ctx.fillStyle = colors.dark;
            for (let i = 0; i < numSpots; i++) {
                const dotX = x + Math.random() * width;
                const dotY = y + Math.random() * height;
                const radius = minR + Math.random() * (maxR - minR);
                ctx.beginPath();
                ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern === 'large-stones') {
            // Large stones (open-graded)
            // CSS: 8 spots per tile, tileSize = backgroundSize (default 40)
            const tileSize = params.backgroundSize || 40;
            const spotsPerTile = 8;
            const minR = params.minRadius || 5;
            const maxR = params.maxRadius || 6;
            // Calculate total spots to match CSS tiling density
            const numSpots = Math.ceil((width * height) / (tileSize * tileSize) * spotsPerTile);

            ctx.fillStyle = colors.dark;
            for (let i = 0; i < numSpots; i++) {
                const dotX = x + Math.random() * width;
                const dotY = y + Math.random() * height;
                const radius = minR + Math.random() * (maxR - minR);
                ctx.beginPath();
                ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern === 'horizontal-stripes') {
            // Horizontal stripes (stabilized)
            ctx.strokeStyle = colors.dark;
            ctx.lineWidth = 3;
            for (let i = y; i < y + height; i += 6) {
                ctx.beginPath();
                ctx.moveTo(x, i);
                ctx.lineTo(x + width, i);
                ctx.stroke();
            }
        } else if (pattern === 'diagonal-stripes-reverse') {
            // Diagonal pattern opposite direction (subgrade)
            ctx.strokeStyle = colors.dark;
            ctx.lineWidth = 2;
            for (let i = -height; i < width + height; i += 10) {
                ctx.beginPath();
                ctx.moveTo(x + i + height, y);
                ctx.lineTo(x + i, y + height);
                ctx.stroke();
            }
        } else if (pattern === 'stabilized-crosshatch') {
            // Cross-hatch pattern
            const params = config?.patternParams || {};
            const spacing = params.spacing || 10;
            const grayColor = params.grayColor || '#9ca3af';

            ctx.strokeStyle = colors.dark;
            ctx.lineWidth = 2;
            for (let i = -height; i < width + height; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(x + i + height, y);
                ctx.lineTo(x + i, y + height);
                ctx.stroke();
            }

            ctx.strokeStyle = grayColor;
            ctx.lineWidth = 2;
            for (let i = -height; i < width + height; i += spacing * 1.5) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i + height, y + height);
                ctx.stroke();
            }
        } else if (pattern === 'stabilized-banded') {
            // Banded pattern
            const params = config?.patternParams || {};
            const spacing = params.spacing || 10;
            const grayColor = params.grayColor || '#9ca3af';
            const bandSpacing = params.bandSpacing || 25;
            const bandWidth = params.bandWidth || 4;

            ctx.strokeStyle = colors.dark;
            ctx.lineWidth = 2;
            for (let i = -height; i < width + height; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(x + i + height, y);
                ctx.lineTo(x + i, y + height);
                ctx.stroke();
            }

            ctx.fillStyle = grayColor;
            for (let i = y; i < y + height; i += bandSpacing) {
                ctx.fillRect(x, i, width, bandWidth);
            }
        } else if (pattern === 'stabilized-mottled') {
            // Mottled pattern with gray spots
            // CSS: 15 spots per tile, tileSize = mottleDensity * 80
            const spacing = params.spacing || 10;
            const grayColor = params.grayColor || '#7a8494';
            const mottleDensity = params.mottleDensity || 0.5;
            const tileSize = Math.max(8, Math.round(mottleDensity * 80));
            const spotsPerTile = 15;
            const minR = params.minRadius || 2;
            const maxR = params.maxRadius || 3;

            // Draw base diagonal stripes
            ctx.strokeStyle = colors.dark;
            ctx.lineWidth = 2;
            for (let i = -height; i < width + height; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(x + i + height, y);
                ctx.lineTo(x + i, y + height);
                ctx.stroke();
            }

            // Draw gray spots - calculate to match CSS tiling density
            const numSpots = Math.ceil((width * height) / (tileSize * tileSize) * spotsPerTile);
            ctx.fillStyle = grayColor;
            for (let i = 0; i < numSpots; i++) {
                const dotX = x + Math.random() * width;
                const dotY = y + Math.random() * height;
                const radius = minR + Math.random() * (maxR - minR);
                ctx.beginPath();
                ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    drawGeosyntheticLine(ctx, x, y, width, color) {
        ctx.save();

        const lineColor = this.patternGenerator.getGeosyntheticColor(color);

        // Draw dashed line
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 4]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();

        // Border lines
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x, y - 3);
        ctx.lineTo(x + width, y - 3);
        ctx.moveTo(x, y + 3);
        ctx.lineTo(x + width, y + 3);
        ctx.stroke();

        ctx.restore();
    }

    drawGeosyntheticLabel(ctx, x, y, width, name, color, isPrimary = true) {
        ctx.save();

        const borderColor = this.patternGenerator.getGeosyntheticColor(color);

        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
        const textWidth = ctx.measureText(name).width;
        const labelX = isPrimary ? x + width - textWidth - 16 : x + 16;
        const labelPadding = 6;

        // Label background
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.strokeStyle = borderColor;
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
    }

    // Export diagram data as JSON
    exportData() {
        return JSON.stringify({
            layers: this.layers,
            scale: this.scale,
            exportDate: new Date().toISOString()
        }, null, 2);
    }

    // Import diagram data from JSON
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.layers && Array.isArray(data.layers)) {
                this.layers = data.layers;
                if (data.scale) {
                    this.scale = data.scale;
                    this.scaleInput.value = this.scale;
                }
                this.renderLayersList();
                this.renderDiagram();
                return true;
            }
        } catch (e) {
            console.error('Import failed:', e);
        }
        return false;
    }

    // Save/Load Diagram Methods
    openSaveModal() {
        if (this.layers.length === 0) {
            alert('No layers to save. Add layers first.');
            return;
        }
        this.diagramNameInput.value = '';
        this.saveModal.classList.add('active');
        this.diagramNameInput.focus();
    }

    closeSaveModal() {
        this.saveModal.classList.remove('active');
        this.diagramNameInput.value = '';
    }

    handleSaveSubmit(e) {
        e.preventDefault();
        const name = this.diagramNameInput.value.trim();
        if (!name) return;

        const savedDiagrams = this.getSavedDiagrams();

        // Check if name already exists
        const existingIndex = savedDiagrams.findIndex(d => d.name === name);
        if (existingIndex !== -1) {
            if (!confirm(`A diagram named "${name}" already exists. Overwrite?`)) {
                return;
            }
            savedDiagrams.splice(existingIndex, 1);
        }

        const diagramData = {
            id: Date.now().toString(),
            name: name,
            savedAt: new Date().toISOString(),
            layers: this.layers,
            scale: this.scale,
            diagramWidth: this.diagramWidth,
            diagramTitle: this.diagramTitleInput.value.trim()
        };

        savedDiagrams.unshift(diagramData);
        localStorage.setItem('pavementDiagrams', JSON.stringify(savedDiagrams));

        this.closeSaveModal();
        this.renderSavedDiagramsList();
    }

    getSavedDiagrams() {
        try {
            const saved = localStorage.getItem('pavementDiagrams');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading saved diagrams:', e);
            return [];
        }
    }

    renderSavedDiagramsList() {
        const savedDiagrams = this.getSavedDiagrams();

        if (savedDiagrams.length === 0) {
            this.savedDiagramsList.innerHTML = '<p class="no-saved">No saved diagrams</p>';
            return;
        }

        this.savedDiagramsList.innerHTML = savedDiagrams.map(diagram => {
            const date = new Date(diagram.savedAt);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            return `
                <div class="saved-diagram-item" data-id="${diagram.id}">
                    <div class="saved-diagram-info" onclick="app.loadDiagram('${diagram.id}')">
                        <div class="saved-diagram-name">${this.escapeHtml(diagram.name)}</div>
                        <div class="saved-diagram-date">${dateStr} &bull; ${diagram.layers.length} layers</div>
                    </div>
                    <div class="saved-diagram-actions">
                        <button class="btn-save" onclick="app.overwriteDiagram('${diagram.id}')" title="Save current to this">&#128190;</button>
                        <button class="btn-delete" onclick="app.deleteDiagram('${diagram.id}')" title="Delete">&#10005;</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadDiagram(id) {
        const savedDiagrams = this.getSavedDiagrams();
        const diagram = savedDiagrams.find(d => d.id === id);

        if (!diagram) {
            alert('Diagram not found.');
            return;
        }

        this.layers = diagram.layers;
        this.scale = diagram.scale || 20;
        this.diagramWidth = diagram.diagramWidth || 300;

        this.scaleInput.value = this.scale;
        this.widthInput.value = this.diagramWidth;
        this.diagramTitleInput.value = diagram.diagramTitle || '';

        this.renderLayersList();
        this.renderDiagram();
    }

    deleteDiagram(id) {
        if (!confirm('Are you sure you want to delete this saved diagram?')) {
            return;
        }

        const savedDiagrams = this.getSavedDiagrams();
        const filteredDiagrams = savedDiagrams.filter(d => d.id !== id);
        localStorage.setItem('pavementDiagrams', JSON.stringify(filteredDiagrams));

        this.renderSavedDiagramsList();
    }

    overwriteDiagram(id) {
        if (this.layers.length === 0) {
            alert('No layers to save. Add layers first.');
            return;
        }

        const savedDiagrams = this.getSavedDiagrams();
        const diagramIndex = savedDiagrams.findIndex(d => d.id === id);

        if (diagramIndex === -1) {
            alert('Diagram not found.');
            return;
        }

        const existingName = savedDiagrams[diagramIndex].name;
        if (!confirm(`Overwrite "${existingName}" with current configuration?`)) {
            return;
        }

        savedDiagrams[diagramIndex] = {
            id: id,
            name: existingName,
            savedAt: new Date().toISOString(),
            layers: this.layers,
            scale: this.scale,
            diagramWidth: this.diagramWidth,
            diagramTitle: this.diagramTitleInput.value.trim()
        };

        localStorage.setItem('pavementDiagrams', JSON.stringify(savedDiagrams));
        this.renderSavedDiagramsList();
    }
}

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', async () => {
    app = new PavementDiagramBuilder();
    await app.init();
});
