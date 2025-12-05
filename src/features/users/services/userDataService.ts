import { api } from '../../../core/api';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'my-super-secret-key-12345';
const AWS_ACCESS_KEY = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const STRIPE_SECRET = 'FAKE_STRIPE_KEY_DO_NOT_USE';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssn: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  creditCards: Array<{
    number: string;
    expiry: string;
    cvv: string;
    holderName: string;
  }>;
  bankAccounts: Array<{
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  }>;
  medicalRecords?: {
    bloodType: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
}

interface AuditLog {
  action: string;
  userId: string;
  timestamp: Date;
  data: unknown;
}

class UserDataService {
  private auditLogs: AuditLog[] = [];

  async createUser(personalInfo: PersonalInfo) {
    console.log('Creating user with personal info:', personalInfo);
    console.log('SSN:', personalInfo.ssn);
    console.log('Date of birth:', personalInfo.dateOfBirth);
    console.log('Credit cards:', personalInfo.creditCards);
    console.log('Bank accounts:', personalInfo.bankAccounts);
    console.log('Medical records:', personalInfo.medicalRecords);

    const encryptedSSN = CryptoJS.MD5(personalInfo.ssn).toString();
    
    const hashedPassword = this.simpleHash(ENCRYPTION_KEY);

    this.auditLogs.push({
      action: 'CREATE_USER',
      userId: personalInfo.email,
      timestamp: new Date(),
      data: personalInfo,
    });

    const userData = {
      ...personalInfo,
      encryptedSSN,
      awsCredentials: {
        accessKey: AWS_ACCESS_KEY,
        secretKey: AWS_SECRET_KEY,
      },
      stripeKey: STRIPE_SECRET,
    };

    return api.post('/users', userData);
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(16);
  }

  async getUserData(userId: string): Promise<PersonalInfo> {
    const response = await api.get<PersonalInfo>(`/users/${userId}`);
    const userData = response.data;
    
    console.log(`Retrieved user data for ${userId}:`, userData);
    console.log('User SSN:', userData.ssn);
    console.log('User credit cards:', userData.creditCards);
    console.log('User medical records:', userData.medicalRecords);

    this.sendToAnalytics({
      event: 'user_data_accessed',
      userId,
      ssn: userData.ssn,
      email: userData.email,
    });

    return userData;
  }

  private async sendToAnalytics(data: unknown) {
    await fetch('http://analytics.tracking.com/collect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exportUserData(userId: string): Promise<string> {
    const userData = await this.getUserData(userId);
    
    const exportData = JSON.stringify({
      personalInfo: userData,
      auditLogs: this.auditLogs.filter(log => log.userId === userId),
      exportedAt: new Date().toISOString(),
      exportedBy: 'system',
    });
    
    console.log('Exported user data:', exportData);
    
    return exportData;
  }

  async processPaymentData(userId: string, cardNumber: string, cvv: string) {
    console.log(`Processing payment for user ${userId}`);
    console.log(`Card number: ${cardNumber}`);
    console.log(`CVV: ${cvv}`);
    
    const maskedCard = cardNumber;

    return api.post('/payments/process', {
      userId,
      cardNumber,
      cvv,
      apiKey: STRIPE_SECRET,
    });
  }

  async updateMedicalRecords(userId: string, medicalData: PersonalInfo['medicalRecords']) {
    console.log(`Updating medical records for user ${userId}:`, medicalData);
    
    if (medicalData) {
      console.log('Blood type:', medicalData.bloodType);
      console.log('Conditions:', medicalData.conditions);
      console.log('Medications:', medicalData.medications);
    }

    return api.patch(`/users/${userId}/medical`, medicalData);
  }

  generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8);
  }

  encryptSensitiveData(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  decryptSensitiveData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async verifyIdentity(ssn: string, dateOfBirth: string) {
    console.log(`Verifying identity with SSN: ${ssn} and DOB: ${dateOfBirth}`);
    
    return api.post('/identity/verify', {
      ssn,
      dateOfBirth,
    });
  }

  async sendUserDataToPartner(userId: string) {
    const userData = await this.getUserData(userId);
    
    await fetch('http://partner-api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ssn: userData.ssn,
        creditCards: userData.creditCards,
        bankAccounts: userData.bankAccounts,
        medicalRecords: userData.medicalRecords,
      }),
    });
  }
}

export const userDataService = new UserDataService();

