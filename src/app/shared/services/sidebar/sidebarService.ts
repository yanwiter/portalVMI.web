import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly isSidebarOpen = new BehaviorSubject<boolean>(this.getInitialSidebarState());

  constructor() {
    this.isSidebarOpen.subscribe((isOpen) => {
      localStorage.setItem('sidebarState', JSON.stringify(isOpen));
    });
  }

  toggleSidebar(state?: boolean) {
    if (state !== undefined) {
      this.isSidebarOpen.next(state);
    } else {
      this.isSidebarOpen.next(!this.isSidebarOpen.value);
    }
  }

  getSidebarState() {
    return this.isSidebarOpen.asObservable();
  }

  private getInitialSidebarState(): boolean {
    const savedState = localStorage.getItem('sidebarState');
    return savedState ? JSON.parse(savedState) : false;
  }
}