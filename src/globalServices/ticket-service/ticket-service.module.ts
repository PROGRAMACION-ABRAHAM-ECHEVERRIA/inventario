import { Global, Module } from "@nestjs/common";
import { TicketService } from "./ticket-service-custom";

@Global()
@Module({
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}