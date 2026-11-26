"use client";
import { track } from "@/lib/analytics";

export function DownloadLink({ href, file }: { href: string; file: string }) {
  return (
    <a href={href} download={file} className="btn-primary mt-4 !py-2" onClick={() => track("file_download", { file_name: file })}>
      Descargar .docx
    </a>
  );
}
