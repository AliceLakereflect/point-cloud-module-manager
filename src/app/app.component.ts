import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'point-cloud-module-manager';

  form: FormGroup;
  pcModules;
  moduleUIHide = true;

  constructor(private formBuilder: FormBuilder, private toastr: ToastrService){
    this.pcModules = require("./../assets/modules.json");
    
  }
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      selectedModule: [1, Validators.required],
    });
  }

  submit(){
    if (this.form.invalid) 
    {
      this.toastr.info('Please Select a module', 'Info');
    } else {
      this.moduleUIHide = !this.moduleUIHide;
    }
  }
}
