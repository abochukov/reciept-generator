import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

type MailItem = {
  apartament: string;
  mail: string;
}

@Component({
  selector: 'app-receipt-confirmation-mail',
  imports: [],
  templateUrl: './receipt-confirmation-mail.html',
  styleUrl: './receipt-confirmation-mail.scss',
})
export class ReceiptConfirmationMail implements OnInit, OnDestroy {
  mails: MailItem[] = [];
  private mySubject = new Subject();

  constructor() {
    console.log('constructor called');
  }

  async ngOnInit() {
      const response = await fetch('/assets/data/mails.json');
      this.mails = await response.json();
      console.log(this.mails);

      this.mySubject.next(this.mails);

      console.log(this.getMailsObservable());   
  }

  ngOnDestroy() {
    console.log('ng on Destroy');
    this.mySubject.complete();
  }



  getMailsObservable() {
    return this.mySubject.asObservable();
  }


}
