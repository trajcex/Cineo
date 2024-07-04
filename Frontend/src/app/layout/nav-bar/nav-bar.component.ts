import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {

  @Input() signOut: (() => void) | undefined;

  onLogout() {
    if (this.signOut) {
      this.signOut();
    }
  }
  // role: string = '';
  // constructor(private authService: AuthService, private router: Router) {
  // }
  //
  // ngOnInit(): void {
  //   this.authService.userState.subscribe((result) => {
  //     this.role = result;
  //   })
  // }
  //
  // isHomeRoute: boolean = this.router.url === '/home';
  //
  // logOut(): void {
  //   this.authService.logout().subscribe({
  //     next: (_) => {
  //       localStorage.removeItem('user');
  //       this.authService.setUser();
  //       this.router.navigate(['login']);
  //     },
  //     error: (error) => {
  //       localStorage.removeItem('user');
  //       this.authService.setUser();
  //       this.router.navigate(['login']);
  //     }
  //   })
  // }
}
