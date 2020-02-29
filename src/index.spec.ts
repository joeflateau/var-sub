import { describe, it } from "mocha";
import { expect } from "chai";
import {
  stringFromTemplateFile,
  stringFromTemplate,
  copyFromTemplateFiles
} from ".";

describe("stringFromTemplate", () => {
  it("should replace var with no curly", async () => {
    const result = stringFromTemplate("foo $BAR", { BAR: "bar" });
    expect(result).to.equal("foo bar");
  });
  it("should replace var with curly", async () => {
    const result = stringFromTemplate("foo ${BAR}", { BAR: "bar" });
    expect(result).to.equal("foo bar");
  });
});

describe("stringFromTemplateFile", () => {
  it("should load file and replace var with no curly", async () => {
    const result = await stringFromTemplateFile(
      __dirname + "/../test/example-template-no-curly.txt",
      { BAR: "bar" }
    );
    expect(result).to.equal("foo bar");
  });
  it("should load file and replace var with curly", async () => {
    const result = await stringFromTemplateFile(
      __dirname + "/../test/example-template-with-curly.txt",
      { BAR: "bar" }
    );
    expect(result).to.equal("foo bar");
  });
});

describe("copyFromTemplateFiles", () => {
  it("should load file and replace var with no curly", async () => {
    await copyFromTemplateFiles(
      __dirname + "/../test",
      "./**/*",
      __dirname + "/../test-results",
      { BAR: "bar" }
    );
  });
});
