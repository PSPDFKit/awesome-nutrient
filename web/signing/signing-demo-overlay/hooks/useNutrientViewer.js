import { useEffect, useRef, useState, useCallback, useMemo } from "react";

export const useNutrientViewer = ({
  document: documentUrl,
  theme = "DARK",
  styleSheets = [],
  onReady,
  customWidgetComponent,
  enableFormCreator = true,
  customSidebarComponent,
}) => {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const overlayManagerRef = useRef(null);
  const sidebarUpdaterRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedAnnotations, setSelectedAnnotations] = useState([]);
  const [currentMode, setCurrentMode] = useState(false);

  // Memoize the styleSheets array to prevent unnecessary re-renders
  const memoizedStyleSheets = useMemo(() => styleSheets, [JSON.stringify(styleSheets)]);

  // Initialize NutrientViewer
  useEffect(() => {
    if (!containerRef.current || !window.NutrientViewer) return;

    const initializeViewer = async () => {
      try {
        // Setup UI configuration with custom sidebar
        const uiConfig = {};
        if (customSidebarComponent) {
          uiConfig.sidebar = {
            signingControls: (instance, id) => {
              let sidebarContainer = null;

              const updateSidebar = () => {
                if (sidebarContainer) {
                  // Clear and re-render with current state
                  sidebarContainer.innerHTML = '';
                  const newSidebar = customSidebarComponent({
                    instance: instanceRef.current || instance,
                    isLoaded: instanceRef.current ? true : false, // Use actual loaded state
                    currentMode: instanceRef.current?.viewState?.formDesignMode ? "Form Creator" : "Signing",
                    isFormCreatorMode: instanceRef.current?.viewState?.formDesignMode,
                    activeOverlays: overlayManagerRef.current?.activeOverlays?.size || 0,
                    selectedAnnotations: selectedAnnotations,
                    createWidget,
                    toggleFormCreator,
                    isSidebarOpen: instanceRef.current?.viewState?.sidebarMode === "signingControls",
                  });
                  sidebarContainer.appendChild(newSidebar);
                }
              };

              return {
                render: () => {
                  sidebarContainer = document.createElement("div");
                  sidebarContainer.style.cssText = "width: 100%; height: 100%;";

                  // Initial render with current state
                  const initialSidebar = customSidebarComponent({
                    instance: instanceRef.current || instance,
                    isLoaded: instanceRef.current ? true : false,
                    currentMode: instanceRef.current?.viewState?.formDesignMode ? "Form Creator" : "Signing",
                    isFormCreatorMode: instanceRef.current?.viewState?.formDesignMode,
                    activeOverlays: overlayManagerRef.current?.activeOverlays?.size || 0,
                    selectedAnnotations: selectedAnnotations,
                    createWidget,
                    toggleFormCreator,
                    isSidebarOpen: instanceRef.current?.viewState?.sidebarMode === "signingControls",
                  });
                  sidebarContainer.appendChild(initialSidebar);

                  return sidebarContainer;
                },
                onMount: (id) => {
                  console.log(`Custom sidebar ${id} mounted`);
                  // Store the updater function in our ref
                  sidebarUpdaterRef.current = updateSidebar;
                },
                onUnmount: (id) => {
                  console.log(`Custom sidebar ${id} unmounted`);
                  // Clear the updater function
                  sidebarUpdaterRef.current = null;
                },
              };
            },
          };
        }

        const instance = await window.NutrientViewer.load({
          container: containerRef.current,
          document: documentUrl,
          theme: window.NutrientViewer.Theme[theme],
          styleSheets: memoizedStyleSheets,
          ...(Object.keys(uiConfig).length > 0 && { ui: uiConfig }),
          ...(customSidebarComponent && {
            initialViewState: new window.NutrientViewer.ViewState({
              sidebarMode: "signingControls",
            }),
          }),
        });

        instanceRef.current = instance;

        // Initialize overlay manager if custom widget component is provided
        if (customWidgetComponent) {
          overlayManagerRef.current = new WidgetOverlayManager(
            instance,
            customWidgetComponent
          );
        }

        // Setup event listeners
        setupEventListeners(instance);

        // Setup toolbar
        if (enableFormCreator || customSidebarComponent) {
          setupToolbar(instance);
        }

        setIsLoaded(true);
        setCurrentMode(instance.viewState.formDesignMode);

        // Setup drop zone for drag and drop functionality
        setupDropZone(instance);

        // Update sidebar after initial load
        if (sidebarUpdaterRef.current) {
          setTimeout(() => sidebarUpdaterRef.current(), 100);
        }

        if (onReady) {
          onReady(instance);
        }
      } catch (error) {
        console.error("Failed to initialize NutrientViewer:", error);
      }
    };

    initializeViewer();

    // Cleanup
    return () => {
      if (containerRef.current?._cleanupDropZone) {
        containerRef.current._cleanupDropZone();
      }

      if (overlayManagerRef.current) {
        overlayManagerRef.current.destroy();
        overlayManagerRef.current = null;
      }

      if (instanceRef.current) {
        window.NutrientViewer.unload(instanceRef.current);
        instanceRef.current.destroy?.();
        instanceRef.current = null;
      }
    };
  }, []);

  const setupEventListeners = useCallback((instance) => {
    const updateSelection = (annotations) => {
      setSelectedAnnotations(annotations || []);
    };

    const updateViewState = (current, prev) => {
      setCurrentMode(current.formDesignMode);

      // Handle custom renderer setup for form creator mode
      if (customWidgetComponent) {
        if (current.formDesignMode) {
          instance.setCustomRenderers({
            Annotation: ({ annotation }) => {
              if (
                annotation instanceof window.NutrientViewer.Annotations.WidgetAnnotation
              ) {
                // Return empty div - overlay manager handles the overlay
                const emptyDiv = document.createElement("div");
                emptyDiv.style.cssText = `
                  position: absolute;
                  width: 0;
                  height: 0;
                  pointer-events: none;
                  opacity: 0;
                `;
                return { node: emptyDiv, append: false };
              }
              return null;
            },
          });
        } else {
          instance.setCustomRenderers(() => null);
        }
      }

      // Update sidebar when sidebarMode changes to our custom sidebar
      if (current.sidebarMode === "signingControls" && sidebarUpdaterRef.current) {
        setTimeout(() => sidebarUpdaterRef.current(), 50);
      }
    };

    // Add event listeners
    instance.addEventListener("annotations.press", updateSelection);
    instance.addEventListener("annotationSelection.change", updateSelection);
    instance.addEventListener("viewState.change", updateViewState);

    // Store cleanup function
    instance._cleanupEventListeners = () => {
      instance.removeEventListener("annotations.press", updateSelection);
      instance.removeEventListener("annotationSelection.change", updateSelection);
      instance.removeEventListener("viewState.change", updateViewState);
    };

    // Initial update
    updateSelection();
  }, [customWidgetComponent]);

  const setupToolbar = useCallback((instance) => {
    const toolbarItems = [];

    // Add signing controls sidebar toggle if custom sidebar is provided
    if (customSidebarComponent) {
      const signingControlsButton = {
        type: "custom",
        id: "signingControlsButton",
        title: "Signing Controls",
        dropdownGroup: "sidebar",
        selected: instance.viewState.sidebarMode === "signingControls",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41L18.37 3.29a.996.996 0 0 0-1.41 0L15.13 5.12l3.75 3.75 1.83-1.83z"/></svg>',
        onPress: () => {
          instance.setViewState((viewState) =>
            viewState.set(
              "sidebarMode",
              viewState.sidebarMode === "signingControls" ? null : "signingControls"
            )
          );
        },
      };
      toolbarItems.push(signingControlsButton);

      // Add event listener to update toolbar item selection state
      instance.addEventListener("viewState.change", (viewState, prevViewState) => {
        if (viewState.sidebarMode === prevViewState.sidebarMode) {
          return;
        }

        instance.setToolbarItems((items) =>
          items.map((item) =>
            item.id === "signingControlsButton"
              ? { ...item, selected: viewState.sidebarMode === "signingControls" }
              : item
          )
        );
      });
    }

    // Add form creator tools if enabled
    if (enableFormCreator) {
      const toggleFormCreatorButton = {
        type: "custom",
        title: "Toggle Form Creator Mode",
        onPress: () => {

          instance.setViewState((viewState) =>
            viewState.set("formDesignMode", !viewState?.formDesignMode )
          );
        },
      };

      toolbarItems.push(
        toggleFormCreatorButton,
        { type: "form-creator" }
      );
    }

    // Add default tools
    toolbarItems.push(
      { type: "export-pdf" },
      { type: "print" }
    );

    instance.setToolbarItems([
      ...window.NutrientViewer.defaultToolbarItems,
      ...toolbarItems
    ]);
  }, [customSidebarComponent, enableFormCreator]);

  const setupDropZone = useCallback((instance) => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent default drag behaviors
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Visual feedback during drag
    const handleDragEnter = (e) => {
      preventDefaults(e);
      if (e.dataTransfer.types.includes('text/plain')) {
        container.classList.add('drag-over');
      }
    };

    const handleDragLeave = (e) => {
      preventDefaults(e);
      // Only remove if we're leaving the container entirely
      if (!container.contains(e.relatedTarget)) {
        container.classList.remove('drag-over');
      }
    };

    const handleDragOver = (e) => {
      preventDefaults(e);
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e) => {
      preventDefaults(e);
      container.classList.remove('drag-over');

      // Only allow drops in form creator mode
      if (!instanceRef.current?.viewState?.formDesignMode) {
        return;
      }

      const fieldType = e.dataTransfer.getData('text/plain');
      if (!fieldType) return;

      // Get the drop position relative to the PDF page
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert screen coordinates to PDF page coordinates
      try {
        const dropPoint = instance.transformContentClientToPageSpace(
          new window.NutrientViewer.Geometry.Point({ x, y }),
          instance.viewState.currentPageIndex || 0
        );

        // Get field type configuration from drag data
        const getFieldTypeConfig = (fieldType) => {
          // Default configurations
          const fieldConfigs = {
            signature: {
              dimensions: { width: 120, height: 50 },
              customData: { text: "Click to sign", type: "signature" }
            },
            initials: {
              dimensions: { width: 80, height: 40 },
              customData: { text: "Initials", type: "initials" }
            },
            text: {
              dimensions: { width: 150, height: 40 },
              customData: { text: "Enter text", type: "text" }
            },
            name: {
              dimensions: { width: 150, height: 40 },
              customData: { text: "Enter name", type: "name" }
            },
            email: {
              dimensions: { width: 200, height: 40 },
              customData: { text: "Enter email", type: "email", format: "email" }
            },
            date: {
              dimensions: { width: 130, height: 35 },
              customData: {
                text: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
                type: "date",
                format: "date",
                selectedDate: new Date().toISOString().split("T")[0]
              }
            },
            checkbox: {
              dimensions: { width: 20, height: 20 },
              customData: { text: "Check", type: "checkbox", checked: false }
            },
            radio: {
              dimensions: { width: 20, height: 20 },
              customData: { text: "Option", type: "radio", value: null }
            },
            listbox: {
              dimensions: { width: 120, height: 80 },
              customData: { text: "Select option", type: "listbox", options: ["Option 1", "Option 2"] }
            },
            combobox: {
              dimensions: { width: 120, height: 35 },
              customData: { text: "Select...", type: "combobox", options: ["Option 1", "Option 2"] }
            }
          };

          return fieldConfigs[fieldType] || fieldConfigs.text;
        };

        const fieldConfig = getFieldTypeConfig(fieldType);
        const dimensions = fieldConfig.dimensions;

        // Center the widget on the drop point
        const centeredLeft = dropPoint.x - (dimensions.width / 2);
        const centeredTop = dropPoint.y - (dimensions.height / 2);

        // Create proposed bounding box for validation
        const proposedBounds = new window.NutrientViewer.Geometry.Rect({
          left: centeredLeft,
          top: centeredTop,
          width: dimensions.width,
          height: dimensions.height
        });

        // Validate position before creating widget
        const isValidPosition = await validateDropPosition(proposedBounds, instance.viewState.currentPageIndex || 0);

        if (!isValidPosition) {
          console.log(`Cannot drop ${fieldType} widget: position would overlap or go outside page boundaries`);
          return;
        }

        // Create widget configuration
        const config = {
          customData: fieldConfig.customData,
          boundingBox: {
            left: centeredLeft,
            top: centeredTop,
            width: dimensions.width,
            height: dimensions.height
          }
        };

        const result = await createWidget(config);
        if (result) {
          console.log(`Created ${fieldType} widget via drag and drop:`, result);
        }
      } catch (error) {
        console.error('Error creating widget from drop:', error);
      }
    };

    // Add event listeners
    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);

    // Validation function for drop position
    const validateDropPosition = async (proposedBounds, pageIndex) => {
      // Check page boundaries
      const pageInfo = instance.pageInfoForIndex(pageIndex);
      if (!pageInfo) return false;

      // Check if widget would go outside page boundaries
      if (proposedBounds.left < 0 ||
          proposedBounds.top < 0 ||
          proposedBounds.left + proposedBounds.width > pageInfo.width ||
          proposedBounds.top + proposedBounds.height > pageInfo.height) {
        return false;
      }

      // Check for overlaps with existing widgets
      try {
        const annotations = await instance.getAnnotations(pageIndex);

        for (const annotation of annotations) {
          if (annotation instanceof window.NutrientViewer.Annotations.WidgetAnnotation) {
            const annotationBounds = annotation.boundingBox;

            // Check for intersection with gap buffer
            const gap = 8;
            if (!(proposedBounds.left + proposedBounds.width + gap <= annotationBounds.left ||
                  annotationBounds.left + annotationBounds.width + gap <= proposedBounds.left ||
                  proposedBounds.top + proposedBounds.height + gap <= annotationBounds.top ||
                  annotationBounds.top + annotationBounds.height + gap <= proposedBounds.top)) {
              return false; // Overlap detected (including gap)
            }
          }
        }

        return true; // No overlaps found
      } catch (error) {
        console.error('Error checking for drop overlaps:', error);
        return false; // Prevent drop if we can't check
      }
    };

    // Store cleanup function
    container._cleanupDropZone = () => {
      container.removeEventListener('dragenter', handleDragEnter);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, []);

  // API methods
  const createWidget = useCallback(async (options = {}) => {
    if (!instanceRef.current) return null;

    const {
      pageIndex = instanceRef.current.viewState.currentPageIndex || 0,
      boundingBox = { left: 100, top: 100, width: 200, height: 60 },
      customData = { text: "Click to sign", type: "signature" },
      fieldName = `FormField_${Date.now()}`,
    } = options;

    const widgetId = `widget_${Date.now()}`;
    const widgetType = customData.type || "signature";

    const widgetAnnotation = new window.NutrientViewer.Annotations.WidgetAnnotation({
      id: widgetId,
      pageIndex,
      formFieldName: fieldName,
      boundingBox: new window.NutrientViewer.Geometry.Rect(boundingBox),
      backgroundColor: window.NutrientViewer.Color.fromHex("#f8f9fa"),
      borderColor: window.NutrientViewer.Color.fromHex("#007bff"),
      borderWidth: 2,
      fontColor: window.NutrientViewer.Color.fromHex("#333333"),
      fontSize: 14,
      customData,
    });

    // Create form field using the provided field class or fallback to type-based creation
    let formField;
    const FormFieldClass = options.fieldClass;

    if (FormFieldClass) {
      // Use the provided FormField class
      const fieldConfig = {
        name: fieldName,
        annotationIds: new window.NutrientViewer.Immutable.List([widgetId]),
      };

      // Add field-specific configuration
      if (FormFieldClass === window.NutrientViewer.FormFields.SignatureFormField) {
        fieldConfig.value = null;
      } else if (FormFieldClass === window.NutrientViewer.FormFields.TextFormField) {
        fieldConfig.value = customData.text || "";
        fieldConfig.defaultValue = customData.text || "";
        if (customData.format) {
          fieldConfig.format = customData.format;
        }
      } else if (FormFieldClass === window.NutrientViewer.FormFields.CheckBoxFormField) {
        fieldConfig.value = customData.checked || false;
      } else if (FormFieldClass === window.NutrientViewer.FormFields.ListBoxFormField ||
                 FormFieldClass === window.NutrientViewer.FormFields.ComboBoxFormField) {
        fieldConfig.options = customData.options || [customData.text || "Option 1"];
        fieldConfig.value = customData.value || null;
      } else if (FormFieldClass === window.NutrientViewer.FormFields.RadioButtonFormField) {
        fieldConfig.value = customData.value || null;
        fieldConfig.group = customData.group || fieldName;
      }

      formField = new FormFieldClass(fieldConfig);
    } else {
      // Fallback to legacy type-based creation
      switch (widgetType) {
        case "signature":
        case "initials":
          formField = new window.NutrientViewer.FormFields.SignatureFormField({
            name: fieldName,
            annotationIds: new window.NutrientViewer.Immutable.List([widgetId]),
            value: null,
          });
          break;
        case "checkbox":
          formField = new window.NutrientViewer.FormFields.CheckBoxFormField({
            name: fieldName,
            annotationIds: new window.NutrientViewer.Immutable.List([widgetId]),
            value: customData.checked || false,
          });
          break;
        case "date":
        case "email":
          formField = new window.NutrientViewer.FormFields.TextFormField({
            name: fieldName,
            annotationIds: new window.NutrientViewer.Immutable.List([widgetId]),
            value: customData.text || "",
            defaultValue: customData.text || "",
            format: customData.format || widgetType,
          });
          break;
        case "name":
        case "text":
        default:
          formField = new window.NutrientViewer.FormFields.TextFormField({
            name: fieldName,
            annotationIds: new window.NutrientViewer.Immutable.List([widgetId]),
            value: customData.text || "",
            defaultValue: customData.text || "",
          });
          break;
      }
    }

    try {
      await instanceRef.current.create([widgetAnnotation, formField]);
      return { annotation: widgetAnnotation, formField };
    } catch (error) {
      console.error("Error creating widget:", error);
      return null;
    }
  }, []);

  const toggleFormCreator = useCallback(() => {
    if (!instanceRef.current) return;

    const currentMode = instanceRef.current.viewState.formDesignMode;

    instanceRef.current.setViewState((viewState) =>
      viewState.set("formDesignMode", !viewState?.formDesignMode)
    );
  }, []);

  return {
    containerRef,
    instance: instanceRef.current,
    isLoaded,
    selectedAnnotations,
    currentMode,
    isFormCreatorMode: currentMode,
    activeOverlays: overlayManagerRef.current?.activeOverlays?.size || 0,
    // API methods
    createWidget,
    toggleFormCreator,
  };
};

// Widget Overlay Manager Class
class WidgetOverlayManager {
  constructor(instance, CustomWidgetComponent) {
    this.instance = instance;
    this.CustomWidgetComponent = CustomWidgetComponent;
    this.activeOverlays = new Map();
    this.overlayStates = new Map();
    this.isFormCreatorMode = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for view state changes
    this.instance.addEventListener("viewState.change", (viewState, previousViewState) => {
      const newMode = viewState.formDesignMode;
      const previousMode = previousViewState?.formDesignMode;

      if (newMode !== previousMode) {
        this.isFormCreatorMode = newMode;
        this.handleModeChange();
      }
    });

    // Listen for widget annotation events
    this.instance.addEventListener("annotations.create", (annotations) => {
      if (this.isFormCreatorMode) {
        annotations.forEach((annotation) => {
          if (annotation instanceof window.NutrientViewer.Annotations.WidgetAnnotation) {
            setTimeout(() => this.createOverlay(annotation), 100);
          }
        });
      }
    });

    this.instance.addEventListener("annotations.update", (annotations) => {
      if (this.isFormCreatorMode) {
        annotations.forEach((annotation) => {
          if (annotation instanceof window.NutrientViewer.Annotations.WidgetAnnotation) {
            this.updateOverlay(annotation);
          }
        });
      }
    });

    this.instance.addEventListener("annotations.delete", (annotations) => {
      annotations.forEach((annotation) => {
        if (annotation instanceof window.NutrientViewer.Annotations.WidgetAnnotation) {
          this.removeOverlay(annotation.id);
        }
      });
    });
  }

  handleModeChange() {
    if (this.isFormCreatorMode) {
      this.createAllOverlays();
    } else {
      this.removeAllOverlays();
    }
  }

  async createAllOverlays() {
    for (let pageIndex = 0; pageIndex < this.instance.totalPageCount; pageIndex++) {
      try {
        const annotations = await this.instance.getAnnotations(pageIndex);
        annotations.forEach((annotation) => {
          if (annotation instanceof window.NutrientViewer.Annotations.WidgetAnnotation) {
            this.createOverlay(annotation);
          }
        });
      } catch (error) {
        console.error(`Error loading annotations for page ${pageIndex}:`, error);
      }
    }
  }

  removeAllOverlays() {
    this.activeOverlays.forEach((overlayId) => {
      this.instance.removeCustomOverlayItem(overlayId);
    });
    this.activeOverlays.clear();
  }

  createOverlay(annotation) {
    const overlayId = `widget-overlay-${annotation.id}`;

    if (this.activeOverlays.has(annotation.id)) {
      return;
    }

    const storedState = this.overlayStates.get(annotation.id);
    const boundingBox = storedState?.boundingBox || annotation.boundingBox;
    const customData = storedState?.customData || annotation.customData || {};

    // Create the overlay element using custom component
    const overlayElement = this.createOverlayElement(annotation, boundingBox, customData);

    const customOverlayItem = new window.NutrientViewer.CustomOverlayItem({
      id: overlayId,
      node: overlayElement,
      pageIndex: annotation.pageIndex,
      position: new window.NutrientViewer.Geometry.Point({
        x: boundingBox.left,
        y: boundingBox.top,
      }),
      onAppear() {
        console.log(`Widget overlay ${annotation.id} appeared`);
      },
      onDisappear() {
        console.log(`Widget overlay ${annotation.id} disappeared`);
      },
    });

    this.instance.setCustomOverlayItem(customOverlayItem);
    this.activeOverlays.set(annotation.id, overlayId);

    // Store references for drag functionality
    overlayElement.widgetAnnotation = annotation;
    overlayElement.overlayId = overlayId;
    overlayElement.customOverlayItem = customOverlayItem;
  }

  createOverlayElement(annotation, boundingBox, customData) {
    const container = document.createElement("div");
    container.setAttribute("data-overlay-id", `widget-overlay-${annotation.id}`);
    container.className = "widget-overlay";

    // Set container styles for positioning and sizing
    container.style.cssText = `
      width: ${boundingBox.width}px;
      height: ${boundingBox.height}px;
    `;

    // Add type indicator
    const typeIndicator = document.createElement("div");
    typeIndicator.className = "widget-type-indicator";
    const widgetType = customData.type || "signature";

    // Comprehensive type icon mapping
    const typeIcons = {
      signature: "📝",
      initials: "✍️",
      name: "👤",
      text: "📄",
      date: "📅",
      email: "📧",
      checkbox: "☑️",
      radio: "🔘",
      listbox: "📋",
      combobox: "🔽"
    };

    typeIndicator.textContent = typeIcons[widgetType] || "📄";
    container.appendChild(typeIndicator);

    // Add resize handles
    const resizeHandles = ["nw", "ne", "sw", "se"];
    resizeHandles.forEach(direction => {
      const handle = document.createElement("div");
      handle.className = `resize-handle ${direction}`;
      container.appendChild(handle);
    });

    // Create React component mount point
    const mountPoint = document.createElement("div");
    mountPoint.style.cssText = "width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;";
    container.appendChild(mountPoint);

    // Render custom component if provided
    if (this.CustomWidgetComponent && window.ReactDOM) {
      const props = {
        annotation,
        customData,
        boundingBox,
        onUpdate: (updates) => this.handleWidgetUpdate(annotation, updates),
        onDelete: () => this.handleWidgetDelete(annotation),
      };

      window.ReactDOM.render(
        window.React.createElement(this.CustomWidgetComponent, props),
        mountPoint
      );
    } else {
      // Fallback to default widget display
      this.renderDefaultWidget(mountPoint, customData);
    }

    // Add drag and resize functionality to the container, not the inner components
    this.setupDragAndResize(container, annotation);

    return container;
  }

  renderDefaultWidget(container, customData) {
    container.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background-color: #f8f9fa;
        color: #333;
        border: 2px solid #007bff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">
        ${customData.text || 'Widget'}
      </div>
    `;
  }

  handleWidgetUpdate(annotation, updates) {
    try {
      const updatedAnnotation = annotation.set("customData", {
        ...annotation.customData,
        ...updates,
      });

      const changes = new window.NutrientViewer.Immutable.List([updatedAnnotation]);
      this.instance.update(changes);
    } catch (error) {
      console.error("Error updating widget:", error);
    }
  }

  handleWidgetDelete(annotation) {
    try {
      const changes = new window.NutrientViewer.Immutable.List([annotation]);
      this.instance.delete(changes);
    } catch (error) {
      console.error("Error deleting widget:", error);
    }
  }

  setupDragAndResize(element, annotation) {
    let isDragging = false;
    let isResizing = false;
    let dragStarted = false;
    let resizeHandle = null;
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    let initialMouseX, initialMouseY;
    const DRAG_THRESHOLD = 3; // pixels

    // Single mouse down handler
    const handleMouseDown = (e) => {
      // Don't drag if clicking on interactive elements inside the widget
      if (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'BUTTON' ||
          e.target.tagName === 'SELECT' ||
          e.target.contentEditable === 'true' ||
          e.target.closest('.widget-controls')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (e.target.classList.contains("resize-handle")) {
        // Start resizing
        isResizing = true;
        resizeHandle = e.target.className
          .split(" ")
          .find((cls) => ["nw", "ne", "sw", "se"].includes(cls));
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(getComputedStyle(element).width);
        startHeight = parseInt(getComputedStyle(element).height);
        startLeft = element.offsetLeft;
        startTop = element.offsetTop;
      } else {
        // Prepare for potential dragging
        isDragging = false; // Don't start dragging immediately
        dragStarted = false;
        const rect = element.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Mouse move handler - updating CustomOverlayItem position
    const handleMouseMove = (e) => {
      // Check if we should start dragging (only if we're not already dragging or resizing)
      if (!isDragging && !isResizing && !dragStarted) {
        const deltaX = Math.abs(e.clientX - initialMouseX);
        const deltaY = Math.abs(e.clientY - initialMouseY);

        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          isDragging = true;
          dragStarted = true;
          element.classList.add("dragging");
        }
      }

      if (isDragging) {
        // Calculate the new position in page coordinates
        const rect = element.getBoundingClientRect();
        const proposedPosition = this.instance.transformContentClientToPageSpace(
          new window.NutrientViewer.Geometry.Point({
            x: e.clientX - startX,
            y: e.clientY - startY,
          }),
          annotation.pageIndex
        );

        // Create proposed bounding box for collision detection
        const proposedBounds = new window.NutrientViewer.Geometry.Rect({
          left: proposedPosition.x,
          top: proposedPosition.y,
          width: annotation.boundingBox.width,
          height: annotation.boundingBox.height
        });

        // Check for collisions and page boundaries
        this.validatePosition(proposedBounds, annotation.pageIndex, annotation.id).then(validPosition => {
          if (validPosition) {
            // Update the CustomOverlayItem position
            if (element.customOverlayItem) {
              const updatedOverlay = element.customOverlayItem.set("position", proposedPosition);
              this.instance.setCustomOverlayItem(updatedOverlay);
            }
          }
        });
      } else if (isResizing) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;

        // Minimum size constraints
        const minWidth = 40;
        const minHeight = 20;

        switch (resizeHandle) {
          case "se":
            newWidth = Math.max(startWidth + deltaX, minWidth);
            newHeight = Math.max(startHeight + deltaY, minHeight);
            break;
          case "sw":
            newWidth = Math.max(startWidth - deltaX, minWidth);
            newHeight = Math.max(startHeight + deltaY, minHeight);
            newLeft = startLeft + (startWidth - newWidth);
            break;
          case "ne":
            newWidth = Math.max(startWidth + deltaX, minWidth);
            newHeight = Math.max(startHeight - deltaY, minHeight);
            newTop = startTop + (startHeight - newHeight);
            break;
          case "nw":
            newWidth = Math.max(startWidth - deltaX, minWidth);
            newHeight = Math.max(startHeight - deltaY, minHeight);
            newLeft = startLeft + (startWidth - newWidth);
            newTop = startTop + (startHeight - newHeight);
            break;
        }

        // Create proposed bounds in page coordinates based on current annotation position
        const currentBounds = annotation.boundingBox;
        const currentPosition = element.customOverlayItem.position;

        // Calculate the scale factors between overlay element and annotation bounds
        const scaleX = currentBounds.width / startWidth;
        const scaleY = currentBounds.height / startHeight;

        // Calculate new page bounds based on resize
        let proposedPageBounds;
        switch (resizeHandle) {
          case "se":
            proposedPageBounds = new window.NutrientViewer.Geometry.Rect({
              left: currentPosition.x,
              top: currentPosition.y,
              width: (newWidth * scaleX),
              height: (newHeight * scaleY)
            });
            break;
          case "sw":
            proposedPageBounds = new window.NutrientViewer.Geometry.Rect({
              left: currentPosition.x - ((newWidth - startWidth) * scaleX),
              top: currentPosition.y,
              width: (newWidth * scaleX),
              height: (newHeight * scaleY)
            });
            break;
          case "ne":
            proposedPageBounds = new window.NutrientViewer.Geometry.Rect({
              left: currentPosition.x,
              top: currentPosition.y - ((newHeight - startHeight) * scaleY),
              width: (newWidth * scaleX),
              height: (newHeight * scaleY)
            });
            break;
          case "nw":
            proposedPageBounds = new window.NutrientViewer.Geometry.Rect({
              left: currentPosition.x - ((newWidth - startWidth) * scaleX),
              top: currentPosition.y - ((newHeight - startHeight) * scaleY),
              width: (newWidth * scaleX),
              height: (newHeight * scaleY)
            });
            break;
        }

        // Validate the proposed resize
        this.validatePosition(proposedPageBounds, annotation.pageIndex, annotation.id).then(validPosition => {
          if (validPosition) {
            element.style.width = newWidth + "px";
            element.style.height = newHeight + "px";
            element.style.left = newLeft + "px";
            element.style.top = newTop + "px";
          }
          // If invalid, don't update the element styles - resize stops
        });
      }
    };

    // Mouse up handler
    const handleMouseUp = (e) => {
      if (isDragging && dragStarted) {
        requestAnimationFrame(() => {
          this.updateWidgetFromOverlay(element, annotation, "drag");
        });
        element.classList.remove("dragging");
      }

      if (isResizing) {
        requestAnimationFrame(() => {
          this.updateWidgetFromOverlay(element, annotation, "resize");
        });
      }

      // Clean up
      isDragging = false;
      isResizing = false;
      dragStarted = false;
      resizeHandle = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    // Attach event listener
    element.addEventListener("mousedown", handleMouseDown);

    // Store cleanup function
    element._cleanupDragResize = () => {
      element.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }

  updateWidgetFromOverlay(element, annotation, operationType = "both") {
    try {
      // Get current overlay position and size
      const rect = element.getBoundingClientRect();

      // Transform overlay coordinates to PDF page coordinates
      const boundingBox = this.instance.transformContentClientToPageSpace(
        new window.NutrientViewer.Geometry.Rect({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }),
        annotation.pageIndex
      );

      let newBounds;

      if (operationType === "drag") {
        // Only update position, keep original size
        const originalBounds = annotation.boundingBox;
        newBounds = new window.NutrientViewer.Geometry.Rect({
          left: boundingBox.left,
          top: boundingBox.top,
          width: originalBounds.width,
          height: originalBounds.height,
        });
      } else {
        // Update both position and size (for resize or initial creation)
        newBounds = boundingBox;
      }

      // Store the overlay state
      this.overlayStates.set(annotation.id, {
        boundingBox: newBounds,
        customData: annotation.customData,
      });

      // Update the annotation
      const updatedAnnotation = annotation.set("boundingBox", newBounds);
      const changes = new window.NutrientViewer.Immutable.List([updatedAnnotation]);

      this.instance.update(changes).catch((error) => {
        console.error("Error updating widget bounds:", error);
      });
    } catch (error) {
      console.error("Error updating widget from overlay:", error);
    }
  }

  updateOverlay(annotation) {
    if (this.activeOverlays.has(annotation.id)) {
      this.removeOverlay(annotation.id);
      setTimeout(() => this.createOverlay(annotation), 10);
    }
  }

  removeOverlay(annotationId) {
    const overlayId = this.activeOverlays.get(annotationId);
    if (overlayId) {
      const overlayElement = document.querySelector(`[data-overlay-id="${overlayId}"]`);
      if (overlayElement && overlayElement._cleanupDragResize) {
        overlayElement._cleanupDragResize();
      }

      this.instance.removeCustomOverlayItem(overlayId);
      this.activeOverlays.delete(annotationId);
      this.overlayStates.delete(annotationId);
    }
  }

  async validatePosition(proposedBounds, pageIndex, excludeAnnotationId = null) {
    // Check page boundaries first
    const pageInfo = this.instance.pageInfoForIndex(pageIndex);
    if (!pageInfo) return false;

    const pageBounds = new window.NutrientViewer.Geometry.Rect({
      left: 0,
      top: 0,
      width: pageInfo.width,
      height: pageInfo.height
    });

    // Check if widget would go outside page boundaries
    if (proposedBounds.left < 0 ||
        proposedBounds.top < 0 ||
        proposedBounds.left + proposedBounds.width > pageBounds.width ||
        proposedBounds.top + proposedBounds.height > pageBounds.height) {
      return false;
    }

    // Check for overlaps with other widgets
    return await this.checkForOverlaps(proposedBounds, pageIndex, excludeAnnotationId);
  }

  async checkForOverlaps(proposedBounds, pageIndex, excludeAnnotationId = null) {
    try {
      const annotations = await this.instance.getAnnotations(pageIndex);

      for (const annotation of annotations) {
        // Skip the annotation we're currently dragging
        if (annotation.id === excludeAnnotationId) continue;

        // Only check widget annotations
        if (annotation instanceof window.NutrientViewer.Annotations.WidgetAnnotation) {
          const annotationBounds = annotation.boundingBox;

          // Check for intersection with gap buffer
          if (this.boundsIntersect(proposedBounds, annotationBounds, 8)) {
            return false; // Overlap detected (including gap)
          }
        }
      }

      return true; // No overlaps found
    } catch (error) {
      console.error('Error checking for overlaps:', error);
      return true; // Allow movement if we can't check
    }
  }

  boundsIntersect(bounds1, bounds2, gap = 8) {
    // Add gap buffer to prevent widgets from touching
    return !(bounds1.left + bounds1.width + gap <= bounds2.left ||
             bounds2.left + bounds2.width + gap <= bounds1.left ||
             bounds1.top + bounds1.height + gap <= bounds2.top ||
             bounds2.top + bounds2.height + gap <= bounds1.top);
  }

  destroy() {
    this.removeAllOverlays();
    this.overlayStates.clear();
  }
}
