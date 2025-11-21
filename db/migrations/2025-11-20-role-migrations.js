db.users.updateMany({}, [
  {
    $set: {
      roles: {
        $cond: [
          { $gt: [{ $size: { $ifNull: ['$roles', []] } }, 0] },
          '$roles',
          ['$role'],
        ],
      },
      activeRole: {
        $ifNull: ['$activeRole', '$role'],
      },
    },
  },
]);
