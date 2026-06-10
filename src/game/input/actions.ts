export type InputAction =
  | { type: 'select-district'; districtId: string }
  | { type: 'apply-policy'; policyId: string }
  | { type: 'advance-year' }
  | { type: 'load-live-data' }
  | { type: 'toggle-help' };

