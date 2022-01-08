import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AddComponent } from './add/add.component';
import { PointCloudModule } from './module.type';
import { Observable, Subject } from 'rxjs';
import { withLatestFrom, map, tap, take } from 'rxjs/operators';
import { ModuleDataService } from './module-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'point-cloud-module-manager';

  form: FormGroup;
  moduleForm: FormGroup;
  pcModules$: Observable<PointCloudModule[]>;
  selectedModule$: Observable<PointCloudModule>;

  private onSelect = new Subject();
  onSelect$ = this.onSelect.asObservable();

  // moduleUIHide$: Observable<boolean>; 
  // = this.onSelect$.pipe(map(()=> (this.selectedModule.id !== null && this.selectedModule.id !== undefined)));
    
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    protected modalService: BsModalService,
    private moduleDataService: ModuleDataService)
  {
    this.moduleDataService.getModules().pipe(tap((modules) => this.moduleDataService.handleOnModuleUpdate(modules))).subscribe();
  }

  ngOnInit(): void {
    this.pcModules$ = this.moduleDataService.onModulesStore$;

    this.form = this.formBuilder.group({
      selectedModuleId: [null, Validators.required],
    });

    this.moduleForm = this.formBuilder.group({
      url: [null, Validators.required],
      files: [null, Validators.required],
      command: [null, Validators.required],
    });

    this.selectedModule$ = this.onSelect$.pipe(
      withLatestFrom(this.form.valueChanges, this.pcModules$),
      map(([_, value, allModules]) => ({value, allModules})),
      map(({ value, allModules })=> {
        if (this.form.invalid || allModules.find((item)=>item.id === value.selectedModuleId) == null){
          this.toastr.info('Please Select a module', 'Info');
          return null;
        }else{
          const selection = allModules.find((item)=>item.id === value.selectedModuleId)
          this.moduleForm.controls.url.setValue(selection.url);
          return selection
        }
      }));
  }

  submit(){
    if (this.form.invalid) 
    {
      this.toastr.info('Please Select a module', 'Info');
    }
    this.onSelect.next();
  }

  openModal() {
    this.modalService.show(AddComponent, {
      backdrop: true, 
      ignoreBackdropClick: true,
      keyboard: false,
      animated: true,
      class: 'modal-lg'
    });
  }

  execute(){
    if (this.moduleForm.invalid) 
    {
      this.toastr.info('Please fill all fields', 'Info');
    } else {
      this.moduleDataService.executeModule(this.moduleForm.value).pipe(take(1)).subscribe();
    }
  }

}

