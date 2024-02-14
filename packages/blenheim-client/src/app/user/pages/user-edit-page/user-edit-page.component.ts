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
import { format, parse } from 'date-fns';
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
    username: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    birthDate: ['', Validators.required],
    address: ['', Validators.required],
    email: ['', Validators.email],
    phoneNumber: [''],
  });

  ngOnInit(): void {
    if (this.currentUser !== undefined) {
      this.userForm.patchValue({
        username: this.currentUser()?.username,
        firstName: this.currentUser()?.firstName,
        lastName: this.currentUser()?.lastName,
        birthDate: format(new Date(), 'P'),
        address: this.currentUser()?.address,
        email: this.currentUser()?.email,
        phoneNumber: this.currentUser()?.phoneNumber,
      });

      // we are using the user name as the key, so we don't want to allow it to be changed
      this.userForm.get('username')?.disable();
    }
  }

  submitForm() {
    const bd = parse((this.userForm.value.birthDate ?? ''), 'P', new Date());
    const u: User = {
      username: this.userForm.value.username ?? '',
      firstName: this.userForm.value.firstName ?? '',
      lastName: this.userForm.value.lastName ?? '',
      birthDate: bd,
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
