// Pavement Layer Diagram Builder - Main Application

class PavementDiagramBuilder {
    constructor() {
        this.layers = [];
        this.editingLayerIndex = null;
        this.scale = 20; // pixels per inch
        this.diagramWidth = 300; // diagram width in pixels
        this.patternGenerator = patternGenerator;
        this.lastSaveHandle = null; // Remember last save location
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

            // Generate default filename from diagram title
            const diagramTitle = this.diagramTitleInput.value.trim();
            const defaultFilename = diagramTitle ? `${diagramTitle}.png` : 'pavement-section-diagram.png';

            // Try to use File System Access API for save dialog
            if ('showSaveFilePicker' in window) {
                try {
                    // Build picker options with last save location if available
                    const pickerOptions = {
                        suggestedName: defaultFilename,
                        types: [{
                            description: 'PNG Image',
                            accept: { 'image/png': ['.png'] }
                        }]
                    };

                    // Start in the last used directory if we have a previous handle
                    if (this.lastSaveHandle) {
                        pickerOptions.startIn = this.lastSaveHandle;
                    }

                    const handle = await window.showSaveFilePicker(pickerOptions);

                    // Convert canvas to blob and write to file
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();

                    // Remember this location for next export
                    this.lastSaveHandle = handle;
                    return;
                } catch (err) {
                    // User cancelled the save dialog
                    if (err.name === 'AbortError') {
                        return;
                    }
                    // Fall through to standard download for other errors
                    console.warn('File System Access API failed, falling back to download:', err);
                }
            }

            // Fallback: standard download with filename
            const link = document.createElement('a');
            link.download = defaultFilename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('PNG export failed:', err);
            alert('PNG export failed. Please try again.');
        }
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
            const diagrams = saved ? JSON.parse(saved) : [];
            // Sort by date saved, most recent first
            diagrams.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
            return diagrams;
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
            const titleDisplay = diagram.diagramTitle ? `<div class="saved-diagram-title">${this.escapeHtml(diagram.diagramTitle)}</div>` : '';

            return `
                <div class="saved-diagram-item" data-id="${diagram.id}">
                    <div class="saved-diagram-info" onclick="app.loadDiagram('${diagram.id}')">
                        <div class="saved-diagram-name">${this.escapeHtml(diagram.name)}</div>
                        ${titleDisplay}
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
