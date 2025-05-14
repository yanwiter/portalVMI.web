import { ChangeDetectorRef, Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, BehaviorSubject, Subscription } from "rxjs";
import { SpinnerStateModel } from "./shared/models/spinnerState.model";
import { SpinnerService } from "./shared/services/spinner/spinner.service";

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

  ngOnInit(): void {
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
