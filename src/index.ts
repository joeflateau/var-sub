import { readFile, mkdirp, writeFile } from "fs-extra";
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
  replacements: TemplateReplacements
): Promise<void> {
  const matches = await glob(globPattern, { cwd: srcDir });
  for (const srcRelativePath of matches) {
    const destPath = joinPath(destDir, srcRelativePath);
    const srcPath = joinPath(srcDir, srcRelativePath);
    await mkdirp(parsePath(destPath).dir);
    await copyFromTemplateFile(srcPath, destPath, replacements);
  }
}

export type TemplateReplacements = Record<string, string>;
