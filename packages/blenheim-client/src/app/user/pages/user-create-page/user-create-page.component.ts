import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { parse, formatISO } from 'date-fns';
import { User } from '@blenheim/model';
import { dateAsTextValidator } from '../../../shared/utility/validators';

@Component({
  selector: 'app-user-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatIconModule, MatTooltipModule, MatFormFieldModule, MatInputModule],
  templateUrl: './user-create-page.component.html',
  styleUrl: './user-create-page.component.scss'
})
export class UserCreatePageComponent {
  private _router = inject(Router);
  private _fb = inject(FormBuilder);

  private _userService = inject(UserService);
  currentUser = this._userService.currentUser;
  isNewUser = computed(() => this.currentUser === undefined);

  userForm = this._fb.nonNullable.group({
    username: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: [''],
    birthDate: ['', [Validators.required, dateAsTextValidator]],
    address: ['', Validators.required],
    email: ['', Validators.email],
    phoneNumber: [''],
  }, { validators: passwordValidator } as AbstractControlOptions);

  submitForm() {
    const dob = this.userForm.value.birthDate ? formatISO(parse(this.userForm.value.birthDate, 'P', new Date()), { representation: 'date' }) : '';
    const user: User = {
      username: this.userForm.value.username ?? '',
      firstName: this.userForm.value.firstName ?? '',
      lastName: this.userForm.value.lastName ?? '',
      birthDate: dob,
      address: this.userForm.value.address ?? '',
      email: this.userForm.value.email ?? '',
      phoneNumber: this.userForm.value.phoneNumber ?? '',
    };
    const password = this.userForm.value.password;
    if (password) {
      this._userService.createUser$(user, password).subscribe((result) => {
        if (result === true) {
          this._router.navigate(['/user']);
        }
      });
    }
  }

  cancel() {
    this._router.navigate(['/user']);
  }

}

const passwordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value != confirmPassword.value) {
    return {
      passwordMatchError: true
    }
  }
  return null;
}
