import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNGModule } from "./primeNG.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NavbarComponent } from "../components/navbar/navbar.component";
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { TitleHeaderComponent } from "../components/title-header/title-header.component";

@NgModule({
  declarations: [
    SidebarComponent,
    NavbarComponent,
    TitleHeaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PrimeNGModule,
    ReactiveFormsModule,
  ],
  exports: [
    SidebarComponent,
    NavbarComponent,
    TitleHeaderComponent,
  ],
})
export class SharedModule { }
