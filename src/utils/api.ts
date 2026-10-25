import { AdminAccount, AppConfig, Transaction } from '../types';

export interface SharedApiResponse {
  success: boolean;
  data: {
    config: AppConfig;
    adminAccounts: AdminAccount[];
    transactions: Transaction[];
  };
  updatedAt: number;
}

export const fetchSharedData = async (): Promise<SharedApiResponse['data'] | null> => {
  try {
    const res = await fetch('/api/data', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const json: SharedApiResponse = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch shared data from server, falling back to local cache:', err);
    return null;
  }
};

export const apiSaveTransaction = async (tx: Transaction): Promise<boolean> => {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to sync transaction to server:', err);
    return false;
  }
};

export const apiDeleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete transaction from server:', err);
    return false;
  }
};

export const apiSaveConfig = async (config: AppConfig): Promise<boolean> => {
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to sync config to server:', err);
    return false;
  }
};

export const apiSaveAdmins = async (adminAccounts: AdminAccount[]): Promise<boolean> => {
  try {
    const res = await fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminAccounts }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to sync admins to server:', err);
    return false;
  }
};

export const apiRestoreDatabase = async (payload: {
  transactions?: Transaction[];
  config?: AppConfig;
  adminAccounts?: AdminAccount[];
}): Promise<boolean> => {
  try {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to restore database on server:', err);
    return false;
  }
};

export const apiResetDatabase = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/reset', {
      method: 'POST',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to reset database on server:', err);
    return false;
  }
};
