import {
  ActionButton,
  ActionGroup,
  Box,
  FrameProvider,
  I18nProvider,
  ImageGallery,
  Text,
  ThemeProvider,
} from "@baseline-ui/core";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentPdfIcon,
  DownloadIcon,
  DuplicateIcon,
  PageAddIcon,
  PageRemoveIcon,
  RotateClockwiseIcon,
  RotateCounterClockwiseIcon,
} from "@baseline-ui/icons/24";
import { themes } from "@baseline-ui/tokens";
import type { DocumentOperations, Instance } from "@nutrient-sdk/viewer";
import NutrientViewer from "@nutrient-sdk/viewer";
import { useCallback, useEffect, useState } from "react";

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
  | DocumentOperations.MovePagesBeforeOperation;

const DocumentEditor = (props: Props) => {
  const { instance } = props;
  const [draftPages, setDraftPages] = useState<DraftPageData[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
    new Set(),
  );
  const [operationQueue, setOperationQueue] = useState<DocumentOperation[]>([]);

  const populatePageData = useCallback(async () => {
    const totalPages = instance.totalPageCount;
    const pagesData = [];

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      const pageInfo = instance.pageInfoForIndex(pageIndex);

      if (!pageInfo) {
        continue;
      }
      const src = await instance.renderPageAsImageURL(
        { width: 400 },
        pageIndex,
      );
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
  }, [instance]);

  useEffect(() => {
    populatePageData();
  }, [populatePageData]);

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
        const result = [...current];
        result.splice(afterIndex + 1, 0, newPage);
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
        const result = [...current];
        for (const pageIndex of selectedPageIndexes) {
          const originalPage = result.find((p) => p.pageIndex === pageIndex);
          if (originalPage) {
            const duplicatedPage: DraftPageData = {
              ...originalPage,
              id: `temp-dup-${Date.now()}-${pageIndex}`,
              label: `${originalPage.label} (copy)`,
              alt: `${originalPage.alt} (copy)`,
            };
            result.splice(pageIndex + 1, 0, duplicatedPage);
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
        const result = [...current];

        const pagesToMove = selectedPageIndexes
          .slice()
          .reverse()
          .map((index) => result.splice(index, 1)[0]);

        // Insert all pages after maxIndex position (adjust for removed pages)
        const insertPosition = maxIndex - selectedPageIndexes.length + 2;
        result.splice(insertPosition, 0, ...pagesToMove.reverse());

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
        const result = [...current];

        const pagesToMove = selectedPageIndexes
          .slice()
          .reverse()
          .map((index) => result.splice(index, 1)[0]);

        // Insert all pages before minIndex position (adjust for removed pages)
        const insertPosition = minIndex - 1;
        result.splice(insertPosition, 0, ...pagesToMove.reverse());

        return updatePageIndexes(result);
      });
    } else if (operation === "export-selected-pages") {
      await handleExportSelectedPages();
      return; // Don't queue this operation
    }

    if (operationData) {
      setOperationQueue((prev) => [...prev, operationData]);
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
      // Render a white blank page
      return (
        <div
          style={{
            backgroundColor: "white",
            width: "100%",
            height: "100%",
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

    return (
      <img src={draftPage.src} alt={draftPage.alt} style={style} width="100%" />
    );
  };

  const selectionText = selectedKeys.size ? (
    <Text>{selectedKeys.size} page(s) selected</Text>
  ) : (
    <Text>No pages selected</Text>
  );

  const pendingOperationsText = operationQueue.length > 0 && (
    <Text>{operationQueue.length} pending operation(s)</Text>
  );

  const operations = (
    <ActionGroup
      isDisabled={selectedKeys.size === 0}
      items={[
        {
          id: "rotate-clockwise",
          label: "Rotate Clockwise",
          icon: RotateClockwiseIcon,
        },
        {
          id: "rotate-counterclockwise",
          label: "Rotate Counterclockwise",
          icon: RotateCounterClockwiseIcon,
        },
        {
          id: "remove-pages",
          label: "Remove Pages",
          icon: PageRemoveIcon,
        },
        {
          id: "add-page",
          label: "Add Page",
          icon: PageAddIcon,
        },
        {
          id: "duplicate-page",
          label: "Duplicate Page",
          icon: DuplicateIcon,
        },
        {
          id: "move-left",
          label: "Move Left",
          icon: ArrowLeftIcon,
        },
        {
          id: "move-right",
          label: "Move Right",
          icon: ArrowRightIcon,
        },
        {
          id: "export-selected-pages",
          label: "Export Selected Pages",
          icon: DownloadIcon,
        },
      ]}
      onAction={queueDocumentOperation}
    />
  );

  return (
    <ThemeProvider theme={themes.base.light}>
      <FrameProvider>
        <I18nProvider shouldLogMissingMessages={false} locale="en-US">
          <Box
            padding="lg"
            alignItems="center"
            display="flex"
            flexDirection="column"
            gap="lg"
          >
            {selectionText}
            {pendingOperationsText}
            {operations}
            <ImageGallery
              aria-label="Document editor sidebar"
              items={draftPages}
              imageWidth="md"
              selectionMode="multiple"
              selectedKeys={selectedKeys}
              onSelectionChange={(keys) =>
                setSelectedKeys(
                  keys === "all"
                    ? new Set(draftPages.map((page) => page.id))
                    : keys,
                )
              }
              renderImage={renderImage}
              imageDimensions={(item) => {
                const draftPage = draftPages.find(
                  (page) => page.id === item.id,
                );
                if (!draftPage) {
                  return { width: 180, height: 250 };
                }

                // Calculate total rotation (document rotation + draft rotation)
                const totalRotation =
                  draftPage.rotation + (draftPage.draftRotation || 0);

                // For 90 or 270 degree rotations, swap dimensions
                const normalizedRotation = totalRotation % 360;
                const isRotated90or270 =
                  normalizedRotation === 90 || normalizedRotation === 270;

                if (isRotated90or270) {
                  return { width: 250, height: 180 };
                }

                return { width: 180, height: 250 };
              }}
            />
            <Box gap="md" display="flex">
              <ActionButton
                label="Save"
                onPress={handleSave}
                isDisabled={operationQueue.length === 0}
              />
              <ActionButton
                label="Save as"
                iconStart={DocumentPdfIcon}
                variant="secondary"
                onPress={handleExportPDF}
              />
            </Box>
          </Box>
        </I18nProvider>
      </FrameProvider>
    </ThemeProvider>
  );
};

export default DocumentEditor;
