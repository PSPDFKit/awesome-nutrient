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
  DocumentPdfIcon,
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

interface PageData {
  id: string;
  label: string;
  alt: string;
  pageIndex: number;
  src: string;
}

type DocumentOperation =
  | DocumentOperations.RotatePagesOperation
  | DocumentOperations.RemovePagesOperation
  | DocumentOperations.AddPageAfterOperation;

const DocumentEditor = (props: Props) => {
  const { instance } = props;
  const [pages, setPages] = useState<PageData[]>([]);
  // TODO: handle for 'all' selection
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
      });
    }

    setPages(pagesData);
  }, [instance]);

  useEffect(() => {
    populatePageData();
  }, [populatePageData]);

  console.log("Pages data:", pages, selectedKeys);

  const queueDocumentOperation = (operation: string | number) => {
    let operationData: DocumentOperation | undefined;

    const parseKey = (key: string | number): number => {
      return typeof key === "string" ? Number.parseInt(key, 10) : key;
    };

    if (operation === "rotate-clockwise") {
      operationData = {
        type: "rotatePages",
        pageIndexes: [...selectedKeys].map((key) => parseKey(key) - 1),
        rotateBy: 90,
      };
    } else if (operation === "rotate-counterclockwise") {
      operationData = {
        type: "rotatePages",
        pageIndexes: [...selectedKeys].map((key) => parseKey(key) - 1),
        rotateBy: 270,
      };
    } else if (operation === "remove-pages") {
      operationData = {
        type: "removePages",
        pageIndexes: [...selectedKeys].map((key) => parseKey(key) - 1),
      };
    } else if (operation === "add-page") {
      operationData = {
        type: "addPage",
        afterPageIndex: parseKey([...selectedKeys][0]) - 1,
        backgroundColor: new NutrientViewer.Color({ r: 255, g: 255, b: 255 }),
        pageHeight: 400,
        pageWidth: 300,
        rotateBy: 0,
      };
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
              items={pages}
              imageWidth="md"
              selectionMode="multiple"
              onSelectionChange={(keys) =>
                setSelectedKeys(keys === "all" ? new Set() : keys)
              }
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
              />
            </Box>
          </Box>
        </I18nProvider>
      </FrameProvider>
    </ThemeProvider>
  );
};

export default DocumentEditor;
