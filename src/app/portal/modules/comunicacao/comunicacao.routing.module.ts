import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ChatInternoComponent } from "./chat-interno/chat-interno.component";
import { NotificacoesComponent } from "./notificacoes/notificacoes.component";
import { EmailComponent } from "./email/email.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "chat",
    pathMatch: "full"
  },
  {
    path: "chat",
    component: ChatInternoComponent,
  },
  {
    path: "notificacoes",
    component: NotificacoesComponent,
  },
  {
    path: "email",
    component: EmailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComunicacaoRoutingModule { } 