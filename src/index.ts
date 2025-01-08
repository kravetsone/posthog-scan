import {
    ModuleKind,
    ModuleResolutionKind,
    Project,
    ScriptTarget,
    SyntaxKind,
    TypeFormatFlags,
    ts,
} from "ts-morph";
import { resolveOriginalTypeText } from "./utils.ts";

const project = new Project({
    compilerOptions: {
        lib: ["ESNext", "DOM"],
        target: ScriptTarget.ESNext,
        module: ModuleKind.NodeNext,
        allowJs: true,

        // Bundler mode
        moduleResolution: ModuleResolutionKind.NodeNext,
        allowImportingTsExtensions: true,
        verbatimModuleSyntax: true,
        noEmit: true,

        // Best practices
        strict: true,
        skipLibCheck: true,
        noFallthroughCasesInSwitch: true,

        // Some stricter flags (disabled by default)
        noUnusedLocals: false,
        noUnusedParameters: false,
        noPropertyAccessFromIndexSignature: false,
    },
});
const sourceFiles = project.addSourceFilesAtPaths("src/**/*.ts");

const typeChecker = project.getTypeChecker();

sourceFiles.forEach((sourceFile) => {
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    calls.forEach((call) => {
        const expression = call.getExpression();
        if (expression.getText() === "posthog.capture") {
            const args = call.getArguments();
            if (args.length > 0) {
                const firstArg = args[0];
                if (!firstArg.isKind(SyntaxKind.ObjectLiteralExpression))
                    return;

                const eventArg = firstArg.getProperty("event");
                const propertiesArg = firstArg.getProperty("properties");

                if (
                    eventArg &&
                    eventArg.isKind(SyntaxKind.PropertyAssignment)
                ) {
                    const eventValue = eventArg
                        .getInitializer()
                        ?.getText()
                        .replace(/"/g, "");
                    console.log(`Найден event: ${eventValue}`);
                }

                if (
                    propertiesArg &&
                    propertiesArg.isKind(SyntaxKind.PropertyAssignment)
                ) {
                    const propertiesValue = propertiesArg.getInitializer();
                    if (
                        propertiesValue &&
                        propertiesValue.isKind(
                            SyntaxKind.ObjectLiteralExpression,
                        )
                    ) {
                        const propertiesObject =
                            propertiesValue.getProperties();
                        propertiesObject.forEach((prop) => {
                            if (
                                prop.isKind(SyntaxKind.PropertyAssignment) ||
                                prop.isKind(
                                    SyntaxKind.ShorthandPropertyAssignment,
                                )
                            ) {
                                const propName = prop.getName();
                                const propType = prop.getType();

                                const type = resolveOriginalTypeText(
                                    propType,
                                    typeChecker,
                                );

                                console.log(
                                    `Свойство: ${propName}, Тип: ${type}`,
                                );
                            }
                        });
                    }
                }
            }
        }
    });
});
