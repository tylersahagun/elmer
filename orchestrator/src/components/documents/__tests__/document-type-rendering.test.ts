import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DocumentSidebar } from "../DocumentSidebar";
import { DocumentList } from "../DocumentViewer";

const baseDocument = {
  id: "doc_123",
  title: "Launch Plan",
  content: "# Content",
  version: 1,
  createdAt: new Date("2026-03-07T00:00:00.000Z"),
  updatedAt: new Date("2026-03-07T00:00:00.000Z"),
};

describe("document type rendering", () => {
  it("renders sidebar entries for extended known document types", () => {
    const markup = renderToStaticMarkup(
      React.createElement(DocumentSidebar, {
        documents: [
          {
            ...baseDocument,
            type: "feature_guide",
          },
        ],
        onSelect: vi.fn(),
      }),
    );

    expect(markup).toContain("Feature Guide");
  });

  it("falls back safely when a document type is unknown", () => {
    const documents = [
      {
        ...baseDocument,
        id: "doc_unknown",
        type: "unknown_doc_type",
        title: "Unexpected Doc",
      },
    ];

    expect(() =>
      renderToStaticMarkup(
        React.createElement(DocumentSidebar, {
          documents,
          onSelect: vi.fn(),
        }),
      ),
    ).not.toThrow();

    const markup = renderToStaticMarkup(
      React.createElement(DocumentList, {
        documents,
        selectedId: "doc_unknown",
        onSelect: vi.fn(),
      }),
    );

    expect(markup).toContain("Unknown Doc Type");
    expect(markup).toContain("Unexpected Doc");
  });
});
