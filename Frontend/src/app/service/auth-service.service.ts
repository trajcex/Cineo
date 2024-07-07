import { Injectable } from '@angular/core';
import {
  AuthUser,
  getCurrentUser,
  signOut,
  fetchAuthSession,
  AuthTokens,
  decodeJWT,
} from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  constructor() {}

  async getCurrentUser(): Promise<AuthUser> {
    return await getCurrentUser();
  }

  async getCurrentSession(): Promise<AuthTokens | undefined> {
    return (await fetchAuthSession()).tokens;
  }

  async getCurrentUserFullName(): Promise<string | undefined> {
    let cognitoToken = await (await fetchAuthSession()).tokens;
    return cognitoToken?.idToken?.payload['nickname']?.toString();
  }

  public getCurrentRole(): string {
    try {
      const decodedToken: any = decodeJWT(
        this.getAccessTokenFromLocalStorage() || ''
      );
      const roles: string[] | undefined =
        decodedToken['payload']['cognito:groups'];
      if (roles && roles.length > 0) {
        return roles[0];
      } else {
        return '';
      }
    } catch (error) {
      console.error('Error decoding accessToken:', error);
      return '';
    }
  }

  public getUserID(): string {
    try {
      const decodedToken: any = decodeJWT(
        this.getAccessTokenFromLocalStorage() || ''
      );
      const roles: string | undefined = decodedToken['payload']['sub'];
      if (roles && roles.length > 0) {
        return roles;
      } else {
        return '';
      }
    } catch (error) {
      console.error('Error decoding accessToken:', error);
      return '';
    }
  }
  public getEmail(): string {
    try {
      const decodedToken: any = decodeJWT(
        this.getAccessTokenFromLocalStorage() || ''
      );
      const roles: string | undefined = decodedToken['payload']['username'];
      if (roles && roles.length > 0) {
        return roles;
      } else {
        return '';
      }
    } catch (error) {
      console.error('Error decoding accessToken:', error);
      return '';
    }
  }
  signOut() {
    signOut();
  }

  public getAccessTokenFromLocalStorage() {
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      if (key?.includes('accessToken')) {
        return localStorage.getItem(key);
      }
    }
    return null;
  }
}
