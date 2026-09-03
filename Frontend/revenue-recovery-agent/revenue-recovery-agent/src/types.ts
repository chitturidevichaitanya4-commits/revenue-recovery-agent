export type Priority =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'NONE';

export type FailureReason =
  | 'INSUFFICIENT_FUNDS'
  | 'OTP_FAILED'
  | 'BANK_TIMEOUT'
  | 'CARD_EXPIRED'
  | 'SUCCESS'
  | (string & {});

export type RecoveryDecision =
  | 'WAIT_FOR_FUNDS'
  | 'CUSTOMER_ACTION_REQUIRED'
  | 'RETRY_LATER'
  | 'UPDATE_PAYMENT_METHOD'
  | 'PAYMENT_SUCCESS'
  | (string & {});

export type RecoveryStrategy =
  | 'PRIORITIZE_RECOVERY'
  | 'STANDARD_RECOVERY'
  | 'DEFER_RECOVERY'
  | 'RECOVERY_COMPLETED'
  | (string & {});

export type ExecutionStatus =
  | 'WAITING'
  | 'ACTION_REQUIRED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | (string & {});

export type CaseStatus =
  | 'RECOVERED'
  | 'OPEN'
  | (string & {});


/**
 * Raw transaction returned by the backend.
 *
 * Backend field naming stays loose because normalize.ts
 * converts it into the frontend RecoveryCase model.
 */
export interface RawTransaction {
  [key: string]: unknown;
}


/**
 * One payment attempt belonging to a recovery case.
 */
export interface RecoveryAttempt {

  attemptNumber: number;

  outcome:
    | 'FAILED'
    | 'SUCCESS';

  failureReason?: FailureReason;

  priority?: Priority;

  decision?: RecoveryDecision;

  executionStatus?: ExecutionStatus;

  amountRecovered?: number;

  /**
   * Timestamp supplied by the backend.
   */
  createdAt?: string;
}


/**
 * Case-level recovery information.
 */
export interface RecoveryCase {

  caseId: string;

  customerId: string;

  amount: number;

  availableBalance?: number;

  paymentMethod?: string;

  /**
   * Original failure that created the
   * recovery case.
   */
  failureReason: FailureReason;

  /**
   * Original AI priority assigned to
   * the recovery case.
   */
  priority: Priority;

  /**
   * Original recovery decision.
   */
  decision: RecoveryDecision;

  strategy: RecoveryStrategy;

  executionStatus: ExecutionStatus;

  status: CaseStatus;

  /**
   * Latest attempt number.
   */
  attemptNumber: number;

  /**
   * Complete payment attempt history.
   */
  attempts: RecoveryAttempt[];

  /**
   * Backend recovery optimizer intelligence.
   */
  recoveryProbability?: number;

  expectedRecoveredRevenue?: number;

  optimizerConfidence?: string;

  estimationSource?: string;

  /**
   * Timestamp of the first transaction
   * belonging to this recovery case.
   */
  createdAt?: string;

  /**
   * true when priority/decision/strategy/status
   * were inferred client-side rather than supplied
   * directly by the backend record.
   */
  derived: boolean;
}


export interface Analytics {

  total_attempts: number;

  failed_payments: number;

  successful_payments: number;

  total_customers: number;

  total_recovery_cases: number;

  recovered_cases: number;

  open_cases: number;

  revenue_at_risk: number;

  revenue_recovered: number;

  recovery_rate: number;

  high_priority: number;

  medium_priority: number;

  low_priority: number;
}


export type BackendStatus =
  | 'connected'
  | 'connecting'
  | 'unreachable';