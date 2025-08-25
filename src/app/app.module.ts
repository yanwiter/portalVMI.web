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
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { PrimeNGModule } from "./shared/modules/primeNG.module";
import { RedefirSenhaComponent } from "./pages/redefir-senha/redefir-senha.component";
import { AuthenticateComponent } from "./pages/authenticate/authenticate.component";
import { HttpClient } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { JwtInterceptor } from "./shared/interceptors/jwt.interceptor";

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [LoginComponent, AuthenticateComponent, RedefirSenhaComponent, AppComponent],
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
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'pt'
    }),
  ], 
  providers: [
    DialogService,
    ConfirmationService,
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
