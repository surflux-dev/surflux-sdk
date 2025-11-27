import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';
import type { SuiMoveNormalizedType, SuiMoveNormalizedField } from '@mysten/sui/client';

function getRpcUrl(network: string): string {
  const lowerNetwork = network.toLowerCase();

  if (lowerNetwork.startsWith('http://') || lowerNetwork.startsWith('https://')) {
    return network;
  }

  switch (lowerNetwork) {
    case 'mainnet':
      return getFullnodeUrl('mainnet');
    case 'testnet':
      return getFullnodeUrl('testnet');
    case 'devnet':
      return getFullnodeUrl('devnet');
    default:
      throw new Error(`Unknown network: ${network}. Use mainnet, testnet, devnet, or a custom RPC URL`);
  }
}

function suiTypeToTypeScript(type: SuiMoveNormalizedType, currentPackageId?: string): string {
  if (!type) {
    return 'any';
  }

  if (typeof type === 'string') {
    return mapPrimitiveType(type);
  }

  if (typeof type !== 'object') {
    return 'any';
  }

  if ('Vector' in type && type.Vector) {
    return `${suiTypeToTypeScript(type.Vector, currentPackageId)}[]`;
  }

  if ('Struct' in type && type.Struct) {
    return mapStructType(type.Struct, currentPackageId);
  }

  if ('Reference' in type && type.Reference) {
    return suiTypeToTypeScript(type.Reference, currentPackageId);
  }

  if ('MutableReference' in type && type.MutableReference) {
    return suiTypeToTypeScript(type.MutableReference, currentPackageId);
  }

  if ('TypeParameter' in type && typeof type.TypeParameter === 'number') {
    return `T${type.TypeParameter}`;
  }

  return 'any';
}

function mapPrimitiveType(type: string): string {
  switch (type) {
    case 'Bool':
      return 'boolean';
    case 'U8':
    case 'U16':
    case 'U32':
      return 'number';
    case 'U64':
    case 'U128':
    case 'U256':
      return 'string';
    case 'Address':
      return 'string';
    default:
      try {
        const normalized = normalizeStructTag(type);
        if (normalized === '0x1::string::String' || normalized === '0x1::ascii::String') {
          return 'string';
        }
        if (normalized.startsWith('vector<')) {
          const innerType = normalized.slice(7, -1);
          return `${mapPrimitiveType(innerType)}[]`;
        }
        if (normalized.startsWith('option<')) {
          const innerType = normalized.slice(7, -1);
          return `${mapPrimitiveType(innerType)} | null`;
        }
        if (normalized.includes('::')) {
          const parts = normalized.split('::');
          return parts[parts.length - 1];
        }
      } catch {}
      return 'any';
  }
}

const externalTypesMap = new Map<string, { address: string; module: string; name: string }>();

function handleMapType(
  typeArguments: SuiMoveNormalizedType[] | undefined,
  currentPackageId?: string
): string {
  if (typeArguments && typeArguments.length === 2) {
    const [keyType, valueType] = typeArguments;
    return `Map<${suiTypeToTypeScript(keyType, currentPackageId)}, ${suiTypeToTypeScript(
      valueType,
      currentPackageId
    )}>`;
  }
  return 'Map<string, any>';
}

function mapStructType(
  struct: {
    address: string;
    module: string;
    name: string;
    typeArguments?: SuiMoveNormalizedType[];
  },
  currentPackageId?: string
): string {
  const { address, module, name, typeArguments } = struct;

  if (address === '0x1') {
    if (module === 'string' || module === 'ascii') {
      return 'string';
    }
    if (module === 'option' && typeArguments && typeArguments.length === 1) {
      return `${suiTypeToTypeScript(typeArguments[0], currentPackageId)} | null`;
    }
    if (currentPackageId && address !== currentPackageId) {
      externalTypesMap.set(name, { address, module, name });
    }
  }

  if (address === '0x2') {
    if (module === 'object' && (name === 'ID' || name === 'UID')) {
      return 'string';
    }
    if (module === 'balance' && name === 'Balance') {
      return 'any';
    }
    if (module === 'transfer_policy' && name === 'TransferPolicy') {
      return 'any';
    }
    if (module === 'transfer_policy' && name === 'TransferPolicyCap') {
      return 'any';
    }
    if ((module === 'vec_map' && name === 'VecMap') || (module === 'table' && name === 'Table')) {
      return handleMapType(typeArguments, currentPackageId);
    }
    if (module === 'vec_set' && name === 'VecSet') {
      if (typeArguments && typeArguments.length === 1) {
        return `Set<${suiTypeToTypeScript(typeArguments[0], currentPackageId)}>`;
      }
      return 'Set<any>';
    }
  }

  if (currentPackageId && address !== currentPackageId && address !== '0x1' && address !== '0x2') {
    externalTypesMap.set(name, { address, module, name });
  }

  return name;
}

function generateTypeName(eventName: string): string {
  return eventName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function processField(
  fieldName: string,
  fieldType: SuiMoveNormalizedType | null | undefined,
  normalizedPackageId: string,
  fieldTypes: string[]
): void {
  try {
    if (!fieldType) {
      console.warn(`Warning: Field ${fieldName} has no type, using 'any'`);
      fieldTypes.push(`  ${fieldName}: any;`);
      return;
    }

    const tsType = suiTypeToTypeScript(fieldType, normalizedPackageId);
    fieldTypes.push(`  ${fieldName}: ${tsType};`);
  } catch (error: any) {
    console.warn(`Warning: Failed to process field ${fieldName}: ${error.message}`);
    fieldTypes.push(`  ${fieldName}: any;`);
  }
}

function extractTypeNames(typeString: string): Set<string> {
  const typeNames = new Set<string>();
  const typeRegex = /\b([A-Z][a-zA-Z0-9_]*)\b/g;
  const primitives = new Set([
    'Record',
    'Map',
    'Set',
    'Array',
    'Promise',
    'Date',
    'String',
    'Number',
    'Boolean',
    'Object',
    'Any',
    'null',
    'undefined',
  ]);

  let match;
  while ((match = typeRegex.exec(typeString)) !== null) {
    const typeName = match[1];
    if (!primitives.has(typeName) && (typeName === 'T0' || !typeName.match(/^T\d+$/))) {
      typeNames.add(typeName);
    }
  }
  return typeNames;
}

function generateExternalTypeDefinition(
  typeName: string,
  struct?: { address: string; module: string; name: string }
): string {
  const knownTypes: Record<string, string> = {
    Bytes32: 'export type Bytes32 = number[]; // 32-byte array',
    ExternalAddress: 'export type ExternalAddress = number[]; // External address bytes',
    T0: 'export type T0 = any; // Generic type parameter',
    ConsumedVAAs: 'export interface ConsumedVAAs {\n  [key: string]: any;\n}',
    UpgradeCap: 'export interface UpgradeCap {\n  [key: string]: any;\n}',
  };

  if (knownTypes[typeName]) {
    return knownTypes[typeName];
  }

  if (struct) {
    return `export type ${typeName} = any; // From ${struct.address}::${struct.module}::${struct.name}`;
  }

  return `export type ${typeName} = any; // External type - definition not available`;
}

export async function generateTypes(packageId: string, network: string): Promise<string> {
  const rpcUrl = getRpcUrl(network);
  const client = new SuiClient({ url: rpcUrl });
  const normalizedPackageId = normalizeSuiAddress(packageId);

  externalTypesMap.clear();

  let modules;
  try {
    modules = await client.getNormalizedMoveModulesByPackage({
      package: normalizedPackageId,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch modules for package ${packageId}: ${error.message}`);
  }

  if (!modules || Object.keys(modules).length === 0) {
    throw new Error(
      `No modules found for package ${packageId}. Make sure the package ID is correct and the package is published on ${network}.`
    );
  }

  const eventTypes: string[] = [];
  const eventNames: Array<{
    module: string;
    struct: string;
    typeName: string;
    fullType: string;
  }> = [];

  const definedTypeNames = new Set<string>();
  const usedTypeNames = new Map<string, number>();

  for (const [moduleName, module] of Object.entries(modules)) {
    if (!module || !module.structs) {
      continue;
    }

    for (const [structName, struct] of Object.entries(module.structs)) {
      if (!struct) {
        continue;
      }
      const fields = struct.fields;
      if (
        !fields ||
        (Array.isArray(fields) && fields.length === 0) ||
        (!Array.isArray(fields) && Object.keys(fields).length === 0)
      ) {
        continue;
      }

      const structType = `${normalizedPackageId}::${moduleName}::${structName}`;
      let typeName = generateTypeName(structName);

      if (usedTypeNames.has(typeName)) {
        const previousIndex = eventNames.findIndex((e) => e.typeName === typeName);
        if (previousIndex >= 0) {
          const previous = eventNames[previousIndex];
          const previousModulePascal = generateTypeName(previous.module);
          const previousUniqueName = `${previous.typeName}${previousModulePascal}`;
          eventNames[previousIndex].typeName = previousUniqueName;
          const oldInterfacePattern = new RegExp(`export interface ${previous.typeName}\\s*\\{`);
          const typeIndex = eventTypes.findIndex((t) => oldInterfacePattern.test(t));
          if (typeIndex >= 0) {
            eventTypes[typeIndex] = eventTypes[typeIndex].replace(
              `export interface ${previous.typeName}`,
              `export interface ${previousUniqueName}`
            );
          }
          definedTypeNames.delete(previous.typeName);
          definedTypeNames.add(previousUniqueName);
          usedTypeNames.delete(previous.typeName);
          usedTypeNames.set(previousUniqueName, 1);
        }
        const moduleNamePascal = generateTypeName(moduleName);
        typeName = `${typeName}${moduleNamePascal}`;
        usedTypeNames.set(typeName, 1);
      } else {
        usedTypeNames.set(typeName, 1);
      }

      const fieldTypes: string[] = [];

      if (Array.isArray(fields)) {
        for (const field of fields) {
          const fieldName = field.name || 'unknown';
          const fieldType: SuiMoveNormalizedType = field.type;
          processField(fieldName, fieldType, normalizedPackageId, fieldTypes);
        }
      } else {
        for (const [fieldName, field] of Object.entries(fields)) {
          let fieldType: SuiMoveNormalizedType;
          if (typeof field === 'object' && field !== null && 'type' in field) {
            fieldType = (field as SuiMoveNormalizedField).type;
          } else {
            fieldType = field as unknown as SuiMoveNormalizedType;
          }
          processField(fieldName, fieldType, normalizedPackageId, fieldTypes);
        }
      }

      eventTypes.push(`export interface ${typeName} {
${fieldTypes.join('\n')}
}`);

      definedTypeNames.add(typeName);

      eventNames.push({
        module: moduleName,
        struct: structName,
        typeName,
        fullType: structType,
      });
    }
  }

  const allTypeStrings = eventTypes.join('\n');
  const referencedTypes = extractTypeNames(allTypeStrings);

  const externalTypes = new Set<string>();
  for (const typeName of referencedTypes) {
    if (!definedTypeNames.has(typeName)) {
      externalTypes.add(typeName);
    }
  }

  if (eventTypes.length === 0) {
    throw new Error('No events found in the package. Make sure the package has structs with fields.');
  }

  const imports = `// Auto-generated types for package ${packageId}\n// Network: ${network}\n// Generated at: ${new Date().toISOString()}\n\n`;

  const externalTypeDefinitions: string[] = [];
  if (externalTypes.size > 0 || externalTypesMap.size > 0) {
    externalTypeDefinitions.push('// External type definitions (from other packages)');

    for (const [typeName, struct] of externalTypesMap.entries()) {
      if (!definedTypeNames.has(typeName)) {
        externalTypeDefinitions.push(generateExternalTypeDefinition(typeName, struct));
      }
    }

    for (const typeName of Array.from(externalTypes).sort()) {
      if (!externalTypesMap.has(typeName) && !definedTypeNames.has(typeName)) {
        externalTypeDefinitions.push(generateExternalTypeDefinition(typeName));
      }
    }

    externalTypeDefinitions.push('');
  }

  const usesMap = allTypeStrings.includes('Map<');
  const commonTypes =
    (externalTypeDefinitions.length > 0 ? externalTypeDefinitions.join('\n') : '') +
    (usesMap ? '// Common type definitions\nexport type Map<K, V> = Record<string, V>;\n\n' : '');

  const typesContent = eventTypes.join('\n\n');

  const eventMappings = eventNames.map((event) => `  ${event.typeName}: '${event.fullType}'`).join(',\n');

  const eventEnumValues = eventNames.map((event) => `  ${event.typeName} = '${event.typeName}'`).join(',\n');
  const eventEnum = `\n// Enum for event names (use EventName.GovernanceInstruction instead of 'GovernanceInstruction')\nexport enum EventName {\n${eventEnumValues}\n}\n`;

  const eventMapType = `\nexport const EventTypes = {\n${eventMappings}\n} as const;\n\nexport type EventTypeName = keyof typeof EventTypes;\n\nexport type EventTypeMap = {\n${eventNames
    .map((e) => `  [EventTypes.${e.typeName}]: ${e.typeName}`)
    .join(';\n')}\n};\n`;

  return imports + commonTypes + typesContent + eventEnum + eventMapType;
}
