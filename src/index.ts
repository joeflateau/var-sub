import { readFile } from "fs-extra";

export async function stringFromTemplateFile(
  templateFileName: string,
  replacements: TemplateReplacements
) {
  const template = await readFile(templateFileName, "utf8");
  const result = stringFromTemplate(template, replacements);
  return result;
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

export type TemplateReplacements = Record<string, string>;
