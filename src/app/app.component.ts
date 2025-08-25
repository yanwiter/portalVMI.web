import { ChangeDetectorRef, Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, BehaviorSubject, Subscription } from "rxjs";
import { SpinnerStateModel } from "./shared/models/spinnerState.model";
import { SpinnerService } from "./shared/services/spinner/spinner.service";
import { VersionCheckService } from "./shared/services/VersionCheck/versionCheck.service";
import { SensitiveDataService } from "./shared/services/sensitive-data.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})

export class AppComponent {

  public show$: Subject<boolean> = new BehaviorSubject(false);
  private subscriptionSpinner: Subscription = new Subscription();
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroy = inject(DestroyRef);
  private readonly spinnerService = inject(SpinnerService);
  private readonly checkVersionService = inject(VersionCheckService);
  private readonly sensitiveDataService = inject(SensitiveDataService);

  ngOnInit(): void {
    this.checkVersionService.initVersionCheck();
    
    // Inicializa o sistema de dados sensíveis globalmente
    this.sensitiveDataService.initializeGlobalSensitiveData();
    
    this.subscriptionSpinner = this.spinnerService.spinnerState.pipe(
      takeUntilDestroyed(this.destroy)).subscribe((state: SpinnerStateModel) => {
        this.show$.next(state.show);
        this.changeDetectorRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.subscriptionSpinner.unsubscribe();
  }

}
