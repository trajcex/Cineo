import { Component } from '@angular/core';
import { LambdaService } from 'src/app/service/lambda.service';

@Component({
  selector: 'app-my-subscriptions',
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.css'],
})
export class MySubscriptionsComponent {
  constructor(private lambdaService: LambdaService) {}
}
