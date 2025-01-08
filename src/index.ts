import { existsSync, writeFileSync } from "node:fs";
import { Project } from "ts-morph";
import { extractEventsFromSourceFiles } from "./utils.ts";

const isTsConfigExists = existsSync("tsconfig.json");

const project = new Project({
    tsConfigFilePath: isTsConfigExists ? "tsconfig.json" : undefined,
    defaultCompilerOptions: {
        strict: true,
    },
});
const sourceFiles = project.addSourceFilesAtPaths("src/**/*.ts");

const typeChecker = project.getTypeChecker();

const events = extractEventsFromSourceFiles(sourceFiles, typeChecker);

console.log(events);

let md = "";

md += "## Events\n\n";

for (const event of events) {
    md += `- [${event.event}](#${event.event})\n`;
}

for (const event of events) {
    md += `\n### ${event.event}\n\n`;

    for (const property of event.properties) {
        md += `- \`${property.name}\`: \`${property.type}\`\n`;
    }

    md += "\n\n";
}

writeFileSync("posthog.md", md);
