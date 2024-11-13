import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="max-w-md mx-auto">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {}
