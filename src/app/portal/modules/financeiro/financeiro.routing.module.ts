import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotaFiscalComponent } from "./nota-fiscal/nota-fiscal.component";
import { EmissaoNotaFiscalComponent } from "./nota-fiscal/emissao-nota-fiscal/emissao-nota-fiscal.component";
import { ContasReceberComponent } from "./contas-receber/contas-receber.component";
import { ContasPagarComponent } from "./contas-pagar/contas-pagar.component";
import { FluxoCaixaComponent } from "./fluxo-caixa/fluxo-caixa.component";
import { ConciliacaoBancariaComponent } from "./conciliacao-bancaria/conciliacao-bancaria.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "notas-fiscais",
    pathMatch: "full"
  },
  {
    path: "notas-fiscais",
    component: NotaFiscalComponent,
  },
  {
    path: "emissao-notas-fiscais",
    component: EmissaoNotaFiscalComponent,
  },
  {
    path: "contas-receber",
    component: ContasReceberComponent,
  },
  {
    path: "contas-pagar",
    component: ContasPagarComponent,
  },
  {
    path: "fluxo-caixa",
    component: FluxoCaixaComponent,
  },
  {
    path: "conciliacao",
    component: ConciliacaoBancariaComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceiroRoutingModule { }
