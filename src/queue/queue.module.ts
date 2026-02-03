import { Module } from '@nestjs/common';
import { InviteQueueService } from './invite-queue.service';

@Module({
  providers: [InviteQueueService],
  exports: [InviteQueueService],
})
export class QueueModule {}
