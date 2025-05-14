import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { SpinnerStateModel } from "../../models/spinnerState.model";

@Injectable({
  providedIn: "root",
})
export class SpinnerService {
  private spinnerSubject = new Subject<SpinnerStateModel>();
  public spinnerState = this.spinnerSubject.asObservable();

  /**
   * Exibe um load na tela
   */
  show() {
    this.spinnerSubject.next({ show: true } as SpinnerStateModel);
  }

  /**
   * Esconde o load na tela
   */
  hide() {
    this.spinnerSubject.next({ show: false } as SpinnerStateModel);
  }
}
