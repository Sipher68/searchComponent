import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, inject, OnInit } from '@angular/core';
import { PlacesInterface } from 'src/app/places.interface';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor, AsyncPipe, NgIf } from '@angular/common';

// Angular Material Imports
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSelectModule } from '@angular/material/select';

import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search-component',
  templateUrl: './search-component.component.html',
  styleUrls: ['./search-component.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatChipsModule,
    NgFor,
    MatIconModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatSelectModule,
    NgIf,
  ],
})
export class SearchComponentComponent implements OnInit {
  // Normal Search
  searchValue = '';
  // store all places
  places: PlacesInterface[] | null = null;
  // Store selected Place
  selectedPlace: PlacesInterface[] = [];
  // store places by input filter
  filteredList: any[] = [];
  selectedValue: PlacesInterface[] = [];

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  announcer = inject(LiveAnnouncer);
  addOnBlur = true;

  searchForm = this.formBuilder.nonNullable.group({
    searchValue: '',
  });

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Define an Observable that emits a value every 500ms and subscribe to it to trigger the onSearch method.
   */
  ngOnInit(): void {
    this.searchForm
      .get('searchValue')!
      .valueChanges.pipe(debounceTime(500))
      .subscribe(() => {
        this.onSearch();
      });
  }

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) {}

  /**
   * Handles the search functionality by calling the API service to get a list of places based on the search value.
   * If the search value is empty or null, the filtered list is set to an empty array.
   * Otherwise, the filtered list is set to the list of places returned by the API service.
   */
  onSearch(): void {
    const searchValue = this.searchForm.value.searchValue ?? '';
    if (searchValue === '' || null) {
      this.filteredList = [];
    } else {
      this.apiService
        .getPlaces(searchValue.trim().split(/[ ]+/).join('+'))
        .subscribe((places) => {
          this.places = places;
          this.filteredList = this.places;
          console.log(this.filteredList);
        });
    }
  }
  /**
   * Updates the selected value and logs it to the console.
   * @param filtered - The filtered value to be selected.
   */
  onSelect(filtered: any) {
    this.selectedValue = filtered;
    console.log(this.selectedValue);
    this.searchForm.controls['searchValue'].setValue(filtered.name);
  }
}
