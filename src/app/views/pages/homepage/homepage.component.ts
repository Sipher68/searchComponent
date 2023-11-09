import { Component } from '@angular/core';
import { SearchComponentComponent } from 'src/app/views/components/search-component/search-component.component';
import { AutoCompleteComponent } from 'src/app/views/components/auto-complete/auto-complete.component';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  imports: [SearchComponentComponent, AutoCompleteComponent],
  standalone: true,
})
export class HomepageComponent {}
