import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { format } from 'date-fns/fp';

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
        birthDate: format('P', new Date()),
        address: this.currentUser()?.address,
        email: this.currentUser()?.email,
        phoneNumber: this.currentUser()?.phoneNumber,
      });
    }
  }

  submitForm() {
    if (this.userForm.valid) {
      // this._userService.updateUser(this.userForm.value);
      this._router.navigate(['/user']);
    }
  }
}
