import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { LoginModel } from '../models/loginModel';
import { Register } from '../models/register';
import { SingleResponseModel } from '../models/singleResponseModel';
import { TokenModel } from '../models/tokenModel';
import { LocalstorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = "https://localhost:44364/api/auth/"
  role: string;
  name: string = "";
  surname: string = "";
  roles: any[] = [];
  token: any;
  isLoggedIn: boolean = false;
  userId: number;
  email: string;


  constructor(private hhtpClient: HttpClient,private localStorageService:LocalstorageService,
    private router:Router,
    private jwtHelper:JwtHelperService) { }

  login(loginModel: LoginModel) {
    return this.hhtpClient.post<SingleResponseModel<TokenModel>>(this.apiUrl + "login", loginModel)
  }
  register(register: Register) {
    return this.hhtpClient.post<SingleResponseModel<TokenModel>>(this.apiUrl + "register", register)
  }
  isAuthenticated() {
    if (localStorage.getItem("token")) {
      return true;
    } else {
      return false;
    }
  }
 
  userDetailFromToken() {
    this.token = this.localStorageService.getItem("token");
    let decodedToken = this.jwtHelper.decodeToken(this.token);
    let name = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    this.name = name.split(' ')[0];
    let surname = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    this.surname = name.split(' ')[1];
    this.roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    this.userId = parseInt(decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
    this.email = decodedToken["email"];
  }
  roleCheck(roleList: string[]) {
    if (this.roles !== null) {
      roleList.forEach(role => {
        if (this.roles.includes(role)) {
          return true;
        } else {
          return false;
        }
      })
      return true;
    } else {
      return false;
    }
  }

  logout(){
    localStorage.clear();
    this.onRefresh();
    this.router.navigateByUrl('');
    
  }
  async onRefresh() {
    this.router.routeReuseStrategy.shouldReuseRoute = function () { return false }
    const currentUrl = this.router.url + '?'
    return this.router.navigateByUrl(currentUrl).then(() => {
      this.router.navigated = false
      this.router.navigate([this.router.url])
    })
  }
}
