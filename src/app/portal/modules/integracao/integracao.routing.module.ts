import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ApisComponent } from "./apis/apis.component";
import { WebhooksComponent } from "./webhooks/webhooks.component";
import { SincronizacaoComponent } from "./sincronizacao/sincronizacao.component";
import { SistemasExternosComponent } from "./sistemas-externos/sistemas-externos.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "apis",
    pathMatch: "full"
  },
  {
    path: "apis",
    component: ApisComponent,
  },
  {
    path: "webhooks",
    component: WebhooksComponent,
  },
  {
    path: "sincronizacao",
    component: SincronizacaoComponent,
  },
  {
    path: "sistemas",
    component: SistemasExternosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntegracaoRoutingModule { } 