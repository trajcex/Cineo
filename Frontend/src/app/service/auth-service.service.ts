import { Injectable } from '@angular/core';
import {
  AuthUser,
  getCurrentUser,
  signOut,
  fetchAuthSession,
  AuthTokens,
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

  signOut() {
    signOut();
  }
}
