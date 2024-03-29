import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideClientHydration } from '@angular/platform-browser';

export const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideClientHydration()
  ]
};
