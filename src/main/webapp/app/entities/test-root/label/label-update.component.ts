import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiAlertService } from 'ng-jhipster';
import { ILabel, Label } from 'app/shared/model/test-root/label.model';
import { LabelService } from './label.service';
import { IOperation } from 'app/shared/model/test-root/operation.model';
import { OperationService } from 'app/entities/test-root/operation';

@Component({
  selector: 'jhi-label-update',
  templateUrl: './label-update.component.html'
})
export class LabelUpdateComponent implements OnInit {
  isSaving: boolean;

  operations: IOperation[];

  editForm = this.fb.group({
    id: [],
    labelName: [null, [Validators.required, Validators.minLength(3)]]
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected labelService: LabelService,
    protected operationService: OperationService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ label }) => {
      this.updateForm(label);
    });
    this.operationService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IOperation[]>) => mayBeOk.ok),
        map((response: HttpResponse<IOperation[]>) => response.body)
      )
      .subscribe((res: IOperation[]) => (this.operations = res), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(label: ILabel) {
    this.editForm.patchValue({
      id: label.id,
      labelName: label.labelName
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const label = this.createFromForm();
    if (label.id !== undefined) {
      this.subscribeToSaveResponse(this.labelService.update(label));
    } else {
      this.subscribeToSaveResponse(this.labelService.create(label));
    }
  }

  private createFromForm(): ILabel {
    return {
      ...new Label(),
      id: this.editForm.get(['id']).value,
      labelName: this.editForm.get(['labelName']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILabel>>) {
    result.subscribe(() => this.onSaveSuccess(), () => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackOperationById(index: number, item: IOperation) {
    return item.id;
  }

  getSelected(selectedVals: Array<any>, option: any) {
    if (selectedVals) {
      for (let i = 0; i < selectedVals.length; i++) {
        if (option.id === selectedVals[i].id) {
          return selectedVals[i];
        }
      }
    }
    return option;
  }
}
