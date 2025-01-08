import type { SourceFile, Type, TypeChecker } from "ts-morph";
import { SyntaxKind } from "ts-morph";

export function resolveOriginalTypeText(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    type: Type<any>,
    typeChecker: TypeChecker,
): string {
    if (type.isUnion()) {
        // Resolve union types (e.g., string | undefined)
        return type
            .getUnionTypes()
            .map((type) => resolveOriginalTypeText(type, typeChecker))
            .join(" | ");
    }
    if (type.isIntersection()) {
        // Resolve intersection types (e.g., A & B)
        return type
            .getIntersectionTypes()
            .map((type) => resolveOriginalTypeText(type, typeChecker))
            .join(" & ");
    }
    if (type.isLiteral()) {
        // Resolve literal types (e.g., "value" -> string)
        return typeChecker.getBaseTypeOfLiteralType(type).getText();
    }
    const aliasSymbol = type.getAliasSymbol();

    if (aliasSymbol) {
        // Expand alias types
        return resolveOriginalTypeText(
            aliasSymbol.getDeclaredType(),
            typeChecker,
        );
    }
    // For non-aliased, direct types
    return type.getText();
}

export function extractEventsFromSourceFiles(
    sourceFiles: SourceFile[],
    typeChecker: TypeChecker,
): {
    event: string | undefined;
    properties: { name: string; type: string }[];
}[] {
    const events = [];

    for (const sourceFile of sourceFiles) {
        const calls = sourceFile.getDescendantsOfKind(
            SyntaxKind.CallExpression,
        );
        for (const call of calls) {
            const expression = call.getExpression();
            if (expression.getText() === "posthog.capture") {
                const args = call.getArguments();
                if (args.length > 0) {
                    const firstArg = args[0];
                    if (!firstArg.isKind(SyntaxKind.ObjectLiteralExpression))
                        continue;

                    const eventArg = firstArg.getProperty("event");
                    const propertiesArg = firstArg.getProperty("properties");

                    let eventValue: string | undefined;

                    if (eventArg?.isKind(SyntaxKind.PropertyAssignment)) {
                        eventValue = eventArg
                            .getInitializer()
                            ?.getText()
                            .replace(/"/g, "");
                    }

                    const propertiesArray = [];
                    if (propertiesArg?.isKind(SyntaxKind.PropertyAssignment)) {
                        const propertiesValue = propertiesArg.getInitializer();
                        if (
                            propertiesValue?.isKind(
                                SyntaxKind.ObjectLiteralExpression,
                            )
                        ) {
                            const propertiesObject =
                                propertiesValue.getProperties();
                            for (const prop of propertiesObject) {
                                if (
                                    prop.isKind(
                                        SyntaxKind.PropertyAssignment,
                                    ) ||
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

                                    propertiesArray.push({
                                        name: propName,
                                        type,
                                    });
                                }
                            }
                        }
                    }

                    events.push({
                        event: eventValue,
                        properties: propertiesArray,
                    });
                }
            }
        }
    }

    return events;
}
