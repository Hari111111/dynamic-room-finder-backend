declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      role: 'user' | 'admin' | 'superadmin';
      name: string;
      email: string;
      mobileNumber?: string;
      savedRoomIds?: string[];
      approvalStatus: 'pending' | 'approved' | 'rejected';
    };
  }
}
