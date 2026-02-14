export interface ParsedField {
  readonly code: string;
  readonly value: string;
}

export interface ParsedForm {
  readonly formType: string;
  readonly fields: Map<string, string>;
}

export interface ParsedXtxFile {
  readonly forms: ParsedForm[];
  readonly rawXml: string;
}
