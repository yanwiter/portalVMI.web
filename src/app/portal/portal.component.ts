import { Component, inject } from "@angular/core";
import { SidebarService } from "../shared/services/sidebar/sidebarService";
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: "app-portal",
  templateUrl: "./portal.component.html",
  styleUrl: "./portal.component.scss",
})

export class PortalComponent {
  public isSidebarVisible = false;
  public currentYear: number = new Date().getFullYear();
  private readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.sidebarService.getSidebarState().subscribe((isOpen) => {
      this.isSidebarVisible = isOpen;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.sidebarService.getSidebarState().subscribe((isOpen) => {
          this.isSidebarVisible = isOpen;
        });
      }
    });
  }

  isSidebarAllowed(): boolean {
    return true;
  }
}