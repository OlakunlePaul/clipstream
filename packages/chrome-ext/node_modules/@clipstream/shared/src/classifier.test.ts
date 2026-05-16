import { describe, it, expect } from "vitest";
import { classifyClip, ContentType } from "./classifier";

describe("Content Classifier", () => {
  it("should detect API keys and mask them", () => {
    const result = classifyClip("sk-antigravity1234567890abcdef");
    expect(result.type).toBe(ContentType.API_KEY);
    expect(result.isSensitive).toBe(true);
    expect(result.displayValue).toBe("••••cdef");
  });

  it("should detect AWS keys", () => {
    const result = classifyClip("AKIA1234567890ABCDEF");
    expect(result.type).toBe(ContentType.API_KEY);
    expect(result.displayValue).toBe("••••CDEF");
  });

  it("should detect commands", () => {
    expect(classifyClip("$ ls -la").type).toBe(ContentType.COMMAND);
    expect(classifyClip("npm install").type).toBe(ContentType.COMMAND);
    expect(classifyClip("git commit -m 'feat'").type).toBe(ContentType.COMMAND);
  });

  it("should detect code snippets", () => {
    expect(classifyClip("const x = () => {}").type).toBe(ContentType.CODE);
    expect(classifyClip("function test() { return 1; }").type).toBe(ContentType.CODE);
  });

  it("should detect file paths", () => {
    expect(classifyClip("/usr/local/bin").type).toBe(ContentType.FILE_PATH);
    expect(classifyClip("C:\\Users\\Admin").type).toBe(ContentType.FILE_PATH);
    expect(classifyClip("./relative/path").type).toBe(ContentType.FILE_PATH);
  });

  it("should detect URLs", () => {
    expect(classifyClip("https://clipstream.dev").type).toBe(ContentType.URL);
    expect(classifyClip("ftp://myserver.com").type).toBe(ContentType.URL);
  });

  it("should detect error traces", () => {
    expect(classifyClip("Error: connection refused").type).toBe(ContentType.ERROR_TRACE);
    expect(classifyClip("Traceback (most recent call last):").type).toBe(ContentType.ERROR_TRACE);
  });

  it("should fallback to text", () => {
    expect(classifyClip("Hello world").type).toBe(ContentType.TEXT);
  });
});
