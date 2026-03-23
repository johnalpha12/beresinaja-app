import type {
  OrderTrackingMutationAction,
  ServiceCostConfirmation,
  ServiceCostLineItem,
  TrackingData,
  TrackingStep,
  TrackingStepStatus,
} from "@/types/tracking"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function getNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function normalizeStepStatus(value: unknown): TrackingStepStatus {
  if (value === "done" || value === "active" || value === "pending") {
    return value
  }

  return "pending"
}

function parseRupiahAmount(input: string) {
  const matches = input.match(/Rp\s*([\d.]+)/i)

  if (!matches?.[1]) {
    return 0
  }

  return Number.parseInt(matches[1].replace(/\./g, ""), 10) || 0
}

function normalizeLineItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as ServiceCostLineItem[]
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null
      }

      const label = getString(item.label).trim()

      if (!label) {
        return null
      }

      return {
        label,
        amount: getNumber(item.amount),
      } satisfies ServiceCostLineItem
    })
    .filter((item): item is ServiceCostLineItem => item !== null)
}

function isServiceCostStep(step: TrackingStep) {
  return /konfirmasi biaya|biaya servis/i.test(step.label)
}

function getServiceCostStep(steps: TrackingStep[]) {
  return steps.find(isServiceCostStep) || null
}

function buildFallbackServiceCostConfirmation(step: TrackingStep | null) {
  if (!step || !/konfirmasi biaya/i.test(step.label)) {
    return null
  }

  const estimatedAmount = parseRupiahAmount(step.desc || "")

  return {
    status: "pending",
    title: "Konfirmasi estimasi biaya",
    note:
      "Teknisi sudah menyelesaikan diagnosa awal. Mohon konfirmasi biaya sebelum pengerjaan dilanjutkan.",
    lineItems: estimatedAmount
      ? [{ label: "Estimasi servis", amount: estimatedAmount }]
      : [],
    subtotal: estimatedAmount,
    discount: 0,
    total: estimatedAmount,
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
  } satisfies ServiceCostConfirmation
}

function normalizeServiceCostConfirmation(
  value: unknown,
  fallbackStep: TrackingStep | null
) {
  if (!isRecord(value)) {
    return buildFallbackServiceCostConfirmation(fallbackStep)
  }

  const fallbackAmount = parseRupiahAmount(fallbackStep?.desc || "")
  const providedLineItems = normalizeLineItems(value.lineItems)
  const legacyLineItems = [
    {
      label: "Biaya servis",
      amount: getNumber(value.serviceFee),
    },
    {
      label: "Spare part",
      amount: getNumber(value.partsFee),
    },
    {
      label: "Biaya jemput-antar",
      amount: getNumber(value.pickupFee),
    },
  ].filter((item) => item.amount > 0)

  const lineItems =
    providedLineItems.length > 0
      ? providedLineItems
      : legacyLineItems.length > 0
        ? legacyLineItems
        : fallbackAmount > 0
          ? [{ label: "Estimasi servis", amount: fallbackAmount }]
          : []

  const subtotal =
    getNumber(value.subtotal) ||
    lineItems.reduce((total, item) => total + item.amount, 0)
  const discount = getNumber(value.discount)
  const total = getNumber(value.total) || Math.max(subtotal - discount, 0)
  const rawStatus = getString(value.status, "pending")

  return {
    status:
      rawStatus === "approved" || rawStatus === "rejected"
        ? rawStatus
        : "pending",
    title: getString(value.title, "Konfirmasi estimasi biaya"),
    note: getString(
      value.note,
      "Teknisi sudah menyelesaikan diagnosa awal. Mohon konfirmasi biaya sebelum pengerjaan dilanjutkan."
    ),
    lineItems,
    subtotal,
    discount,
    total,
    approvedAt: getNullableString(value.approvedAt),
    rejectedAt: getNullableString(value.rejectedAt),
    rejectionReason: getNullableString(value.rejectionReason),
  } satisfies ServiceCostConfirmation
}

function normalizeTrackingStep(value: unknown, index: number): TrackingStep {
  if (!isRecord(value)) {
    return {
      step: index + 1,
      label: `Tahap ${index + 1}`,
      date: null,
      desc: null,
      status: "pending",
    }
  }

  const stepNumber = getNumber(value.step, index + 1)

  return {
    step: stepNumber,
    label: getString(value.label, `Tahap ${stepNumber}`),
    date: getNullableString(value.date),
    desc: getNullableString(value.desc),
    status: normalizeStepStatus(value.status),
  }
}

function replaceStepAtIndex(
  steps: TrackingStep[],
  index: number,
  updater: (current: TrackingStep) => TrackingStep
) {
  return steps.map((step, stepIndex) =>
    stepIndex === index ? updater(step) : step
  )
}

function finalizeTrackingSteps(
  steps: TrackingStep[],
  serviceCostStepIndex: number,
  nextActiveIndex: number
) {
  return steps.map((step, index): TrackingStep => {
    if (index < serviceCostStepIndex) {
      return {
        ...step,
        status: "done",
      }
    }

    if (index > nextActiveIndex) {
      return {
        ...step,
        status: "pending",
      }
    }

    return step
  })
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatTrackingTimestamp(value: Date) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).formatToParts(value)

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || ""

  return `${getPart("day")} ${getPart("month")}, ${getPart("hour")}:${getPart("minute")}`
}

export function normalizeTrackingData(value: unknown): TrackingData {
  const rawTracking = isRecord(value) ? value : {}
  const stepsSource = Array.isArray(rawTracking.steps) ? rawTracking.steps : []
  const steps = stepsSource.map(normalizeTrackingStep)
  const serviceCostStep = getServiceCostStep(steps)
  const serviceCostConfirmation = normalizeServiceCostConfirmation(
    rawTracking.serviceCostConfirmation,
    serviceCostStep
  )
  const statusBadge =
    serviceCostConfirmation?.status === "pending"
      ? "Menunggu Konfirmasi"
      : serviceCostConfirmation?.status === "approved"
        ? getString(rawTracking.statusBadge, "Dikerjakan")
      : serviceCostConfirmation?.status === "rejected"
        ? getString(rawTracking.statusBadge, "Tindak Lanjut")
        : getString(rawTracking.statusBadge, "")
  const statusLabel =
    serviceCostConfirmation?.status === "pending"
      ? "Menunggu Konfirmasi Biaya"
      : serviceCostConfirmation?.status === "approved"
        ? getString(rawTracking.statusLabel, "Biaya disetujui")
      : serviceCostConfirmation?.status === "rejected"
        ? getString(rawTracking.statusLabel, "Biaya ditolak")
        : getString(rawTracking.statusLabel, "")

  return {
    orderId: getString(rawTracking.orderId, ""),
    statusBadge,
    statusLabel,
    deviceName: getString(rawTracking.deviceName, ""),
    deviceIssue: getString(rawTracking.deviceIssue, ""),
    eta: getString(rawTracking.eta, ""),
    pickupType: getString(rawTracking.pickupType, ""),
    technicianRating: getString(rawTracking.technicianRating, ""),
    technicianCompleted: getString(rawTracking.technicianCompleted, ""),
    courier: getString(rawTracking.courier, ""),
    receiptNumber: getString(rawTracking.receiptNumber, ""),
    steps,
    serviceCostConfirmation,
  }
}

export function canMutateServiceCostConfirmation(tracking: TrackingData) {
  return tracking.serviceCostConfirmation?.status === "pending"
}

export function applyTrackingMutation(
  value: unknown,
  action: OrderTrackingMutationAction
) {
  const tracking = normalizeTrackingData(value)
  const serviceCostConfirmation = tracking.serviceCostConfirmation

  if (!serviceCostConfirmation) {
    throw new Error("Biaya servis belum tersedia untuk order ini.")
  }

  if (serviceCostConfirmation.status !== "pending") {
    throw new Error("Konfirmasi biaya servis untuk order ini sudah diproses.")
  }

  const processedAt = formatTrackingTimestamp(new Date())
  const serviceCostStepIndex = tracking.steps.findIndex(isServiceCostStep)

  if (serviceCostStepIndex === -1) {
    throw new Error("Tahap konfirmasi biaya servis tidak ditemukan.")
  }

  if (action === "serviceCost.approve") {
    const confirmedSteps = finalizeTrackingSteps(
      replaceStepAtIndex(
        replaceStepAtIndex(tracking.steps, serviceCostStepIndex, (step) => ({
          ...step,
          label: "Biaya Servis Disetujui",
          date: processedAt,
          desc: `Total ${formatRupiah(serviceCostConfirmation.total)} telah disetujui pelanggan.`,
          status: "done",
        })),
        serviceCostStepIndex + 1,
        (step) => ({
          ...step,
          date: null,
          desc: step.desc || "Teknisi mulai mengerjakan perangkat Anda.",
          status: "active",
        })
      ),
      serviceCostStepIndex,
      serviceCostStepIndex + 1
    )

    return {
      ...tracking,
      statusBadge: "Dikerjakan",
      statusLabel: "Biaya disetujui",
      steps: confirmedSteps,
      serviceCostConfirmation: {
        ...serviceCostConfirmation,
        status: "approved",
        approvedAt: processedAt,
        rejectedAt: null,
        rejectionReason: null,
      },
    } satisfies TrackingData
  }

  const rejectedSteps = finalizeTrackingSteps(
    replaceStepAtIndex(
      replaceStepAtIndex(tracking.steps, serviceCostStepIndex, (step) => ({
        ...step,
        label: "Biaya Servis Ditolak",
        date: processedAt,
        desc: "Pelanggan menolak estimasi biaya servis.",
        status: "done",
      })),
      serviceCostStepIndex + 1,
      (step) => ({
        ...step,
        label: "Menunggu Tindak Lanjut",
        date: null,
        desc: "Tim support akan menghubungi Anda untuk revisi estimasi atau pembatalan.",
        status: "active",
      })
    ),
    serviceCostStepIndex,
    serviceCostStepIndex + 1
  )

  return {
    ...tracking,
    statusBadge: "Tindak Lanjut",
    statusLabel: "Biaya ditolak",
    eta: "Menunggu tindak lanjut",
    steps: rejectedSteps,
    serviceCostConfirmation: {
      ...serviceCostConfirmation,
      status: "rejected",
      approvedAt: null,
      rejectedAt: processedAt,
      rejectionReason:
        serviceCostConfirmation.rejectionReason ||
        "Pelanggan menolak estimasi biaya servis.",
    },
  } satisfies TrackingData
}
