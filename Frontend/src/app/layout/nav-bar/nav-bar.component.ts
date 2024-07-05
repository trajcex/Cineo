import {Component, Input} from '@angular/core';
import {AuthServiceService} from "../../service/auth-service.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {

  role: string = '';
  constructor(private auth: AuthServiceService, private router: Router) {
  }
  onLogout() {
    this.auth.signOut();
  }

  ngOnInit(): void {
    this.role = this.auth.getCurrentRole();
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
