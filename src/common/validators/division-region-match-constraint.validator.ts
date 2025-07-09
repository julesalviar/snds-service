import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Region } from 'src/common/enums/region.enum';
import { Region12Divisions } from 'src/common/enums/region12-division.enum';

@ValidatorConstraint({ name: 'DivisionRegionMatch', async: false })
export class DivisionRegionMatchConstraint
  implements ValidatorConstraintInterface
{
  validate(_division: string, _args: ValidationArguments) {
    const object = _args.object as any;
    const region = object.region;

    const regionDivisionMap = {
      [Region.Region12]: Object.values(Region12Divisions),
    };

    if (!region || !regionDivisionMap[region]) return false;
    return regionDivisionMap[region].includes(_division);
  }

  defaultMessage(_args: ValidationArguments) {
    return `Division "${_args.value}" is not valid for selected region "${(_args.object as any)?.region}"`;
  }
}
