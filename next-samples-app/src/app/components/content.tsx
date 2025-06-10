"use client";
import React, { useEffect, useState, useCallback } from "react";
import { SearchInput, TreeView } from "@baseline-ui/core";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import slugify from "slugify";

const Content: React.FC = () => {
    const [treeRoot, setTreeRoot] = useState<{
        id: string;
        label: string;
        children: any[];
    }>({ id: "root", label: "Root Items", children: [] });
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [urlMap, setUrlMap] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        async function fetchAndBuildTree() {
            try {
                const res = await fetch(
                    "https://raw.githubusercontent.com/PSPDFKit/awesome-nutrient/main/README.md"
                );
                if (!res.ok) throw new Error("Failed to fetch README");
                const md = await res.text();

                // Parse to MDAST
                const tree = unified().use(remarkParse).parse(md);
                const newUrlMap = new Map<string, string>();
                const rootNode: any = {
                    id: "root",
                    label: "Root Items",
                    children: [],
                };
                const parents: any[] = [];
                parents[0] = rootNode;
                let currentHeading: any = null;
                const MAX_DEPTH = 4;

                // Process headings and lists
                visit(tree, (node) => {
                    if (node.type === "heading") {
                        const txt = node.children
                            .filter((n: any) => n.type === "text")
                            .map((n: any) => n.value)
                            .join("");
                        const depth = Math.min(node.depth, MAX_DEPTH);
                        
                        // Find parent
                        let parent = rootNode;
                        for (let pd = depth - 1; pd >= 0; pd--) {
                            if (parents[pd]) {
                                parent = parents[pd];
                                break;
                            }
                        }
                        
                        const id = slugify(txt, { lower: true, strict: true });
                        const headingNode = {
                            id,
                            label: txt,
                            children: [],
                        };
                        parent.children.push(headingNode);
                        parents[depth] = headingNode;
                        currentHeading = headingNode;
                    }
                    else if (node.type === "list" && currentHeading) {
                        // Process list items
                        node.children.forEach((listItem: any) => {
                            // Extract text and link from list item
                            let itemText = "";
                            let itemUrl = "";
                            
                            visit(listItem, (itemNode) => {
                                if (itemNode.type === "text") {
                                    itemText += itemNode.value;
                                } 
                                else if (itemNode.type === "link") {
                                    itemUrl = itemNode.url;
                                    if (itemNode.children) {
                                        itemText += itemNode.children
                                            .filter((n: any) => n.type === "text")
                                            .map((n: any) => n.value)
                                            .join("");
                                    }
                                }
                            });
                            
                            // Create list item node
                            if (itemText) {
                                const itemId = slugify(
                                    `${currentHeading.id}-${itemText}`,
                                    { lower: true, strict: true }
                                );
                                
                                if (itemUrl) {
                                    newUrlMap.set(itemId, itemUrl);
                                }
                                
                                currentHeading.children.push({
                                    id: itemId,
                                    label: itemText,
                                    children: [],
                                });
                            }
                        });
                    }
                });

                setTreeRoot(rootNode);
                setUrlMap(newUrlMap);
                setLoading(false);
            } catch (e: any) {
                setError(e.message);
                setLoading(false);
            }
        }
        fetchAndBuildTree();
    }, []);

    const handleAction = useCallback((key: any) => {
        const url = urlMap.get(key);
        if (url) {
            window.open(url, "_blank");
        }
    }, [urlMap]);

    if (loading) return <div>Loading…</div>;
    if (error) return <div>Error: {error}</div>;

    const filterTree = (items: any[]): any[] =>
        items
            .map((i) => ({
                ...i,
                children: filterTree(i.children || []),
            }))
            .filter(
                (i) =>
                    i.label.toLowerCase().includes(filter.toLowerCase()) ||
                    (i.children && i.children.length > 0)
            );

    function getTreeItems() {
        if (!filter) return treeRoot;
        return { ...treeRoot, children: filterTree(treeRoot.children) };
    }

    return (
        <div style={{ padding: "1rem" }}>
            <SearchInput
                aria-label="search samples"
                placeholder="Search samples"
                value={filter}
                onChange={(e) => setFilter(e)}
            />
            <TreeView 
                items={getTreeItems()} 
                onAction={handleAction} 
            />
        </div>
    );
};

export default Content;