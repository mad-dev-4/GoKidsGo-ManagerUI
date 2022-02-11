import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginserviceService {
  private isModal = false;
  private errorMessageKey = '';

  constructor() { }

  public setIsModal(trueOrFalse) {
    this.isModal = trueOrFalse;
  }
  public getIsModal() {
    return this.isModal;
  }

  public setErrorMessageKey(errorMessage) {
    this.errorMessageKey = errorMessage;
  }
  public getErrorMessageKey() {
    return this.errorMessageKey;
  }
}
