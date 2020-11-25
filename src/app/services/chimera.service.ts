import { Injectable, Inject } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import * as json from '../../assets/json/chimera-animals.json';

const chimeraStatusKey = 'CHIMERA_STATUS';

@Injectable({
  providedIn: 'root'
})
export class ChimeraService {
  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService) {
  }

  dataLoad() {
    let data: Array<any> = [];
    data = json.default.valueOf();
    return data;
  }

  saveChimeraAnimal(key, value) {
    this.storage.set(key, value);
  }

  getChimeraAnimal(key) {
    return this.storage.get(key);
  }

  saveChimeraStatus(value) {
    this.storage.set(chimeraStatusKey, value);
  }

  getChimeraStatus() {
    return this.storage.get(chimeraStatusKey);
  }
}