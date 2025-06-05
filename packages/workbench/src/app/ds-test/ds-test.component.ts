import { Component } from '@angular/core';
import {ButtonModule} from "primeng/button";
import {Ripple} from "primeng/ripple";
import {InputText} from "primeng/inputtext";
import {InputNumber} from "primeng/inputnumber";
import {FormsModule} from "@angular/forms";
import {Password} from "primeng/password";
import {Textarea} from "primeng/textarea";
import {Card} from "primeng/card";

@Component({
    selector: 'app-ds-test',
  imports: [ButtonModule, Ripple, InputText, InputNumber, FormsModule, Password, Textarea, Card],
    templateUrl: './ds-test.component.html',
    styleUrl: './ds-test.component.scss'
})
export class DsTestComponent {
  numberValue = 123456;
  passwordValue = 'secret password';
  textAreaValue = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus velit non turpis placerat, id ullamcorper nunc dignissim. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus velit non turpis placerat, id ullamcorper nunc dignissim. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus velit non turpis placerat, id ullamcorper nunc dignissim. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus velit non turpis placerat, id ullamcorper nunc dignissim. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus velit non turpis placerat, id ullamcorper nunc dignissim. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus velit non turpis placerat, id ullamcorper nunc dignissim. Nulla facilisi. Donec sagittis est non';

}
