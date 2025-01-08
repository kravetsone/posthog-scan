import { existsSync } from "node:fs";
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
