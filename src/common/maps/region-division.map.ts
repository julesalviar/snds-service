import { Region } from 'src/common/enums/region.enum';
import { Region12Divisions } from 'src/common/enums/region12-division.enum';

export const regionDivisionMap = {
  [Region.Region12]: Object.values(Region12Divisions),
};
