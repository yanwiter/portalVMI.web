import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
/* import { GestaoDocumentalComponent } from "./gestao-documental/gestao-documental.component";
import { ControleVersoesComponent } from "./controle-versoes/controle-versoes.component";
import { AssinaturaDigitalComponent } from "./assinatura-digital/assinatura-digital.component";
import { ArquivosNuvemComponent } from "./arquivos-nuvem/arquivos-nuvem.component"; */
import { TestePwComponent } from "./teste-pw/teste-pw.component";

const routes: Routes = [

  {
    path: "teste-pw",
    component: TestePwComponent,
  },
  /* {
    path: "gestao",
    component: GestaoDocumentalComponent,
  },
  {
    path: "versoes",
    component: ControleVersoesComponent,
  },
  {
    path: "assinatura",
    component: AssinaturaDigitalComponent,
  },
  {
    path: "nuvem",
    component: ArquivosNuvemComponent,
  }, */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentosRoutingModule { } 