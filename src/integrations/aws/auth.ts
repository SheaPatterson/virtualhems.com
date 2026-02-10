// AWS Cognito Authentication Client
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
  ISignUpResult
} from 'amazon-cognito-identity-js';
import { getAWSConfig } from './config';

let userPool: CognitoUserPool | null = null;

async function getUserPool(): Promise<CognitoUserPool> {
  if (userPool) return userPool;
  
  const config = await getAWSConfig();
  userPool = new CognitoUserPool({
    UserPoolId: config.userPoolId,
    ClientId: config.userPoolClientId
  });
  
  return userPool;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
}

// Sign Up
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ userSub: string; userConfirmed: boolean }> {
  const pool = await getUserPool();
  
  const attributes = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    new CognitoUserAttribute({ Name: 'name', Value: `${firstName} ${lastName}` })
  ];
  
  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attributes, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        userSub: result?.userSub || '',
        userConfirmed: result?.userConfirmed || false
      });
    });
  });
}

// Confirm Sign Up
export async function confirmSignUp(email: string, code: string): Promise<void> {
  const pool = await getUserPool();
  const user = new CognitoUser({ Username: email, Pool: pool });
  
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// Sign In
export async function signIn(email: string, password: string): Promise<AuthTokens> {
  const pool = await getUserPool();
  const user = new CognitoUser({ Username: email, Pool: pool });
  const authDetails = new AuthenticationDetails({ Username: email, Password: password });
  
  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session: CognitoUserSession) => {
        resolve({
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken()
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: () => {
        reject(new Error('New password required'));
      }
    });
  });
}

// Sign Out
export async function signOut(): Promise<void> {
  const pool = await getUserPool();
  const user = pool.getCurrentUser();
  
  if (user) {
    user.signOut();
  }
  
  // Clear local storage
  localStorage.removeItem('hems_tokens');
  localStorage.removeItem('hems_user');
}

// Get Current Session
export async function getSession(): Promise<CognitoUserSession | null> {
  const pool = await getUserPool();
  const user = pool.getCurrentUser();
  
  if (!user) return null;
  
  return new Promise((resolve, reject) => {
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(session);
    });
  });
}

// Get Current User
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getSession();
    if (!session) return null;
    
    const idToken = session.getIdToken();
    const payload = idToken.payload;
    
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      emailVerified: payload.email_verified === true
    };
  } catch {
    return null;
  }
}

// Get Access Token (for API calls)
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getSession();
    if (!session) return null;
    return session.getAccessToken().getJwtToken();
  } catch {
    return null;
  }
}

// Get ID Token (for API calls that need user info)
export async function getIdToken(): Promise<string | null> {
  try {
    const session = await getSession();
    if (!session) return null;
    return session.getIdToken().getJwtToken();
  } catch {
    return null;
  }
}

// Resend Confirmation Code
export async function resendConfirmationCode(email: string): Promise<void> {
  const pool = await getUserPool();
  const user = new CognitoUser({ Username: email, Pool: pool });
  
  return new Promise((resolve, reject) => {
    user.resendConfirmationCode((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// Forgot Password
export async function forgotPassword(email: string): Promise<void> {
  const pool = await getUserPool();
  const user = new CognitoUser({ Username: email, Pool: pool });
  
  return new Promise((resolve, reject) => {
    user.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err)
    });
  });
}

// Confirm Password Reset
export async function confirmPassword(email: string, code: string, newPassword: string): Promise<void> {
  const pool = await getUserPool();
  const user = new CognitoUser({ Username: email, Pool: pool });
  
  return new Promise((resolve, reject) => {
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err)
    });
  });
}
