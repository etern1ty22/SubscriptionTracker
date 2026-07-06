export type ExportSubscriptionsStatus = "all" | "active";

export type CsvExportFile = {
  filename: string;
  content: string;
};

export type PdfExportFile = {
  filename: string;
  content: Buffer;
};
