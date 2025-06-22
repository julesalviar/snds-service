import { Controller, Post, Delete, Patch, Body, Param } from '@nestjs/common';

import { AipService } from './aip.service';
import { AipDto } from 'src/common/dto/aip.dto';

@Controller('aip')
export class AipController {
    constructor(private readonly aipService: AipService) { }

    @Post('create')
    async createNewAip(@Body() aipDto: AipDto) {
        return this.aipService.createAip(aipDto);
    }

    // @Delete(':id')
    // async deleteAip(@Param('id') id: string) {
    //     return this.aipService.deleteAip(id);
    // }


    // @Post('edit')
    // async editAip(@Body() aipDto: AipDto) {
    //     return this.aipService.editAip(AipDto);
    // }


}