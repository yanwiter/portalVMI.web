import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PrimeNGModule } from "./primeNG.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { TitleHeaderComponent } from "../components/title-header/title-header.component";
import { CounterAnimationDirective } from "../directive/CounterAnimation.directive";
import { ColumnConfigComponent } from "../components/column-config/column-config.component";
import { TranslateModule } from "@ngx-translate/core";
import { UserMenuComponent } from "../components/user-menu/user-menu.component";
import { BreadcrumbComponent } from "../components/breadcrumb/breadcrumb.component";
import { NotificationComponent } from "../components/notification/notification.component";
import { SensitiveDataIndicatorComponent } from "../components/sensitive-data-indicator/sensitive-data-indicator.component";
import { SensitiveDataDirective } from "../directives/sensitive-data.directive";

@NgModule({
  declarations: [
    ColumnConfigComponent,
    SidebarComponent,
    TitleHeaderComponent,
    CounterAnimationDirective,
    UserMenuComponent,
    BreadcrumbComponent,
    NotificationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PrimeNGModule,
    ReactiveFormsModule,
    DragDropModule,
    TranslateModule,
    SensitiveDataIndicatorComponent,
    SensitiveDataDirective
  ],
  exports: [
    ColumnConfigComponent,
    SidebarComponent,
    TitleHeaderComponent,
    CounterAnimationDirective,
    TranslateModule,
    UserMenuComponent,
    BreadcrumbComponent,
    NotificationComponent,
    SensitiveDataIndicatorComponent,
    SensitiveDataDirective
  ]
})
export class SharedModule { }