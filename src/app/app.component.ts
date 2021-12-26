import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AddComponent } from './add/add.component';
import { PointCloudModule } from './module.type';
import { combineLatest, Observable, Subject } from 'rxjs';
import { tap, takeUntil, filter, withLatestFrom, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'point-cloud-module-manager';

  form: FormGroup;
  pcModules: PointCloudModule[];
  selectedModule$: Observable<PointCloudModule>;

  private destroy = new Subject();
  private destroy$ = this.destroy.asObservable();
  private onSelect = new Subject();
  onSelect$ = this.onSelect.asObservable();

  // moduleUIHide$: Observable<boolean>; 
  // = this.onSelect$.pipe(map(()=> (this.selectedModule.id !== null && this.selectedModule.id !== undefined)));
    
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService, protected modalService: BsModalService){
    this.pcModules = require("./../assets/modules.json");
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      selectedModuleId: [null, Validators.required],
    });

    this.selectedModule$ = this.onSelect$.pipe(
      withLatestFrom(this.form.valueChanges),
      map(([_,value])=> {
        if (this.form.invalid || this.pcModules.find((item)=>item.id === value.selectedModuleId) == null){
          this.toastr.info('Please Select a module', 'Info');
          return null;
        }else{
          return this.pcModules.find((item)=>item.id === value.selectedModuleId)
        }
      }))
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
}

