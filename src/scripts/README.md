# Migration Scripts

## Initialize School Summaries

This script initializes the school summary collection for existing data.

### Purpose

When deploying the school summary feature for the first time, this script will:
- Calculate summaries for all existing schools
- Generate summaries for each school year
- Generate all-time summaries
- Handle edge cases like missing data

### Prerequisites

1. Ensure the database is backed up
2. Ensure the `school-summary` module is properly configured
3. Have tenant ID ready

### Usage

#### Using ts-node (Development)

```bash
npx ts-node src/scripts/initialize-school-summaries.ts <tenantId>
```

#### Using compiled code (Production)

```bash
npm run build
node dist/scripts/initialize-school-summaries.js <tenantId>
```

### Example

```bash
# For tenant "tenant123"
npx ts-node src/scripts/initialize-school-summaries.ts tenant123
```

### Expected Output

```
Starting school summaries initialization...

Tenant ID: tenant123

Connected to database successfully

Processing schools...

--- Initialization Complete ---
Schools processed: 150
Errors: 0

Migration completed successfully!
```

### What it does

For each school in the tenant database:
1. Finds all unique school years from school needs
2. Calculates and creates summary for each school year:
   - Total need quantity
   - Total engagement quantity
   - Accomplishment percentage
3. Calculates and creates all-time summary
4. Handles errors gracefully and continues processing

### Error Handling

- Errors for individual schools are logged but don't stop the entire process
- A summary of errors is shown at the end
- Check logs for detailed error information

### Re-running the Script

The script is safe to run multiple times:
- Uses `upsert` operations (create or update)
- Won't create duplicates
- Will recalculate and update existing summaries

### Verify Results

After running the migration, verify in MongoDB:

```javascript
// Check if summaries were created
db.school_summaries.countDocuments()

// View sample summaries
db.school_summaries.find().limit(5)

// Check for a specific school
db.school_summaries.find({ schoolId: ObjectId("...") })
```

### Manual Recalculation

If you need to recalculate for a specific school, use the API endpoint:

```bash
POST /school-summary/recalculate/:schoolId?schoolYear=2024-2025
```

Or recalculate all years for a school (omit schoolYear):

```bash
POST /school-summary/recalculate/:schoolId
```

