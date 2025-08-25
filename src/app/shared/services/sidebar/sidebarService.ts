import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  /**
   * Subject RxJS que armazena o estado atual da sidebar (aberta/fechada)
   * @private
   */
  private readonly isSidebarExpanded = new BehaviorSubject<boolean>(this.getInitialSidebarState());

  constructor() {
    this.isSidebarExpanded.subscribe((isOpen) => {
      localStorage.setItem('sidebarState', JSON.stringify(isOpen));
    });
  }

  /**
   * Alterna o estado da sidebar
   * @param {boolean} [state] - Estado opcional para definir explicitamente (true = aberta, false = fechada)
   * Se não fornecido, alterna o estado atual
   */
  public toggleSidebar(state?: boolean) {
    if (state !== undefined) {
      this.isSidebarExpanded.next(state);
    } else {
      this.isSidebarExpanded.next(!this.isSidebarExpanded.value);
    }
  }

  /**
   * Retorna um Observable que emite o estado atual da sidebar
   * @returns {Observable<boolean>} Observable que emite true quando a sidebar está aberta e false quando está fechada
   */
  public getSidebarState() {
    return this.isSidebarExpanded.asObservable();
  }

  /**
   * Obtém o estado inicial da sidebar a partir do localStorage
   * @private
   * @returns {boolean} Estado inicial da sidebar (false se não existir no localStorage)
   */
  private getInitialSidebarState(): boolean {
    const savedState = localStorage.getItem('sidebarState');
    return savedState ? JSON.parse(savedState) : false;
  }
}