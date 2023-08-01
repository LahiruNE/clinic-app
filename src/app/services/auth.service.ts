import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, of } from 'rxjs';
import { User } from '../../data/models/user-schema.model';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    private electronService: ElectronService
  ) {
    localStorage.setItem('user', JSON.stringify({}));
  }

  isAuthenticated(): boolean {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString) as User;
      if (user && user.id) {
        return true;
      }
    }   
    return false;
  }

  login(username: string, password: string) {
    return of(
      this.electronService.ipcRenderer.sendSync('authenticate', username, password)
    ).pipe(map((user: User) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      throw new Error('Invalid username or password');
    }));
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/authentication/login']);
  }
}
