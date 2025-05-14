import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routing.module";
import { BrowserAnimationsModule, NoopAnimationsModule } from "@angular/platform-browser/animations";
import { PortalModule } from "./portal/portal.module";
import { LoginComponent } from "./pages/login/login.component";
import { SharedModule } from "./shared/modules/shared.module";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { HttpClientModule } from "@angular/common/http";
import { PrimeNGModule } from "./shared/modules/primeNG.module";
import { RedefirSenhaComponent } from "./pages/redefir-senha/redefir-senha.component";

@NgModule({
  declarations: [LoginComponent, RedefirSenhaComponent, AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    BrowserAnimationsModule,
    PortalModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PrimeNGModule,
    HttpClientModule,
  ], 
  providers: [
    DialogService,
    ConfirmationService,
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
