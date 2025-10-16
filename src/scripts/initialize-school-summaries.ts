/**
 * Migration Script: Initialize School Summaries for Existing Data
 *
 * This script should be run once after deploying the school summary feature
 * to populate summaries for all existing schools, school needs, and engagements.
 *
 * Note: This script uses the automatic tenant connection from the request context.
 * You need to set the tenant in the request headers when calling the API endpoint,
 * or use the POST /school-summary/initialize endpoint instead.
 *
 * Usage via API:
 *   POST /school-summary/initialize
 *   Headers: { "tenant": "your-tenant-code", "Authorization": "Bearer <token>" }
 */

async function initializeSchoolSummaries() {
  console.log('Starting school summaries initialization...\n');
  console.log(
    'Note: This script is now executed via API endpoint POST /school-summary/initialize',
  );
  console.log(
    'Please use the API endpoint with proper tenant headers instead.\n',
  );
  console.log('Example:');
  console.log(
    '  curl -X POST http://localhost:3000/school-summary/initialize \\',
  );
  console.log('    -H "tenant: your-tenant-code" \\');
  console.log('    -H "Authorization: Bearer <token>"');
  console.log('\nExiting...');
  process.exit(0);
}

// Run the migration
initializeSchoolSummaries();
