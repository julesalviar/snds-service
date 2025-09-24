import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClusterDto, UpdateClusterDto } from './cluster.dto';
import { ClusterService } from './cluster.service';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller('clusters')
export class ClusterController {
  constructor(private readonly clusterService: ClusterService) {}

  @PermissionsAllowed(PermissionsEnum.CLUSTER_MANAGE)
  @Post()
  async createCluster(@Body() clusterDto: ClusterDto) {
    return this.clusterService.createCluster(clusterDto);
  }

  @PermissionsAllowed(PermissionsEnum.CLUSTER_MANAGE)
  @Delete(':id')
  async deleteCluster(@Param('id') id: string) {
    return this.clusterService.deleteCluster(id);
  }

  @PermissionsAllowed(PermissionsEnum.CLUSTER_VIEW)
  @Get(':param')
  async getCluster(@Param('param') param: string) {
    return this.clusterService.getCluster(param);
  }

  @PermissionsAllowed(PermissionsEnum.CLUSTER_VIEW)
  @Get()
  async getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('division') division?: string,
  ) {
    return this.clusterService.getAll(
      Number(page),
      Number(limit),
      division,
    );
  }

  @PermissionsAllowed(PermissionsEnum.CLUSTER_MANAGE)
  @Put(':id')
  async editCluster(
    @Param('id') id: string,
    @Body() updateClusterDto: UpdateClusterDto,
  ) {
    return this.clusterService.updateCluster(id, updateClusterDto);
  }
}
