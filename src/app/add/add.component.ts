import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { ModuleDataService } from '../module-data.service';
import { PointCloudModule } from '../module.type';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit, OnDestroy {

  form: FormGroup;
  pcModules: PointCloudModule[];
  fs: any;
  private destroy = new Subject();
  private destroy$ = this.destroy.asObservable();

  constructor(
    private modalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private moduleDataService: ModuleDataService) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      moduleName: [null, Validators.required],
      moduleUrl: [null, Validators.required],
      uploadFileCheckbox: [false],
      command: [false],
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  

  async add(){
    if (this.form.invalid)
    {
      this.toastr.error('Please complete the form.', 'Error');
    } 
    else 
    {
      const data: PointCloudModule = {
        id: -1,
        name: this.form.controls.moduleName.value,
        url: this.form.controls.moduleUrl.value,
        needUploadFile: this.form.controls.uploadFileCheckbox.value,
        needCommand: this.form.controls.command.value,
      }
      this.moduleDataService.addModule(data)
      .pipe(
        take(1),
        switchMap(()=> this.moduleDataService.getModules()),
        tap((modules) => this.moduleDataService.handleOnModuleUpdate(modules))
      ).subscribe();
      this.modalRef.hide();
    }
  }

  close(){
    this.modalRef.hide();
  }

}
