import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { BrowserUtils } from "@azure/msal-browser";
import { LoginComponent } from "./pages/login/login.component";
import { RedefirSenhaComponent } from "./pages/redefir-senha/redefir-senha.component";
import { AuthGuard } from "./shared/services/authGuard/auth.guard.service";
import { NaoAutorizadoComponent } from "./pages/nao-autorizado/nao-autorizado.component";
import { AuthenticateComponent } from "./pages/authenticate/authenticate.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "authenticate",
    component: AuthenticateComponent,
  },
  {
    path: "unauthorized",
    component: NaoAutorizadoComponent,
  },
  {
    path: "redefinir-senha",
    component: RedefirSenhaComponent,
  },
  {
    path: "portal",
      loadChildren: () =>
        import("./portal/portal.module").then((m) => m.PortalModule),
        canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? "enabledNonBlocking" : "disabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
