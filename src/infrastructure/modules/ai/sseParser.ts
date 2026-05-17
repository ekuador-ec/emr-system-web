export type SseEventHandler = (event: { name: string; data: string }) => void;

export async function consumeSse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: SseEventHandler,
  signal?: AbortSignal,
): Promise<void> {
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  const releaseAndCancel = () => {
    try {
      reader.cancel();
    } catch {
      /* ignore */
    }
  };

  if (signal) {
    if (signal.aborted) {
      releaseAndCancel();
      return;
    }
    signal.addEventListener("abort", releaseAndCancel, { once: true });
  }

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let separatorIndex: number;
      while ((separatorIndex = findSeparator(buffer)) !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex).replace(/^(\r?\n){1,2}/, "");

        const parsed = parseSseBlock(rawEvent);
        if (parsed) onEvent(parsed);
      }
    }

    if (buffer.trim().length > 0) {
      const parsed = parseSseBlock(buffer);
      if (parsed) onEvent(parsed);
    }
  } finally {
    if (signal) signal.removeEventListener("abort", releaseAndCancel);
  }
}

function findSeparator(buffer: string): number {
  const lf = buffer.indexOf("\n\n");
  const crlf = buffer.indexOf("\r\n\r\n");
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

function parseSseBlock(block: string): { name: string; data: string } | null {
  const lines = block.split(/\r?\n/);
  let name = "message";
  const dataLines: string[] = [];
  let hasContent = false;

  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      name = line.slice(6).trim();
      hasContent = true;
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).replace(/^ /, ""));
      hasContent = true;
    }
  }

  if (!hasContent) return null;
  return { name, data: dataLines.join("\n") };
}
