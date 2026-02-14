/**
 * Reads and parses .xtx (XML) files into ParsedXtxFile structures.
 */

import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import type { ParsedForm, ParsedXtxFile } from "./types.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (_name: string, jpath: string) => {
    // Ensure FormData and Field are always arrays
    return jpath === "DataRoot.FormData" || /\.FormData\.Field$/.test(jpath);
  },
});

interface XmlField {
  "#text"?: string;
  "@_id": string;
}

interface XmlFormData {
  "@_id": string;
  Field?: XmlField[];
}

interface XmlDataRoot {
  DataRoot: {
    FormData?: XmlFormData[];
  };
}

function parseXml(xml: string): ParsedXtxFile {
  const result = parser.parse(xml) as XmlDataRoot;

  const root = result.DataRoot;
  if (!root) {
    throw new Error("Invalid xtx: missing DataRoot element");
  }

  const formDataArray = root.FormData ?? [];
  const forms: ParsedForm[] = formDataArray.map((fd) => {
    const fields = new Map<string, string>();
    const xmlFields = fd.Field ?? [];
    for (const field of xmlFields) {
      const value = field["#text"] != null ? String(field["#text"]) : "";
      fields.set(field["@_id"], value);
    }
    return {
      formType: fd["@_id"],
      fields,
    };
  });

  return { forms, rawXml: xml };
}

/** Parse an xtx XML string into a structured ParsedXtxFile. */
export function readXtxString(xml: string): ParsedXtxFile {
  return parseXml(xml);
}

/** Read and parse an xtx file from the filesystem. */
export async function readXtxFile(filePath: string): Promise<ParsedXtxFile> {
  const xml = await readFile(filePath, "utf-8");
  return parseXml(xml);
}
