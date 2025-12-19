// Update all users with sector to subsector
db.users.updateMany(
  { sector: { $exists: true } },
  { $rename: { sector: 'subsector' } },
);

// Update subsector for specific stakeholder users
db.users.updateMany(
  {
    activeRole: 'stakeholder',
    name: { $in: ['PESPA', 'NAPSSHI'] },
  },
  {
    $set: {
      sector: 'Civil Society Organization',
      subsector: 'Non-Government Organization',
    },
  },
);

db.users.updateMany(
  {
    activeRole: 'stakeholder',
    name: {
      $in: [
        'Federated PTA',
        'School Alumni',
        'School Canteen',
        'HRPTA',
        'Grade Level PTA',
        'SPTA',
        'School Teachers Association',
      ],
    },
  },
  {
    $set: { sector: 'Private Sector', subsector: 'PTA' },
  },
);

// Update sector for stakeholder users with subsector = "Government"
db.users.updateMany(
  {
    activeRole: 'stakeholder',
    subsector: 'Government',
  },
  {
    $set: { sector: 'Public Sector', subsector: '' },
  },
);

// Define the mapping between subsector and sector
const subsectorToSector = {
  // Private Sector
  'Alumni Association': 'Private Sector',
  'Corporate Foundation': 'Private Sector',
  'Private Company': 'Private Sector',
  'Private Individual': 'Private Sector',
  'Private School': 'Private Sector',
  PTA: 'Private Sector',

  // Public Sector
  Congress: 'Public Sector',
  'Government-Owned and Controlled Corporation': 'Public Sector',
  'LGU - Barangay': 'Public Sector',
  'LGU - City': 'Public Sector',
  'LGU - Municipality': 'Public Sector',
  'LGU - Province': 'Public Sector',
  Senate: 'Public Sector',
  'State University': 'Public Sector',

  // Civil Society Organization
  Cooperative: 'Civil Society Organization',
  'Faith-Based Organization': 'Civil Society Organization',
  'Media Association': 'Civil Society Organization',
  'Non-Government Organization': 'Civil Society Organization',
  'Peoples Organization': 'Civil Society Organization',
  'Professional Association': 'Civil Society Organization',
  'Trade Unions': 'Civil Society Organization',

  // International
  'Foreign Government': 'International',
  'International Non-Government Organization': 'International',
};

// Iterate only through users with activeRole = "stakeholder"
db.users.find({ activeRole: 'stakeholder' }).forEach((user) => {
  const subsector = user.subsector;

  // Check if subsector exists and is not empty
  if (subsector && subsector.trim() !== '') {
    const sector = subsectorToSector[subsector];

    if (sector) {
      db.users.updateOne({ _id: user._id }, { $set: { sector: sector } });
    } else {
      print(`No sector mapping found for subsector: ${subsector}`);
    }
  } else {
    print(`Skipped user ${user._id} because subsector is empty or missing`);
  }
});
