import { readFile, mkdirp, writeFile, lstat } from "fs-extra";
import globCb from "glob";
import { promisify } from "util";
import { parse as parsePath, join as joinPath } from "path";

const glob = promisify(globCb);

export async function stringFromTemplateFile(
  templateFileName: string,
  replacements: TemplateReplacements
) {
  const template = await readFile(templateFileName, "utf8");
  const result = stringFromTemplate(template, replacements);
  return result;
}

export async function copyFromTemplateFile(
  templateFileName: string,
  destFileName: string,
  replacements: TemplateReplacements
): Promise<void> {
  const template = await readFile(templateFileName, "utf8");
  const result = stringFromTemplate(template, replacements);
  await writeFile(destFileName, result, "utf8");
}

export function stringFromTemplate(
  template: string,
  replacements: TemplateReplacements
): string {
  return template.replace(
    /\$([a-zA-Z][a-zA-Z0-9_]*)|\$\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,
    (_, m1, m2) => {
      const variable = m1 ?? m2;
      if (!(variable in replacements)) {
        throw new Error(`unbound variable ${variable}`);
      }
      return replacements[variable];
    }
  );
}

export async function copyFromTemplateFiles(
  srcDir: string,
  globPattern: string,
  destDir: string,
  replacements: TemplateReplacements,
  { mapper }: { mapper?: (file: MapFile) => MapFile } = {}
): Promise<void> {
  const matches = await glob(globPattern, { cwd: srcDir });
  for (const srcRelativePath of matches) {
    const srcPath = joinPath(srcDir, srcRelativePath);

    if ((await lstat(srcPath)).isFile()) {
      const { path: destRelativePath, contents } = (mapper ?? defaultMapper)({
        path: srcRelativePath,
        contents: await stringFromTemplateFile(srcPath, replacements)
      });

      const destPath = joinPath(destDir, destRelativePath);
      await mkdirp(parsePath(destPath).dir);
      await writeFile(destPath, contents, "utf8");
    }
  }
}

function defaultMapper(file: MapFile): MapFile {
  return file;
}

export type TemplateReplacements = Record<string, string>;

export interface MapFile {
  path: string;
  contents: string;
}
