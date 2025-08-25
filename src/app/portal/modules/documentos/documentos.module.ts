import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

// Routing
import { DocumentosRoutingModule } from './documentos.routing.module';

// Components
import { TestePwComponent } from './teste-pw/teste-pw.component';

@NgModule({
  declarations: [
    TestePwComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TreeModule,
    ButtonModule,
    TooltipModule,
    TableModule,
    CheckboxModule,
    TagModule,
    BreadcrumbModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    DocumentosRoutingModule
  ],
  providers: [
    MessageService
  ]
})
export class DocumentosModule { } 