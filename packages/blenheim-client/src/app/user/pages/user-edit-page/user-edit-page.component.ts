import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AbstractControl, AbstractControlOptions, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { format, parseISO, parse, formatISO } from 'date-fns';
import { User } from '@blenheim/model';
import { dateAsTextValidator } from '../../../shared/utility/validators';

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
    password: ['', [Validators.minLength(8)]],
    confirmPassword: [''],
    birthDate: ['', [Validators.required, dateAsTextValidator]],
    address: ['', Validators.required],
    email: ['', Validators.email],
    phoneNumber: [''],
  }, { validators: optionalPasswordValidator } as AbstractControlOptions);

  ngOnInit(): void {
    const u = this.currentUser();
    if (u !== undefined) {
      this.userForm.patchValue({
        firstName: u.firstName,
        lastName: u.lastName,
        birthDate: format(parseISO(u.birthDate ?? ''), 'P'),
        address: u.address,
        email: u.email,
        phoneNumber: u.phoneNumber,
      });
    }
  }

  submitForm() {
    const dob = this.userForm.value.birthDate ? formatISO(parse(this.userForm.value.birthDate, 'P', new Date()), { representation: 'date' }) : '';
    const user: User = {
      username: this.currentUser()?.username ?? '',
      firstName: this.userForm.value.firstName ?? '',
      lastName: this.userForm.value.lastName ?? '',
      birthDate: dob,
      address: this.userForm.value.address ?? '',
      email: this.userForm.value.email ?? '',
      phoneNumber: this.userForm.value.phoneNumber ?? '',
    };
    const password = (this.userForm.value.password && this.userForm.value.password?.length > 0) ? this.userForm.value.password : undefined;
    this._userService.updateUser$(user, password).subscribe(() => {
      this._router.navigate(['/user']);
    });
  }

  cancel() {
    this._router.navigate(['/user']);
  }
}

/** Only validate the password if the user has typed something/anything in the field */
const optionalPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.get('password')?.touched && control.get('password')?.value?.length > 0) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value != confirmPassword.value) {
      return {
        passwordMatchError: true
      }
    }
  }
  return null;
}
