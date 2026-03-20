export type TrackingStepStatus = "done" | "active" | "pending"

export type TrackingStep = {
  step: number
  label: string
  date: string | null
  desc: string | null
  status: TrackingStepStatus
}

export type ServiceCostLineItem = {
  label: string
  amount: number
}

export type ServiceCostConfirmationStatus = "pending" | "approved" | "rejected"

export type ServiceCostConfirmation = {
  status: ServiceCostConfirmationStatus
  title: string
  note: string
  lineItems: ServiceCostLineItem[]
  subtotal: number
  discount: number
  total: number
  approvedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
}

export type TrackingData = {
  orderId: string
  statusBadge: string
  statusLabel: string
  deviceName: string
  deviceIssue: string
  eta: string
  pickupType: string
  technicianRating: string
  technicianCompleted: string
  steps: TrackingStep[]
  serviceCostConfirmation: ServiceCostConfirmation | null
}

export type OrderTrackingMutationAction =
  | "serviceCost.approve"
  | "serviceCost.reject"
