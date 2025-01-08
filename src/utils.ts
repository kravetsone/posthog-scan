import type { Type, TypeChecker } from "ts-morph";

export function resolveOriginalTypeText(type: Type<any>, typeChecker: TypeChecker): string {
    if (type.isUnion()) {
      // Resolve union types (e.g., string | undefined)
      return type.getUnionTypes().map((type) => resolveOriginalTypeText(type, typeChecker)).join(" | ");
    }
    if (type.isIntersection()) {
      // Resolve intersection types (e.g., A & B)
      return type.getIntersectionTypes().map((type) => resolveOriginalTypeText(type, typeChecker)).join(" & ");
    }
    if (type.isLiteral()) {
      // Resolve literal types (e.g., "value" -> string)
      return typeChecker.getBaseTypeOfLiteralType(type).getText();
    }
    if (type.getAliasSymbol()) {
      // Expand alias types
      return resolveOriginalTypeText(type.getAliasSymbol()!.getDeclaredType(), typeChecker);
    }
    // For non-aliased, direct types
    return type.getText();
  }