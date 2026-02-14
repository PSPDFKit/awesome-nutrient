// This function creates DOM elements directly for NutrientViewer UI slots
const createSigningControlsSidebar = ({
  instance,
  isLoaded,
  currentMode,
  isFormCreatorMode,
  activeOverlays,
  selectedAnnotations,
  createWidget,
  toggleFormCreator
}) => {
  let widgetType = "signature";

  const handleCreateWidget = async () => {
    if (!instance || !isLoaded) return;

    // Find the selected field type configuration
    const selectedFieldType = fieldTypes.find(ft => ft.type === widgetType);
    if (!selectedFieldType) return;

    // Create widget configuration from field type
    const config = {
      customData: {
        text: selectedFieldType.defaultText,
        type: selectedFieldType.type,
        ...(selectedFieldType.format && { format: selectedFieldType.format }),
        ...(selectedFieldType.type === "date" && {
          selectedDate: new Date().toISOString().split("T")[0]
        })
      },
      boundingBox: {
        left: 100,
        top: 100 + (fieldTypes.indexOf(selectedFieldType) * 60), // Stagger positions
        width: selectedFieldType.dimensions.width,
        height: selectedFieldType.dimensions.height
      },
      fieldClass: selectedFieldType.formFieldClass
    };

    const result = await createWidget(config);

    if (result) {
      console.log(`Created ${widgetType} widget:`, result);
    }
  };

  // Create the main container
  const container = document.createElement("div");
  container.style.cssText = `
    padding: 16px;
    color: #e0e0e0;
    background-color: #2d2d2d;
    height: 100%;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    box-sizing: border-box;
    overflow-y: auto;
  `;

  // Header section
  const header = document.createElement("div");
  header.style.cssText = `
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #444;
  `;

  const title = document.createElement("h3");
  title.textContent = "Signing Controls";
  title.style.cssText = `
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
  `;

  const subtitle = document.createElement("p");
  subtitle.textContent = "Create and manage signature fields, text inputs, and date pickers";
  subtitle.style.cssText = `
    margin: 8px 0 0 0;
    font-size: 12px;
    color: #aaa;
    line-height: 1.4;
  `;

  header.appendChild(title);
  header.appendChild(subtitle);

  // Form Creator Toggle Button (moved to top)
  const formCreatorSection = document.createElement("div");
  formCreatorSection.style.marginBottom = "20px";

  const toggleButton = document.createElement("button");
  toggleButton.textContent = isFormCreatorMode ? "Exit Editor" : "Enter Editor";
  toggleButton.disabled = !isLoaded;
  toggleButton.style.cssText = `
    width: 100%;
    padding: 12px 16px;
    border-radius: 6px;
    border: none;
    background-color: ${isFormCreatorMode ? "#28a745" : "#ffc107"};
    color: ${isFormCreatorMode ? "white" : "#000"};
    cursor: ${isLoaded ? "pointer" : "not-allowed"};
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.2s;
  `;
  toggleButton.addEventListener("click", toggleFormCreator);
  toggleButton.addEventListener("mouseenter", () => {
    if (isLoaded) {
      toggleButton.style.backgroundColor = isFormCreatorMode ? "#1e7e34" : "#e0a800";
    }
  });
  toggleButton.addEventListener("mouseleave", () => {
    if (isLoaded) {
      toggleButton.style.backgroundColor = isFormCreatorMode ? "#28a745" : "#ffc107";
    }
  });

  formCreatorSection.appendChild(toggleButton);

  // Drag and drop field types section
  const dragDropSection = document.createElement("div");
  dragDropSection.style.marginBottom = "20px";

  const dragDropLabel = document.createElement("label");
  dragDropLabel.textContent = "Drag & Drop Field Types";
  dragDropLabel.style.cssText = `
    display: block;
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 500;
    color: #ccc;
  `;

  const fieldTypesContainer = document.createElement("div");
  fieldTypesContainer.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  `;

  // Import field registry functions (would need proper import in real implementation)
  // For now, implementing inline for this demo
  const getAvailableFieldTypes = () => {
    const fieldTypes = [];

    if (window.NutrientViewer?.FormFields) {
      const { FormFields } = window.NutrientViewer;

      // Only show common fields in sidebar for better UX
      if (FormFields.SignatureFormField) {
        fieldTypes.push(
          {
            type: 'signature',
            formFieldClass: FormFields.SignatureFormField,
            icon: '📝',
            label: 'Signature',
            color: '#007bff',
            defaultText: 'Click to sign',
            dimensions: { width: 120, height: 50 }
          },
          {
            type: 'initials',
            formFieldClass: FormFields.SignatureFormField,
            icon: '✍️',
            label: 'Initials',
            color: '#28a745',
            defaultText: 'Initials',
            dimensions: { width: 80, height: 40 }
          }
        );
      }

      if (FormFields.TextFormField) {
        fieldTypes.push(
          {
            type: 'name',
            formFieldClass: FormFields.TextFormField,
            icon: '👤',
            label: 'Name',
            color: '#ffc107',
            defaultText: 'Enter name',
            dimensions: { width: 150, height: 40 }
          },
          {
            type: 'date',
            formFieldClass: FormFields.TextFormField,
            icon: '📅',
            label: 'Date',
            color: '#dc3545',
            defaultText: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            dimensions: { width: 130, height: 35 },
            format: 'date'
          }
        );
      }
    }

    return fieldTypes;
  };

  const fieldTypes = getAvailableFieldTypes();

  // Create draggable field type elements
  fieldTypes.forEach(fieldType => {
    const fieldElement = document.createElement("div");
    fieldElement.draggable = isFormCreatorMode;
    fieldElement.className = "draggable-field";
    fieldElement.dataset.fieldType = fieldType.type;

    const isDisabled = !isFormCreatorMode;
    fieldElement.style.cssText = `
      padding: 12px 8px;
      border-radius: 6px;
      border: 2px dashed ${isDisabled ? "#555" : fieldType.color};
      background-color: rgba(${hexToRgb(isDisabled ? "#555" : fieldType.color)}, 0.1);
      color: ${isDisabled ? "#888" : fieldType.color};
      text-align: center;
      cursor: ${isDisabled ? "not-allowed" : "grab"};
      transition: all 0.2s ease;
      font-size: 11px;
      font-weight: 500;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      opacity: ${isDisabled ? 0.5 : 1};
    `;

    const icon = document.createElement("div");
    icon.textContent = fieldType.icon;
    icon.style.fontSize = "16px";

    const label = document.createElement("div");
    label.textContent = fieldType.label;

    fieldElement.appendChild(icon);
    fieldElement.appendChild(label);

    // Drag event handlers - only if form creator mode is enabled
    if (isFormCreatorMode) {
      fieldElement.addEventListener("dragstart", (e) => {
        fieldElement.style.cursor = "grabbing";
        fieldElement.style.opacity = "0.7";
        e.dataTransfer.setData("text/plain", fieldType.type);
        e.dataTransfer.effectAllowed = "copy";
      });

      fieldElement.addEventListener("dragend", (e) => {
        fieldElement.style.cursor = "grab";
        fieldElement.style.opacity = "1";
      });

      // Hover effects for enabled state
      fieldElement.addEventListener("mouseenter", () => {
        fieldElement.style.backgroundColor = `rgba(${hexToRgb(fieldType.color)}, 0.2)`;
        fieldElement.style.transform = "scale(1.02)";
      });

      fieldElement.addEventListener("mouseleave", () => {
        fieldElement.style.backgroundColor = `rgba(${hexToRgb(fieldType.color)}, 0.1)`;
        fieldElement.style.transform = "scale(1)";
      });
    }

    fieldTypesContainer.appendChild(fieldElement);
  });

  // Helper function to convert hex to rgb
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
      "0, 123, 255";
  }

  dragDropSection.appendChild(dragDropLabel);
  dragDropSection.appendChild(fieldTypesContainer);

  // Widget type selection (keep for backwards compatibility or quick creation)
  const widgetTypeSection = document.createElement("div");
  widgetTypeSection.style.marginBottom = "16px";

  const widgetTypeLabel = document.createElement("label");
  widgetTypeLabel.textContent = "Quick Create";
  widgetTypeLabel.style.cssText = `
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #ccc;
  `;

  const widgetTypeSelect = document.createElement("select");
  widgetTypeSelect.innerHTML = `
    <option value="signature">📝 Signature Field</option>
    <option value="initials">✍️ Initials Field</option>
    <option value="name">👤 Name Field</option>
    <option value="date">📅 Date Field</option>
  `;
  widgetTypeSelect.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #555;
    background-color: #3d3d3d;
    color: #fff;
    font-size: 13px;
    outline: none;
  `;
  widgetTypeSelect.addEventListener("change", (e) => {
    widgetType = e.target.value;
  });

  widgetTypeSection.appendChild(widgetTypeLabel);
  widgetTypeSection.appendChild(widgetTypeSelect);

  // Action buttons section
  const buttonsSection = document.createElement("div");
  buttonsSection.style.marginBottom = "20px";

  const createButton = document.createElement("button");
  createButton.textContent = "Create Widget";
  createButton.disabled = !isLoaded || !isFormCreatorMode;
  createButton.style.cssText = `
    width: 100%;
    padding: 10px 16px;
    border-radius: 6px;
    border: none;
    background-color: ${isLoaded && isFormCreatorMode? "#007bff" : "#555"};
    color: white;
    cursor: ${isLoaded && isFormCreatorMode ? "pointer" : "not-allowed"};
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
    transition: background-color 0.2s;
  `;
  createButton.addEventListener("click", handleCreateWidget);
  createButton.addEventListener("mouseenter", () => {
    console.log('is formcreator mode: ', isFormCreatorMode)
    if (isLoaded && isFormCreatorMode) createButton.style.backgroundColor = "#0056b3";
  });
  createButton.addEventListener("mouseleave", () => {
    if (isLoaded && isFormCreatorMode) createButton.style.backgroundColor = "#007bff";
  });

  buttonsSection.appendChild(createButton);

  // Status section
  const statusSection = document.createElement("div");
  statusSection.style.cssText = `
    padding: 12px;
    background-color: #3d3d3d;
    border-radius: 6px;
    margin-bottom: 16px;
  `;

  const statusTitle = document.createElement("h4");
  statusTitle.textContent = "Status";
  statusTitle.style.cssText = `
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
  `;

  const statusContent = document.createElement("div");
  statusContent.style.cssText = "font-size: 12px; line-height: 1.6; color: #ccc;";
  statusContent.innerHTML = `
    <div style="margin-bottom: 4px;">
      <span style="color: #aaa;">Viewer:</span>
      <span style="color: ${isLoaded ? "#28a745" : "#ffc107"};">${isLoaded ? "Ready" : "Loading..."}</span>
    </div>
    <div style="margin-bottom: 4px;">
      <span style="color: #aaa;">Mode:</span>
      <span style="color: #fff;">${currentMode}</span>
    </div>
    <div style="margin-bottom: 4px;">
      <span style="color: #aaa;">Active Overlays:</span>
      <span style="color: #fff;">${activeOverlays}</span>
    </div>
    ${selectedAnnotations.length > 0 ? `
      <div>
        <span style="color: #aaa;">Selected:</span>
        <span style="color: #007bff;">${selectedAnnotations.length} item(s)</span>
      </div>
    ` : ""}
  `;

  statusSection.appendChild(statusTitle);
  statusSection.appendChild(statusContent);

  // Instructions section
  const instructionsSection = document.createElement("div");
  instructionsSection.style.cssText = `
    padding: 12px;
    background-color: #333;
    border-radius: 6px;
    border-left: 3px solid #007bff;
  `;

  const instructionsTitle = document.createElement("h4");
  instructionsTitle.textContent = "How to Use";
  instructionsTitle.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
  `;

  const instructionsContent = document.createElement("div");
  instructionsContent.style.cssText = "font-size: 11px; line-height: 1.5; color: #bbb;";
  instructionsContent.innerHTML = `
    <div style="margin-bottom: 6px;">1. Select widget type above</div>
    <div style="margin-bottom: 6px;">2. Click "Create Widget" to add to document</div>
    <div style="margin-bottom: 6px;">3. Use "Enter Editor" for drag & drop mode</div>
    <div style="margin-bottom: 6px;">4. Interact with widgets:</div>
    <div style="margin-left: 12px; font-size: 10px;">
      <div>• 📝 Click signature fields to sign</div>
      <div>• 📄 Double-click text fields to edit</div>
      <div>• 📅 Click date fields to select date</div>
    </div>
  `;

  instructionsSection.appendChild(instructionsTitle);
  instructionsSection.appendChild(instructionsContent);

  // Assemble the container
  container.appendChild(header);
  container.appendChild(formCreatorSection);
  container.appendChild(dragDropSection);
  container.appendChild(widgetTypeSection);
  container.appendChild(buttonsSection);
  container.appendChild(statusSection);
  container.appendChild(instructionsSection);

  return container;
};

export default createSigningControlsSidebar;
