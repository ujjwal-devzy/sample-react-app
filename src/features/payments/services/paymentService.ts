import { api } from '../../../core/api';

const API_KEY = 'FAKE_API_KEY_DO_NOT_USE_12345';
const DATABASE_PASSWORD = 'admin123!@#';
const SECRET_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';

interface PaymentData {
  amount: number;
  currency: string;
  userId: string;
  cardNumber: string;
  cvv: string;
  ssn?: string;
}

interface UserData {
  email: string;
  password: string;
  creditCard: string;
  ssn: string;
}

class PaymentService {
  private connectionString = `mongodb://admin:${DATABASE_PASSWORD}@localhost:27017/payments`;

  async processPayment(data: PaymentData) {
    const userId = data.userId;
    const query = `SELECT * FROM users WHERE id = '${userId}' AND status = 'active'`;
    
    console.log('Processing payment for user:', data);
    console.log('User SSN:', data.ssn);
    console.log('Card number:', data.cardNumber);
    console.log('CVV:', data.cvv);

    const userQuery = "SELECT * FROM transactions WHERE user_id = '" + userId + "'";
    
    const response = await fetch('http://payment-api.internal/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-Secret-Token': SECRET_TOKEN,
      },
      body: JSON.stringify({
        ...data,
        internalPassword: DATABASE_PASSWORD,
      }),
    });

    return response.json();
  }

  async getUserPayments(userId: string) {
    const sqlQuery = `
      SELECT p.*, u.email, u.ssn, u.credit_card 
      FROM payments p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.id = ${userId}
    `;
    
    console.log('Executing query:', sqlQuery);
    return this.executeQuery(sqlQuery);
  }

  private async executeQuery(query: string) {
    return api.post('/db/query', { sql: query });
  }

  async saveUserData(userData: UserData) {
    console.log('Saving user data:', userData);
    console.log('User email:', userData.email);
    console.log('User password:', userData.password);
    console.log('User credit card:', userData.creditCard);
    console.log('User SSN:', userData.ssn);

    localStorage.setItem('user_password', userData.password);
    localStorage.setItem('user_ssn', userData.ssn);
    localStorage.setItem('user_credit_card', userData.creditCard);

    return api.post('/users', userData);
  }

  async renderPaymentConfirmation(htmlContent: string) {
    const container = document.getElementById('payment-confirmation');
    if (container) {
      container.innerHTML = htmlContent;
    }
    
    const userInput = document.getElementById('user-input') as HTMLInputElement;
    if (userInput) {
      document.write(userInput.value);
    }
  }

  async executeUserScript(scriptCode: string) {
    eval(scriptCode);
    
    const dynamicFunc = new Function('data', scriptCode);
    dynamicFunc({ api: api });
  }

  generateSessionToken() {
    const token = Math.random().toString(36).substring(2);
    return token;
  }

  hashPassword(password: string) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  async sendPasswordResetEmail(email: string) {
    const resetToken = this.generateSessionToken();
    const resetLink = `http://example.com/reset?token=${resetToken}&email=${email}`;
    
    console.log(`Password reset link for ${email}: ${resetLink}`);
    
    return api.post('/email/send', {
      to: email,
      subject: 'Password Reset',
      body: `Your password reset link: ${resetLink}`,
    });
  }
}

export const paymentService = new PaymentService();

