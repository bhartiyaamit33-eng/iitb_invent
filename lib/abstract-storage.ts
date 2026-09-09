import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  getAbstractPdfObject,
  isS3Configured,
  uploadAbstractPdf,
} from "@/lib/s3";

const LOCAL_DIR = path.join(process.cwd(), "data", "abstracts");

export async function saveAbstractFile(opts: {
  applicationId: string;
  bytes: Buffer;
  fileName: string;
}): Promise<{ storage: "s3" | "local"; key: string }> {
  if (isS3Configured()) {
    const { key } = await uploadAbstractPdf(opts);
    return { storage: "s3", key };
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  const key = `${opts.applicationId}.pdf`;
  await writeFile(path.join(LOCAL_DIR, key), opts.bytes);
  return { storage: "local", key };
}

export async function readAbstractFile(opts: {
  storage: string;
  key: string;
}): Promise<{ bytes: Buffer; contentType: string }> {
  if (opts.storage === "s3") {
    return getAbstractPdfObject(opts.key);
  }
  const bytes = await readFile(path.join(LOCAL_DIR, path.basename(opts.key)));
  return { bytes, contentType: "application/pdf" };
}
