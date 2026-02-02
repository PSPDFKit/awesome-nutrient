import {
  ActionButton,
  ActionIconButton,
  Box,
  FrameProvider,
  I18nProvider,
  ImageGallery,
  Separator,
  TagGroup,
  Text,
  ThemeProvider,
  Toolbar,
} from "@baseline-ui/core";
import {
  PageAddIcon,
  PageDuplicateIcon,
  PageMoveLeftIcon,
  PageMoveRightIcon,
  PageRemoveIcon,
  PagesInsertAltIcon,
  PagesNewFromSelectionIcon,
  RotateClockwiseIcon,
  RotateCounterClockwiseIcon,
} from "@baseline-ui/icons/24";
import { sprinkles, themes, themeVars } from "@baseline-ui/tokens";
import type { DocumentOperations, Instance } from "@nutrient-sdk/viewer";
import NutrientViewer from "@nutrient-sdk/viewer";
import { useCallback, useEffect, useRef, useState } from "react";

// Layout constants
const THUMBNAIL_WIDTH = 140;
const THUMBNAIL_HEIGHT = 200;
const THUMBNAIL_DIMENSION_WIDTH = 102;
const THUMBNAIL_DIMENSION_HEIGHT = 136;
const SIDEBAR_MIN_WIDTH = 320;

interface Props {
  instance: Instance;
}

interface DraftPageData {
  id: string;
  label: string;
  alt: string;
  pageIndex: number;
  src: string;
  rotation: number;

  draftRotation?: number; // Additional rotation applied in draft state
  isNew?: boolean;
}

type DocumentOperation =
  | DocumentOperations.RotatePagesOperation
  | DocumentOperations.RemovePagesOperation
  | DocumentOperations.AddPageAfterOperation
  | DocumentOperations.DuplicatePagesOperation
  | DocumentOperations.MovePagesAfterOperation
  | DocumentOperations.MovePagesBeforeOperation
  | DocumentOperations.ImportDocumentAfterOperation;

const DocumentEditor = (props: Props) => {
  const { instance } = props;
  const [draftPages, setDraftPages] = useState<DraftPageData[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
    new Set(),
  );
  const [operationQueue, setOperationQueue] = useState<DocumentOperation[]>([]);
  const [isUnsavedTagDismissed, setIsUnsavedTagDismissed] = useState(false);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const cleanupBlobUrls = useCallback(() => {
    blobUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    blobUrlsRef.current.clear();
  }, []);

  const populatePageData = useCallback(async () => {
    const totalPages = instance.totalPageCount;
    const pagesData = [];

    // Revoke old URLs before creating new ones
    cleanupBlobUrls();

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      const pageInfo = instance.pageInfoForIndex(pageIndex);

      if (!pageInfo) {
        continue;
      }
      const src = await instance.renderPageAsImageURL(
        { width: 400 },
        pageIndex,
      );

      // Track blob URL for cleanup
      if (src.startsWith("blob:")) {
        blobUrlsRef.current.add(src);
      }

      pagesData.push({
        id: pageInfo.label,
        label: pageInfo.label,
        alt: pageInfo.label,
        pageIndex: pageInfo.index,
        src,
        rotation: pageInfo.rotation || 0,
      });
    }

    setDraftPages(pagesData);
  }, [instance, cleanupBlobUrls]);

  useEffect(() => {
    populatePageData();
  }, [populatePageData]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, [cleanupBlobUrls]);

  const getPageIndexesFromSelectedKeys = (): number[] => {
    return [...selectedKeys]
      .map((key) => {
        const page = draftPages.find((p) => p.id === key);
        return page?.pageIndex;
      })
      .filter((index): index is number => index !== undefined);
  };

  const updatePageIndexes = (pages: DraftPageData[]): DraftPageData[] => {
    return pages.map((page, index) => ({
      ...page,
      pageIndex: index,
    }));
  };

  const queueDocumentOperation = async (operation: string | number) => {
    let operationData: DocumentOperation | undefined;

    if (operation === "rotate-clockwise") {
      operationData = {
        type: "rotatePages",
        pageIndexes: getPageIndexesFromSelectedKeys(),
        rotateBy: 90,
      };

      setDraftPages((current) =>
        current.map((page) =>
          selectedKeys.has(page.id)
            ? { ...page, draftRotation: (page.draftRotation || 0) + 90 }
            : page,
        ),
      );
    } else if (operation === "rotate-counterclockwise") {
      operationData = {
        type: "rotatePages",
        pageIndexes: getPageIndexesFromSelectedKeys(),
        rotateBy: 270,
      };

      setDraftPages((current) =>
        current.map((page) =>
          selectedKeys.has(page.id)
            ? { ...page, draftRotation: (page.draftRotation || 0) + 270 }
            : page,
        ),
      );
    } else if (operation === "remove-pages") {
      operationData = {
        type: "removePages",
        pageIndexes: getPageIndexesFromSelectedKeys(),
      };

      setDraftPages((current) => {
        const result = current.filter((page) => !selectedKeys.has(page.id));
        return updatePageIndexes(result);
      });
    } else if (operation === "add-page") {
      const selectedPageIndexes = getPageIndexesFromSelectedKeys();
      const afterIndex = selectedPageIndexes[0];
      operationData = {
        type: "addPage",
        afterPageIndex: afterIndex,
        backgroundColor: new NutrientViewer.Color({ r: 255, g: 255, b: 255 }),
        pageHeight: 400,
        pageWidth: 300,
        rotateBy: 0,
      };

      setDraftPages((current) => {
        const newPage: DraftPageData = {
          id: `temp-${Date.now()}`,
          label: "New Page",
          alt: "New blank page",
          pageIndex: afterIndex + 1,
          src: "",
          rotation: 0,
          isNew: true,
        };
        const result = [
          ...current.slice(0, afterIndex + 1),
          newPage,
          ...current.slice(afterIndex + 1),
        ];
        return updatePageIndexes(result);
      });
    } else if (operation === "duplicate-page") {
      const selectedPageIndexes = getPageIndexesFromSelectedKeys().sort(
        (a, b) => b - a,
      );

      operationData = {
        type: "duplicatePages",
        pageIndexes: selectedPageIndexes,
      };

      setDraftPages((current) => {
        let result = [...current];
        for (const pageIndex of selectedPageIndexes) {
          const originalPage = result.find((p) => p.pageIndex === pageIndex);
          if (originalPage) {
            const duplicatedPage: DraftPageData = {
              ...originalPage,
              id: `temp-dup-${Date.now()}-${pageIndex}`,
              label: `${originalPage.label} (copy)`,
              alt: `${originalPage.alt} (copy)`,
            };
            result = [
              ...result.slice(0, pageIndex + 1),
              duplicatedPage,
              ...result.slice(pageIndex + 1),
            ];
          }
        }

        return updatePageIndexes(result);
      });
    } else if (operation === "move-right") {
      const selectedPageIndexes = getPageIndexesFromSelectedKeys().sort(
        (a, b) => a - b,
      );

      // Can't move right if the rightmost selected page is already at the end
      const maxIndex = Math.max(...selectedPageIndexes);
      if (maxIndex >= draftPages.length - 1) {
        return;
      }

      operationData = {
        type: "movePages",
        pageIndexes: selectedPageIndexes,
        afterPageIndex: maxIndex + 1,
      };

      setDraftPages((current) => {
        const pagesToMove = selectedPageIndexes.map((index) => current[index]);
        const remaining = current.filter(
          (_, index) => !selectedPageIndexes.includes(index),
        );

        // Insert all pages after maxIndex position (adjust for removed pages)
        const insertPosition = maxIndex - selectedPageIndexes.length + 2;
        const result = [
          ...remaining.slice(0, insertPosition),
          ...pagesToMove,
          ...remaining.slice(insertPosition),
        ];

        return updatePageIndexes(result);
      });
    } else if (operation === "move-left") {
      const selectedPageIndexes = getPageIndexesFromSelectedKeys().sort(
        (a, b) => a - b,
      );

      // Can't move left if the leftmost selected page is already at the start
      const minIndex = Math.min(...selectedPageIndexes);
      if (minIndex === 0) {
        return;
      }

      operationData = {
        type: "movePages",
        pageIndexes: selectedPageIndexes,
        beforePageIndex: minIndex - 1,
      };

      setDraftPages((current) => {
        const pagesToMove = selectedPageIndexes.map((index) => current[index]);
        const remaining = current.filter(
          (_, index) => !selectedPageIndexes.includes(index),
        );

        // Insert all pages before minIndex position (adjust for removed pages)
        const insertPosition = minIndex - 1;
        const result = [
          ...remaining.slice(0, insertPosition),
          ...pagesToMove,
          ...remaining.slice(insertPosition),
        ];

        return updatePageIndexes(result);
      });
    } else if (operation === "import-document") {
      // Create file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/pdf";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const selectedPageIndexes = getPageIndexesFromSelectedKeys();
        const afterIndex =
          selectedPageIndexes.length > 0
            ? Math.max(...selectedPageIndexes)
            : draftPages.length - 1;

        const importOperation: DocumentOperations.ImportDocumentAfterOperation =
          {
            type: "importDocument",
            afterPageIndex: afterIndex,
            document: file,
            treatImportedDocumentAsOnePage: true,
          };

        // Add a placeholder draft page for the imported document
        setDraftPages((current) => {
          const newPage: DraftPageData = {
            id: `temp-import-${Date.now()}`,
            label: file.name,
            alt: `Imported: ${file.name}`,
            pageIndex: afterIndex + 1,
            src: "", // Will be populated after save
            rotation: 0,
            isNew: true,
          };
          const result = [
            ...current.slice(0, afterIndex + 1),
            newPage,
            ...current.slice(afterIndex + 1),
          ];
          return updatePageIndexes(result);
        });

        setOperationQueue((prev) => [...prev, importOperation]);
        setIsUnsavedTagDismissed(false);
      };

      input.click();
      return; // Don't queue yet, will be queued in onchange
    } else if (operation === "export-selected-pages") {
      await handleExportSelectedPages();
      return; // Don't queue this operation
    }

    if (operationData) {
      setOperationQueue((prev) => [...prev, operationData]);
      setIsUnsavedTagDismissed(false);
    }
  };

  const handleSave = async () => {
    if (operationQueue.length === 0) {
      return;
    }

    await instance.applyOperations(operationQueue);
    await populatePageData();

    setOperationQueue([]);
    setSelectedKeys(new Set());
    setIsUnsavedTagDismissed(false);
  };

  const handleExportPDF = async () => {
    // Export the PDF
    const arrayBuffer = await instance.exportPDFWithOperations(operationQueue);
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "edited-document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL
    URL.revokeObjectURL(url);
    setSelectedKeys(new Set());
  };

  const handleExportSelectedPages = async () => {
    // Convert selected keys to page indexes
    const selectedPageIndexes = getPageIndexesFromSelectedKeys();

    // Create KeepPages operation for export
    const keepPagesOperation = {
      type: "keepPages" as const,
      pageIndexes: selectedPageIndexes,
    };

    // Export PDF with only selected pages
    const arrayBuffer = await instance.exportPDFWithOperations([
      ...operationQueue,
      keepPagesOperation,
    ]);
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Download
    const link = document.createElement("a");
    link.href = url;
    link.download = `selected-pages-${selectedPageIndexes.length}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
    setSelectedKeys(new Set());
  };

  const renderImage = (item: {
    id: string;
    data?: { alt?: string; src?: string };
  }) => {
    // Find the corresponding draft page
    const draftPage = draftPages.find((page) => page.id === item.id);

    if (!draftPage) {
      return <div>Error: Page not found</div>;
    }

    if (draftPage.isNew) {
      // Render a white blank page with consistent dimensions
      return (
        <div
          style={{
            backgroundColor: "white",
            width: THUMBNAIL_WIDTH,
            height: THUMBNAIL_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e5e7eb",
          }}
        >
          <Text>New Page</Text>
        </div>
      );
    }

    // Apply only draft rotation (the fetched image already has the document rotation applied)
    const style = draftPage.draftRotation
      ? { transform: `rotate(${draftPage.draftRotation}deg)` }
      : undefined;

    // Ensure consistent container width regardless of rotation
    // The image will be rotated inside, but container maintains fixed width
    const containerStyle: React.CSSProperties = {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    };

    return (
      <div style={containerStyle}>
        <img
          src={draftPage.src}
          alt={draftPage.alt}
          style={{
            ...style,
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    );
  };

  const isOperationsDisabled = selectedKeys.size === 0;

  return (
    <ThemeProvider theme={themes.base.light}>
      <FrameProvider>
        <I18nProvider shouldLogMissingMessages={false} locale="en-US">
          <Box
            display="flex"
            flexDirection="column"
            width="full"
            flex={1}
            className="document-editor-container"
            style={{
              height: "calc(100vh - 48px)",
              minWidth: SIDEBAR_MIN_WIDTH,
            }}
          >
            <Box display="flex" flexDirection="column">
              <div className="document-editor-header">
                <Text
                  type="title"
                  size="sm"
                  elementType="h2"
                  className={sprinkles({
                    paddingX: "lg",
                    paddingY: "md",
                    display: "flex",
                    alignItems: "center",
                  })}
                  style={{
                    minHeight: 48,
                  }}
                >
                  Organize Pages
                </Text>

                {selectedKeys.size > 0 && (
                  <Box
                    display="flex"
                    gap="md"
                    alignItems="center"
                    style={{
                      placeSelf: "center",
                    }}
                  >
                    <TagGroup
                      variant="neutral"
                      items={[
                        {
                          id: "selected-pages",
                          label:
                            selectedKeys.size > 1
                              ? `${selectedKeys.size} Pages selected`
                              : `${selectedKeys.size} Page selected`,
                        },
                      ]}
                      aria-label="Selected pages count"
                    />
                  </Box>
                )}
              </div>
              <Separator />
              <Box
                display="flex"
                gap="xs"
                alignItems="center"
                flexGrow={0}
                flexShrink={0}
                width="full"
              >
                <Toolbar
                  isCollapsible
                  style={{
                    width: "100%",
                  }}
                >
                  <ActionIconButton
                    icon={RotateCounterClockwiseIcon}
                    variant="toolbar"
                    aria-label="Rotate Left"
                    tooltip
                    size="lg"
                    isDisabled={isOperationsDisabled}
                    onPress={() =>
                      queueDocumentOperation("rotate-counterclockwise")
                    }
                  />
                  <ActionIconButton
                    icon={RotateClockwiseIcon}
                    variant="toolbar"
                    aria-label="Rotate Right"
                    tooltip
                    size="lg"
                    isDisabled={isOperationsDisabled}
                    onPress={() => queueDocumentOperation("rotate-clockwise")}
                  />
                  <ActionIconButton
                    icon={PageRemoveIcon}
                    variant="toolbar"
                    aria-label="Delete Page"
                    tooltip
                    size="lg"
                    isDisabled={isOperationsDisabled}
                    onPress={() => queueDocumentOperation("remove-pages")}
                  />
                  <ActionIconButton
                    icon={PageAddIcon}
                    variant="toolbar"
                    aria-label="Add Page"
                    tooltip
                    size="lg"
                    isDisabled={isOperationsDisabled}
                    onPress={() => queueDocumentOperation("add-page")}
                  />
                  <ActionIconButton
                    icon={PageDuplicateIcon}
                    variant="toolbar"
                    aria-label="Duplicate Page"
                    tooltip
                    size="lg"
                    isDisabled={isOperationsDisabled}
                    onPress={() => queueDocumentOperation("duplicate-page")}
                  />
                  <ActionIconButton
                    icon={PagesInsertAltIcon}
                    variant="toolbar"
                    aria-label="Import Document"
                    tooltip
                    size="lg"
                    onPress={() => queueDocumentOperation("import-document")}
                  />
                  <ActionIconButton
                    icon={PageMoveLeftIcon}
                    variant="toolbar"
                    aria-label="Move Left"
                    tooltip
                    size="lg"
                    isDisabled={isOperationsDisabled}
                    onPress={() => queueDocumentOperation("move-left")}
                  />
                  <ActionIconButton
                    icon={PageMoveRightIcon}
                    variant="toolbar"
                    aria-label="Move Right"
                    tooltip
                    size="lg"
                    isDisabled={isOperationsDisabled}
                    onPress={() => queueDocumentOperation("move-right")}
                  />
                  <ActionIconButton
                    icon={PagesNewFromSelectionIcon}
                    variant="toolbar"
                    aria-label="Export Selected Pages"
                    tooltip
                    size="lg"
                    isDisabled={isOperationsDisabled}
                    onPress={() =>
                      queueDocumentOperation("export-selected-pages")
                    }
                  />
                </Toolbar>
              </Box>
              <Separator />
            </Box>

            <Box
              flex="1"
              display="flex"
              flexDirection="column"
              position="relative"
              style={{
                overflowY: "auto",
                minHeight: 0,
              }}
            >
              <ImageGallery
                aria-label="Document editor sidebar"
                items={draftPages}
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={(keys) => {
                  setSelectedKeys(
                    keys === "all"
                      ? new Set(draftPages.map((page) => page.id))
                      : keys,
                  );
                }}
                renderImage={renderImage}
                imageDimensions={(item) => {
                  // Find the corresponding draft page
                  const draftPage = draftPages.find(
                    (page) => page.id === item.id,
                  );

                  if (!draftPage) {
                    return {
                      width: THUMBNAIL_DIMENSION_WIDTH,
                      height: THUMBNAIL_DIMENSION_HEIGHT,
                    };
                  }

                  // Calculate total rotation (document rotation + draft rotation)
                  const totalRotation =
                    draftPage.rotation + (draftPage.draftRotation || 0);

                  // For 90 or 270 degree rotations, swap dimensions
                  const normalizedRotation = totalRotation % 360;
                  const isRotated90or270 =
                    normalizedRotation === 90 || normalizedRotation === 270;

                  if (isRotated90or270) {
                    return {
                      width: THUMBNAIL_DIMENSION_HEIGHT,
                      height: THUMBNAIL_DIMENSION_WIDTH,
                    };
                  }

                  return {
                    width: THUMBNAIL_DIMENSION_WIDTH,
                    height: THUMBNAIL_DIMENSION_HEIGHT,
                  };
                }}
                // @ts-expect-error Private API
                layoutTransition={false}
              />

              {operationQueue.length > 0 && !isUnsavedTagDismissed && (
                <TagGroup
                  variant="red"
                  items={[
                    {
                      id: "pending-operations",
                      label: "You have unsaved changes",
                    },
                  ]}
                  onRemove={() => {
                    setIsUnsavedTagDismissed(true);
                  }}
                  aria-label="Unsaved changes indicator"
                  style={{
                    position: "absolute",
                    bottom: themeVars.spacing.xl,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                />
              )}
            </Box>

            <Separator />

            <Box
              padding="lg"
              display="flex"
              gap="lg"
              justifyContent="space-between"
            >
              <ActionButton
                label="Download"
                variant="secondary"
                size="lg"
                onPress={handleExportPDF}
                className={sprinkles({ flex: 1, justifyContent: "center" })}
                style={{ textAlign: "center" }}
              />
              <ActionButton
                label="Save"
                size="lg"
                onPress={handleSave}
                isDisabled={operationQueue.length === 0}
                className={sprinkles({ flex: 1, justifyContent: "center" })}
                style={{ textAlign: "center" }}
              />
            </Box>
          </Box>
        </I18nProvider>
      </FrameProvider>
    </ThemeProvider>
  );
};

export default DocumentEditor;
