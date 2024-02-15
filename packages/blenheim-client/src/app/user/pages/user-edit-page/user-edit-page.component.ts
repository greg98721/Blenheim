import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { format, parseISO, parse, formatISO } from 'date-fns';
import { User } from '@blenheim/model';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatIconModule, MatTooltipModule, MatFormFieldModule, MatInputModule],
  templateUrl: './user-edit-page.component.html',
  styleUrl: './user-edit-page.component.scss'
})
export class UserEditPageComponent implements OnInit {
  private _router = inject(Router);
  private _fb = inject(FormBuilder);

  private _userService = inject(UserService);
  currentUser = this._userService.currentUser;
  isNewUser = computed(() => this.currentUser === undefined);

  userForm = this._fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    birthDate: ['', Validators.required],
    address: ['', Validators.required],
    email: ['', Validators.email],
    phoneNumber: [''],
  });

  ngOnInit(): void {
    const u = this.currentUser();
    if (u !== undefined) {
      this.userForm.patchValue({
        firstName: u.firstName,
        lastName: u.lastName,
        birthDate: format(parseISO(u.birthDate??''), 'P'),
        address: u.address,
        email: u.email,
        phoneNumber: u.phoneNumber,
      });
    }
  }

  submitForm() {
    const dob = this.userForm.value.birthDate ? formatISO(parse(this.userForm.value.birthDate, 'P', new Date()), { representation: 'date' }) : '';
    const u: User = {
      username: this.currentUser()?.username ?? '',
      firstName: this.userForm.value.firstName ?? '',
      lastName: this.userForm.value.lastName ?? '',
      birthDate: dob,
      address: this.userForm.value.address ?? '',
      email: this.userForm.value.email ?? '',
      phoneNumber: this.userForm.value.phoneNumber ?? '',
    };
    this._userService.updateUser$(u).subscribe(() => {
      this._router.navigate(['/user']);
    });
  }

  cancel() {
    this._router.navigate(['/user']);
  }
}
