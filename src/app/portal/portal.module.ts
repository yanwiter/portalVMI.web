import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PortalRoutingModule } from "./portal-routing.module";
import { RouterOutlet } from "@angular/router";
import { PortalComponent } from "./portal.component";
import { FormsModule } from "@angular/forms";
import { PrimeNGModule } from "../shared/modules/primeNG.module";
import { SharedModule } from "../shared/modules/shared.module";
import { DialogService } from "primeng/dynamicdialog";
import { ConfirmationService } from "primeng/api";
import { AppHeaderComponent } from "../shared/components/app-header/app-header.component";

@NgModule({
  declarations: [PortalComponent],
  imports: [
    PortalRoutingModule,
    RouterOutlet,
    CommonModule,
    PrimeNGModule,
    SharedModule,
    FormsModule,
    AppHeaderComponent
  ],
  providers: [DialogService, ConfirmationService],
})
export class PortalModule { }
