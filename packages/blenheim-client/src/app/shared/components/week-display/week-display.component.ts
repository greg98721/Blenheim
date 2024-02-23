import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FRIDAY, MONDAY, SATURDAY, SUNDAY, THURSDAY, TUESDAY, WEDNESDAY } from '@blenheim/model';

@Component({
  selector: 'app-week-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './week-display.component.html',
  styleUrl: './week-display.component.scss'
})
export class WeekDisplayComponent {
  days = input.required<number>();
  sunday = computed<boolean>(() => (this.days() & SUNDAY) !== 0);
  monday = computed<boolean>(() => (this.days() & MONDAY) !== 0);
  tuesday = computed<boolean>(() => (this.days() & TUESDAY) !== 0);
  wednesday = computed<boolean>(() => (this.days() & WEDNESDAY) !== 0);
  thursday = computed<boolean>(() => (this.days() & THURSDAY) !== 0);
  friday = computed<boolean>(() => (this.days() & FRIDAY) !== 0);
  saturday = computed<boolean>(() => (this.days() & SATURDAY) !== 0);
}
