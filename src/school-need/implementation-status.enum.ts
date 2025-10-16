export enum ImplementationStatus {
  LOOKING_FOR_PARTNER = 'Looking for partner',
  COMPLETED = 'Completed',
}

// Helper function to create percentage completion status
export function getPercentageComplete(percentage: number): string {
  return `${Math.round(percentage)}% Complete`;
}
