import { prisma } from "~/utils/prisma.server";
import type { ReactScan } from "~/types/ReactScanner";
import { reactScanToPrisma } from "./reactScanToPrisma";

export class AnalysisFactory {
  scan: ReactScan;

  constructor(scan: ReactScan) {
    this.scan = scan;
  }

  public async create(): Promise<ReturnType<typeof prisma.analysis.create>> {
    const data = reactScanToPrisma(this.scan);

    return prisma.analysis.create({
      data,
    });
  }
}
