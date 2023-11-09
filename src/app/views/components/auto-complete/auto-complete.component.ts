import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  filter,
  startWith,
  switchMap,
  map,
} from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, AsyncPipe, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { catchError } from 'rxjs/operators';

import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatChipsModule,
    NgFor,
    NgIf,
    MatIconModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
})
export class AutoCompleteComponent {
  separatorKeysCodes: number[] = [ENTER, COMMA];

  // API based variables
  placeCtrl = new FormControl();
  filteredPlaces: Observable<any[]>;
  allPlaces: any[] = [];
  selectedPlace: any[] = [];
  selectedValue: any;
  cachedValues: any[] = [];

  // Input value observables

  @ViewChild('placeInput') placeInput!: ElementRef<HTMLInputElement>;
  @ViewChild('trigger', { static: false })
  autoCompleteTrigger!: MatAutocompleteTrigger;
  places$!: Observable<Observable<any[]>>;

  constructor(
    private apiService: ApiService,
    private announcer: LiveAnnouncer
  ) {
    this.filteredPlaces = this.placeCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      filter((val) => val !== null && val.length >= 3),
      switchMap((val) => (val ? this.filter(val) : of(this.cachedValues)))
    );
  }

  ngOnInit() {
    this.places$ = (this.placeCtrl.valueChanges || of(null)).pipe(
      startWith(null),
      map((value) => (value ? this.filteredPlaces : of(this.cachedValues)))
    );

    this.placeCtrl.valueChanges
      .pipe(startWith(''), debounceTime(100))
      .subscribe((val) => {
        if (val === null || val.length < 1) {
          this.autoCompleteTrigger.closePanel();
        }
      });
  }

  // Load the cached values from the local storage
  loadCachedValues() {
    this.cachedValues = JSON.parse(
      localStorage.getItem('selectedValues') || '[]'
    );
  }

  // Filter the list of places based on the input string
  filter(val: string): Observable<any[]> {
    return this.apiService.getPlaces(val.trim().split(/[ ]+/).join('+')).pipe(
      catchError((error) => {
        console.error('Error occurred:', error);
        return of([]); // return an empty array on error
      })
    );
  }

  // Add a place to the selectedPlace array
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our place
    if (value) {
      this.selectedPlace.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.placeCtrl.setValue('null');
  }

  remove(place: string): void {
    const index = this.selectedPlace.indexOf(place);

    if (index >= 0) {
      this.selectedPlace.splice(index, 1);
      this.announcer.announce(`Removed ${place}`);
    }
    this.placeCtrl.enable();
  }

  selected(event: any): void {
    this.selectedValue = event.option.value;
    this.selectedPlace.push(event.option.viewValue);
    this.placeCtrl.setValue(null);
    console.log('Selected value: ', this.selectedValue);
    this.placeCtrl.disable();

    // Cache the selected place into the local storage
    let cachedValues = JSON.parse(
      localStorage.getItem('selectedValues') || '[]'
    );
    cachedValues.unshift(this.selectedValue);
    localStorage.setItem('selectedValues', JSON.stringify(cachedValues));

    console.log('Cached values: ', cachedValues);
  }
}
