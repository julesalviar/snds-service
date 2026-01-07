/**
 * Flattens populated arrays in MongoDB documents.
 * For each document, if a populated field is an array, creates one document per item
 * in that array, merging the populated item's fields with the parent document's fields.
 *
 * @param documents - Array of documents to flatten
 * @param populatePaths - Array of populate path configurations
 * @returns Flattened array of documents
 */
export function flattenPopulatedArrays(
  documents: any[],
  populatePaths: { path: string; select?: string }[],
): any[] {
  const flattened: any[] = [];

  for (const doc of documents) {
    const docObj = doc.toObject ? doc.toObject() : doc;
    const populatedPaths = populatePaths.map((p) => p.path);

    // Find the first populated field that is an array
    let hasArrayPopulate = false;
    for (const path of populatedPaths) {
      const populatedValue = docObj[path];

      if (Array.isArray(populatedValue) && populatedValue.length > 0) {
        hasArrayPopulate = true;
        // Create one document per item in the populated array
        for (const populatedItem of populatedValue) {
          const flattenedDoc = { ...docObj };
          // Remove the populated array field
          delete flattenedDoc[path];
          // Merge the populated item's fields into the parent document
          const populatedItemObj =
            populatedItem?.toObject?.() || populatedItem || {};
          Object.assign(flattenedDoc, populatedItemObj);
          flattened.push(flattenedDoc);
        }
        break; // Only flatten the first array populated found
      } else if (
        populatedValue &&
        typeof populatedValue === 'object' &&
        !Array.isArray(populatedValue)
      ) {
        // If it's a single populated object, merge it up one level
        hasArrayPopulate = true;
        const flattenedDoc = { ...docObj };
        // Remove the populated field
        delete flattenedDoc[path];
        // Merge the populated object's fields into the parent document
        const populatedItemObj = populatedValue.toObject?.() || populatedValue;
        Object.assign(flattenedDoc, populatedItemObj);
        flattened.push(flattenedDoc);
        break;
      }
    }

    // If no array or object populate found, keep the document as is
    if (!hasArrayPopulate) {
      flattened.push(docObj);
    }
  }

  return flattened;
}
