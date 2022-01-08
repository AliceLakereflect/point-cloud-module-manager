import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map, tap } from "rxjs/operators";
import { HttpService } from "./http.service";
import { PointCloudModule } from "./module.type";

@Injectable({
    providedIn: 'root'
})
export class ModuleDataService {
    baseUrl = "http://localhost:5000/api/"
    onModulesStore$: Observable<PointCloudModule[]>;
    private onModulesStore = new BehaviorSubject<PointCloudModule[]>(null);

    constructor(private httpService: HttpService) { 
        this.onModulesStore$ = this.onModulesStore.asObservable();
    }

    getModules(){
        return this.httpService.httpGet<PointCloudModule[]>(`${this.baseUrl}ModuleData/`).pipe(
            map((res) => res.body ));
    }

    addModule(newModule: PointCloudModule){
        console.log("addModule");
        return this.httpService.httpPost<PointCloudModule>(`${this.baseUrl}ModuleData/`, newModule);
    }

    updateModule(newModule: PointCloudModule){
        return this.httpService.httpPut(`${this.baseUrl}ModuleData/`, newModule).pipe(
            map((res) => res.body ));
    }

    executeModule(module){
        const requestBody = {
            url: module.url,
            files: module.files,
            command: module.command
        }
        // TODO: update endpoint
        return this.httpService.httpPost(`${this.baseUrl}MicroService/`, requestBody);
    }

    handleOnModuleUpdate(modules: PointCloudModule[]){
        this.onModulesStore.next(modules);
    }
}