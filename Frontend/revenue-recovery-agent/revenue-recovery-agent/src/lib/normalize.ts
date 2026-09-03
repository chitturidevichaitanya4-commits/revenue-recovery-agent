import type {
  CaseStatus,
  ExecutionStatus,
  Priority,
  RawTransaction,
  RecoveryAttempt,
  RecoveryCase,
  RecoveryDecision,
  RecoveryStrategy,
} from '../types';


// These are display-side fallbacks only.
// Actual recovery decisions are made by the backend.
const DECISION_BY_FAILURE: Record<string, RecoveryDecision> = {
  INSUFFICIENT_FUNDS: 'WAIT_FOR_FUNDS',
  OTP_FAILED: 'CUSTOMER_ACTION_REQUIRED',
  BANK_TIMEOUT: 'RETRY_LATER',
  CARD_EXPIRED: 'UPDATE_PAYMENT_METHOD',
  SUCCESS: 'PAYMENT_SUCCESS',
};


const STRATEGY_BY_PRIORITY: Record<
  Priority,
  RecoveryStrategy
> = {
  HIGH: 'PRIORITIZE_RECOVERY',
  MEDIUM: 'STANDARD_RECOVERY',
  LOW: 'DEFER_RECOVERY',
  NONE: 'RECOVERY_COMPLETED',
};


const EXECUTOR_BY_DECISION: Record<
  string,
  ExecutionStatus
> = {
  WAIT_FOR_FUNDS: 'WAITING',
  CUSTOMER_ACTION_REQUIRED: 'ACTION_REQUIRED',
  RETRY_LATER: 'SCHEDULED',
  UPDATE_PAYMENT_METHOD: 'ACTION_REQUIRED',
  PAYMENT_SUCCESS: 'COMPLETED',
};


function firstDefined<T = unknown>(
  record: RawTransaction,
  keys: string[]
): T | undefined {

  for (const key of keys) {

    if (
      record[key] !== undefined &&
      record[key] !== null
    ) {
      return record[key] as T;
    }
  }

  return undefined;
}


function toNumber(
  value: unknown,
  fallback = 0
): number {

  const n =
    typeof value === 'string'
      ? parseFloat(value)
      : (value as number);

  return typeof n === 'number' &&
    !Number.isNaN(n)
    ? n
    : fallback;
}


function inferPriority(
  record: RawTransaction,
  amount: number,
  balance: number
): Priority {

  const explicit =
    firstDefined<string>(
      record,
      [
        'priority',
        'ai_priority',
        'predicted_priority',
        'recovery_priority',
      ]
    );


  if (
    explicit &&
    ['HIGH', 'MEDIUM', 'LOW', 'NONE']
      .includes(explicit.toUpperCase())
  ) {

    return explicit.toUpperCase() as Priority;
  }


  // Display-side fallback only.
  const exposure =
    balance > 0
      ? amount / balance
      : amount > 0
        ? Infinity
        : 0;


  if (exposure >= 8) {
    return 'HIGH';
  }


  if (exposure >= 1.5) {
    return 'MEDIUM';
  }


  return 'LOW';
}


/**
 * Normalize one backend transaction.
 *
 * A transaction represents one payment attempt.
 * Multiple attempts can belong to the same
 * recovery case.
 */
export function normalizeTransaction(
  record: RawTransaction,
  index: number
): RecoveryCase {

  const caseId =
    firstDefined<string>(
      record,
      [
        'case_id',
        'caseId',
        'recovery_case_id',
        'id',
      ]
    ) ??
    `CASE-${index
      .toString(16)
      .toUpperCase()
      .padStart(8, '0')}`;


  const customerId =
    firstDefined<string>(
      record,
      [
        'customer_id',
        'customerId',
        'customer',
      ]
    ) ?? 'unknown';


  const amount =
    toNumber(
      firstDefined(
        record,
        [
          'payment_amount',
          'amount',
        ]
      )
    );


  const availableBalance =
    toNumber(
      firstDefined(
        record,
        [
          'available_balance',
          'balance',
        ]
      )
    );


  const paymentMethod =
    firstDefined<string>(
      record,
      [
        'payment_method',
        'paymentMethod',
      ]
    );


  const failureReason =
    firstDefined<string>(
      record,
      [
        'failure_reason',
        'failureReason',
      ]
    ) ?? 'SUCCESS';


  const attemptNumber =
    toNumber(
      firstDefined(
        record,
        [
          'attempt_number',
          'attemptNumber',
        ]
      ),
      1
    );


  // ----------------------------------------
  // Backend timestamp
  // ----------------------------------------

  const createdAt =
    firstDefined<string>(
      record,
      [
        'created_at',
        'createdAt',
        'timestamp',
        'time',
      ]
    );


  // ----------------------------------------
  // Determine whether this attempt succeeded
  // ----------------------------------------

  const statusRaw =
    firstDefined<string>(
      record,
      [
        'status',
        'case_status',
      ]
    );


  const isSuccessful =
    statusRaw?.toUpperCase() === 'SUCCESS' ||
    failureReason.toUpperCase() === 'SUCCESS';


  // ----------------------------------------
  // AI Priority
  // ----------------------------------------

  const priorityRaw =
    firstDefined<string>(
      record,
      [
        'priority',
        'ai_priority',
        'predicted_priority',
        'recovery_priority',
      ]
    );


  const priority: Priority =
    isSuccessful
      ? 'NONE'
      : inferPriority(
          record,
          amount,
          availableBalance
        );


  const normalizedPriorityRaw =
    priorityRaw?.toUpperCase();


  const derived =
    !isSuccessful &&
    !(
      normalizedPriorityRaw &&
      ['HIGH', 'MEDIUM', 'LOW']
        .includes(normalizedPriorityRaw)
    );


  // ----------------------------------------
  // Recovery Decision
  // ----------------------------------------

  const decision =
    firstDefined<string>(
      record,
      [
        'decision',
        'recovery_decision',
      ]
    ) ??
    DECISION_BY_FAILURE[
      failureReason.toUpperCase()
    ] ??
    'RETRY_LATER';


  // ----------------------------------------
  // Recovery Strategy
  // ----------------------------------------

  const strategy =
    firstDefined<string>(
      record,
      [
        'strategy',
        'recovery_strategy',
      ]
    ) ??
    STRATEGY_BY_PRIORITY[priority];


  // ----------------------------------------
  // Execution Status
  // ----------------------------------------

  const executionStatus =
    firstDefined<string>(
      record,
      [
        'execution_status',
        'executionStatus',
      ]
    ) ??
    EXECUTOR_BY_DECISION[decision] ??
    'SCHEDULED';


  // ----------------------------------------
  // Case Status
  // ----------------------------------------

  const status: CaseStatus =
    statusRaw?.toUpperCase() ??
    (
      executionStatus === 'COMPLETED' ||
      isSuccessful
        ? 'RECOVERED'
        : 'OPEN'
    );


  // ----------------------------------------
  // Recovery Optimizer Intelligence
  // ----------------------------------------

  const recoveryProbabilityRaw =
    firstDefined(
      record,
      [
        'recovery_probability',
        'recoveryProbability',
      ]
    );


  const expectedRecoveredRevenueRaw =
    firstDefined(
      record,
      [
        'expected_recovered_revenue',
        'expectedRecoveredRevenue',
      ]
    );


  const optimizerConfidence =
    firstDefined<string>(
      record,
      [
        'optimizer_confidence',
        'optimizerConfidence',
      ]
    );


  const estimationSource =
    firstDefined<string>(
      record,
      [
        'estimation_source',
        'estimationSource',
      ]
    );


  const recoveryProbability =
    recoveryProbabilityRaw !== undefined
      ? toNumber(
          recoveryProbabilityRaw
        )
      : undefined;


  const expectedRecoveredRevenue =
    expectedRecoveredRevenueRaw !== undefined
      ? toNumber(
          expectedRecoveredRevenueRaw
        )
      : undefined;


  // ----------------------------------------
  // Build attempt
  // ----------------------------------------

  const attempt: RecoveryAttempt = {

    attemptNumber,

    outcome:
      isSuccessful
        ? 'SUCCESS'
        : 'FAILED',

    failureReason,

    priority,

    decision:
      decision as RecoveryDecision,

    executionStatus:
      executionStatus as ExecutionStatus,

    amountRecovered:
      isSuccessful
        ? amount
        : undefined,

    // Preserve backend timestamp.
    createdAt,
  };


  // ----------------------------------------
  // Return normalized case
  // ----------------------------------------

  return {

    caseId,

    customerId,

    amount,

    availableBalance,

    paymentMethod,

    failureReason,

    priority,

    decision:
      decision as RecoveryDecision,

    strategy:
      strategy as RecoveryStrategy,

    executionStatus,

    status,

    attemptNumber,

    attempts: [attempt],

    // Recovery optimizer
    recoveryProbability,

    expectedRecoveredRevenue,

    optimizerConfidence,

    estimationSource,

    // First transaction timestamp
    createdAt,

    derived,
  };
}


/**
 * Merge multiple payment attempts belonging
 * to the same recovery case.
 *
 * CASE-LEVEL INFORMATION:
 *   - original failure reason
 *   - original AI priority
 *   - original recovery decision
 *   - original strategy
 *
 * ATTEMPT-LEVEL INFORMATION:
 *   - timestamp
 *   - outcome
 *   - execution status
 *
 * LATEST ATTEMPT:
 *   - current attempt number
 *   - latest optimizer intelligence
 */
export function groupIntoCases(
  rows: RawTransaction[]
): RecoveryCase[] {

  const byCaseId =
    new Map<string, RecoveryCase>();


  rows.forEach((row, i) => {

    const candidate =
      normalizeTransaction(row, i);

    const existing =
      byCaseId.get(candidate.caseId);


    // --------------------------------------
    // First transaction for this case
    // --------------------------------------

    if (!existing) {

      byCaseId.set(
        candidate.caseId,
        candidate
      );

      return;
    }


    // --------------------------------------
    // Add attempt
    // --------------------------------------

    existing.attempts.push(
      ...candidate.attempts
    );


    existing.attempts.sort(
      (a, b) =>
        a.attemptNumber -
        b.attemptNumber
    );


    // --------------------------------------
    // Latest attempt
    // --------------------------------------

    const latest =
      existing.attempts[
        existing.attempts.length - 1
      ];


    existing.attemptNumber =
      latest.attemptNumber;


    // --------------------------------------
    // IMPORTANT:
    //
    // Do NOT overwrite:
    //
    // failureReason
    // priority
    // decision
    // strategy
    //
    // Those belong to the original
    // recovery problem.
    // --------------------------------------


    // --------------------------------------
    // Current execution status
    // --------------------------------------

    if (latest.executionStatus) {

      existing.executionStatus =
        latest.executionStatus;
    }


    // --------------------------------------
    // Preserve first-case timestamp
    // --------------------------------------

    if (
      !existing.createdAt &&
      candidate.createdAt
    ) {

      existing.createdAt =
        candidate.createdAt;
    }


    // --------------------------------------
    // Case recovered if ANY attempt succeeded
    // --------------------------------------

    if (
      existing.attempts.some(
        (attempt) =>
          attempt.outcome === 'SUCCESS'
      )
    ) {

      existing.status = 'RECOVERED';
    }


    // --------------------------------------
    // Latest optimizer intelligence
    // --------------------------------------

    if (
      candidate.recoveryProbability !==
      undefined
    ) {

      existing.recoveryProbability =
        candidate.recoveryProbability;
    }


    if (
      candidate.expectedRecoveredRevenue !==
      undefined
    ) {

      existing.expectedRecoveredRevenue =
        candidate.expectedRecoveredRevenue;
    }


    if (
      candidate.optimizerConfidence !==
      undefined
    ) {

      existing.optimizerConfidence =
        candidate.optimizerConfidence;
    }


    if (
      candidate.estimationSource !==
      undefined
    ) {

      existing.estimationSource =
        candidate.estimationSource;
    }


    existing.derived =
      existing.derived &&
      candidate.derived;
  });


  return Array.from(
    byCaseId.values()
  );
}