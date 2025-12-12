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
import type { Instance } from "@nutrient-sdk/viewer";
import NutrientViewer from "@nutrient-sdk/viewer";
import { useEffect, useState } from "react";

interface Props {
  instance: Instance;
}

const DocumentEditor = (props: Props) => {
  const { instance } = props;
  const [pages, setPages] = useState([]);
  // TODO: handle for 'all' selection
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const totalPages = instance.totalPageCount;

    async function populatePageData() {
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
    }

    populatePageData();
  }, [instance]);

  console.log("Pages data:", pages, selectedKeys);

  const performDocumentOperation = async (operation) => {
    if (operation === "rotate-clockwise") {
      await instance.applyOperations([
        {
          type: "rotatePages",
          pageIndexes: [...selectedKeys].map(
            (key) => Number.parseInt(key, 10) - 1,
          ),
          rotateBy: 90,
        },
      ]);
    } else if (operation === "rotate-counterclockwise") {
      await instance.applyOperations([
        {
          type: "rotatePages",
          pageIndexes: [...selectedKeys].map(
            (key) => Number.parseInt(key, 10) - 1,
          ),
          rotateBy: 270,
        },
      ]);
    } else if (operation === "remove-pages") {
      await instance.applyOperations([
        {
          type: "removePages",
          pageIndexes: [...selectedKeys].map(
            (key) => Number.parseInt(key, 10) - 1,
          ),
        },
      ]);
    } else if (operation === "add-page") {
      await instance.applyOperations([
        {
          type: "addPage",
          beforePageIndex: Number.parseInt([...selectedKeys][0], 10) - 1,
          backgroundColor: new NutrientViewer.Color({ r: 255, g: 255, b: 255 }),
          pageHeight: 400,
          pageWidth: 300,
          rotateBy: 0,
        },
      ]);
    }

    const totalPages = instance.totalPageCount;

    async function populatePageData() {
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
    }

    populatePageData();
  };

  const selectionText = selectedKeys.size ? (
    <Text>{selectedKeys.size} page(s) selected</Text>
  ) : (
    <Text>No pages selected</Text>
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
      onAction={performDocumentOperation}
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
            {operations}
            <ImageGallery
              aria-label="Document editor sidebar"
              items={pages}
              imageWidth="md"
              selectionMode="multiple"
              onSelectionChange={(keys) => setSelectedKeys(keys)}
            />
            <Box gap="md" display="flex">
              <ActionButton label="Save" />
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
