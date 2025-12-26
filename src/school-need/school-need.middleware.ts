import { updateAipStatus } from 'src/school-need/update-aip-status.helper';
import { AipSchema } from 'src/aip/aip.schema';
import { EngagementSchema } from 'src/engagement/engagement.schema';
import { SchoolNeedSchema } from 'src/school-need/school-need.schema';

// Need to import middleware to register schema hooks
import './school-need.middleware';

// Middleware: After creating a school need
SchoolNeedSchema.post('save', async function (doc) {
  if (doc.projectId && doc.projectId.length > 0) {
    for (const aipId of doc.projectId) {
      await updateAipStatus(aipId, doc, {
        SchoolNeedSchema,
        AipSchema,
        EngagementSchema,
      });
    }
  }
});

// Middleware: After updating a school need (covers findByIdAndUpdate as well)
SchoolNeedSchema.post('findOneAndUpdate', async function (doc) {
  if (doc?.projectId && doc.projectId.length > 0) {
    for (const aipId of doc.projectId) {
      await updateAipStatus(aipId, doc, {
        SchoolNeedSchema,
        AipSchema,
        EngagementSchema,
      });
    }
  }
});

// Middleware: After deleting a school need (covers findByIdAndDelete as well)
SchoolNeedSchema.post('findOneAndDelete', async function (doc) {
  if (doc?.projectId && doc.projectId.length > 0) {
    for (const aipId of doc.projectId) {
      await updateAipStatus(aipId, doc, {
        SchoolNeedSchema,
        AipSchema,
        EngagementSchema,
      });
    }
  }
});
