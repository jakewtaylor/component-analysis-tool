export type ReactScanImportInfo = {
  imported: string;
  local: string;
  moduleName: string;
  importType: "ImportSpecifier" | "ImportDefaultSpecifier";
};

export type ReactScanLocation = {
  file: string;
  start: {
    line: number;
    column: number;
  };
};

export type ReactScanInstance = {
  props: Record<string, string | number | boolean>;
  propsSpread: boolean;
  importInfo?: ReactScanImportInfo;
  location: ReactScanLocation;
};

export type ReactScanComponent = {
  instances: ReactScanInstance[];
};

export type ReactScan = Record<string, ReactScanComponent>;
