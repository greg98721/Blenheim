import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {

  showToolbar = signal<boolean>(false);
  // We need this separate to the user service as that is dependent on HttpClient which is not available in the precompiled parts of the app
  userName = signal<{ first: string, last: string } | undefined>(undefined);
}
