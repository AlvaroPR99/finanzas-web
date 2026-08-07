import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);
  readonly menuAbierto = signal(false);

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.menuAbierto.set(false);
    });
  }

  toggleMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
