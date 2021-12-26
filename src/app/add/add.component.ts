import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { PointCloudModule } from '../module.type';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {

  form: FormGroup;
  pcModules: PointCloudModule[];
  fs: any;

  constructor(private modalRef: BsModalRef, private formBuilder: FormBuilder, private toastr: ToastrService) { 
    this.pcModules = require("./../../assets/modules.json");
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      moduleName: [null, Validators.required],
      moduleUrl: [null, Validators.required],
      uploadFileCheckbox: [false],
    });
  }
  

  async add(){
    if (this.form.invalid)
    {
      this.toastr.error('Please complete the form.', 'Error');
    } 
    else 
    {
      const data: PointCloudModule = {
        id: this.pcModules.length,
        name: this.form.controls.moduleName.value,
        url: this.form.controls.moduleUrl.value,
        needUploadFile: this.form.controls.uploadFileCheckbox.value,
      }
      this.pcModules.push(data);
      this.modalRef.hide();
    }
  }

  close(){
    this.modalRef.hide();
  }

}
