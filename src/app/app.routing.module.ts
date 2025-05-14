import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { BrowserUtils } from "@azure/msal-browser";
import { LoginComponent } from "./pages/login/login.component";
import { RedefirSenhaComponent } from "./pages/redefir-senha/redefir-senha.component";
import { AuthGuard } from "./shared/services/authGuard/auth.guard";
import { NaoAutorizadoComponent } from "./pages/nao-autorizado/nao-autorizado.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "authenticate",
    pathMatch: "full",
  },
  {
    path: "authenticate",
    component: LoginComponent,
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
      initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? "enabledNonBlocking" : "disabled", // Set to enabledBlocking to use Angular Universal
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
