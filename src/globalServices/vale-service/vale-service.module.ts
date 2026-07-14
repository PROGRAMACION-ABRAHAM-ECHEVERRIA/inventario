import { Global, Module } from "@nestjs/common";
import { ValeService } from "./vale-service.custom";

@Global()
@Module({
  providers: [ValeService],
  exports: [ValeService],
})
export class  ValeModule{}
