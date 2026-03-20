"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Truck,
  Wallet,
  CreditCard,
  Building2,
  Plus,
  Edit2,
  Check,
} from "lucide-react"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { PageLoader } from "@/components/ui/PageLoader"
import { screenToPath } from "@/types/navigation"

const CHECKOUT_ADDRESSES_STORAGE_KEY = "beresinaja.checkout.addresses"
const CHECKOUT_SELECTED_ADDRESS_STORAGE_KEY =
  "beresinaja.checkout.selected-address"

type ShippingMethod = "regular" | "express"
type PaymentMethod = "bank" | "ewallet" | "cod"

type CheckoutProduct = {
  name: string
  variant: string
  price: number
  quantity: number
  image: string
}

type DeliveryAddress = {
  id: string
  label: string
  recipient: string
  phone: string
  address: string
  area: string
  postalCode: string
  isPrimary: boolean
}

type DeliveryAddressForm = {
  label: string
  recipient: string
  phone: string
  address: string
  area: string
  postalCode: string
  isPrimary: boolean
}

type ShippingOption = {
  id: ShippingMethod
  name: string
  duration: string
  price: number
  description: string
}

type PaymentOption = {
  id: PaymentMethod
  name: string
  iconKey: "bank" | "ewallet" | "cod"
  description: string
}

type CheckoutResponse = {
  product?: CheckoutProduct
  deliveryAddress?: Partial<DeliveryAddress>
  deliveryAddresses?: Partial<DeliveryAddress>[]
  shippingOptions?: ShippingOption[]
  paymentOptions?: PaymentOption[]
  platformFee?: number
}

function createAddressId() {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createEmptyAddressForm(isPrimary = false): DeliveryAddressForm {
  return {
    label: "",
    recipient: "",
    phone: "",
    address: "",
    area: "",
    postalCode: "",
    isPrimary,
  }
}

function normalizeDeliveryAddress(
  value: Partial<DeliveryAddress>,
  fallbackId: string,
  fallbackLabel: string,
  isPrimary = false
): DeliveryAddress {
  return {
    id:
      typeof value.id === "string" && value.id.trim() ? value.id : fallbackId,
    label:
      typeof value.label === "string" && value.label.trim()
        ? value.label.trim()
        : fallbackLabel,
    recipient:
      typeof value.recipient === "string" ? value.recipient.trim() : "",
    phone: typeof value.phone === "string" ? value.phone.trim() : "",
    address: typeof value.address === "string" ? value.address.trim() : "",
    area: typeof value.area === "string" ? value.area.trim() : "",
    postalCode:
      typeof value.postalCode === "string" ? value.postalCode.trim() : "",
    isPrimary: value.isPrimary === true || isPrimary,
  }
}

function ensurePrimaryAddress(
  addresses: DeliveryAddress[],
  preferredPrimaryId?: string
) {
  if (!addresses.length) {
    return []
  }

  const fallbackPrimaryId =
    (preferredPrimaryId &&
      addresses.some((address) => address.id === preferredPrimaryId) &&
      preferredPrimaryId) ||
    addresses.find((address) => address.isPrimary)?.id ||
    addresses[0].id

  return addresses.map((address) => ({
    ...address,
    isPrimary: address.id === fallbackPrimaryId,
  }))
}

function readStoredAddresses() {
  if (typeof window === "undefined") {
    return []
  }

  const rawValue = window.localStorage.getItem(CHECKOUT_ADDRESSES_STORAGE_KEY)

  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<DeliveryAddress>[]

    if (!Array.isArray(parsed)) {
      return []
    }

    return ensurePrimaryAddress(
      parsed.map((address, index) =>
        normalizeDeliveryAddress(
          address,
          address.id || `stored-${index + 1}`,
          address.label || `Alamat ${index + 1}`,
          index === 0
        )
      )
    )
  } catch {
    return []
  }
}

function readSelectedAddressId() {
  if (typeof window === "undefined") {
    return ""
  }

  return (
    window.localStorage.getItem(CHECKOUT_SELECTED_ADDRESS_STORAGE_KEY) || ""
  )
}

function writeStoredAddresses(addresses: DeliveryAddress[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    CHECKOUT_ADDRESSES_STORAGE_KEY,
    JSON.stringify(addresses)
  )
}

function writeSelectedAddressId(addressId: string) {
  if (typeof window === "undefined") {
    return
  }

  if (!addressId) {
    window.localStorage.removeItem(CHECKOUT_SELECTED_ADDRESS_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(CHECKOUT_SELECTED_ADDRESS_STORAGE_KEY, addressId)
}

function buildSeedAddresses(data: CheckoutResponse) {
  if (Array.isArray(data.deliveryAddresses) && data.deliveryAddresses.length) {
    return ensurePrimaryAddress(
      data.deliveryAddresses.map((address, index) =>
        normalizeDeliveryAddress(
          address,
          address.id || `seed-${index + 1}`,
          address.label || (index === 0 ? "Rumah" : `Alamat ${index + 1}`),
          index === 0
        )
      )
    )
  }

  if (!data.deliveryAddress) {
    return []
  }

  return [
    normalizeDeliveryAddress(data.deliveryAddress, "seed-1", "Rumah", true),
  ]
}

export default function CheckoutPage() {
  const router = useRouter()
  const onBack = () => router.back()
  const onSuccess = () => router.push(screenToPath("orderSuccess"))

  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("regular")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank")
  const [isProcessing, setIsProcessing] = useState(false)

  const [product, setProduct] = useState<CheckoutProduct | null>(null)
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([])
  const [platformFee, setPlatformFee] = useState(0)
  const [loading, setLoading] = useState(true)

  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState<DeliveryAddressForm>(
    createEmptyAddressForm(true)
  )
  const [addressError, setAddressError] = useState("")

  useEffect(() => {
    async function loadCheckout() {
      try {
        setLoading(true)
        const response = await fetch("/api/content/checkout", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Gagal memuat data checkout.")
        }

        const data = (await response.json()) as CheckoutResponse
        const seedAddresses = buildSeedAddresses(data)
        const storedAddresses = readStoredAddresses()
        const nextAddresses = storedAddresses.length
          ? storedAddresses
          : seedAddresses
        const storedSelectedAddressId = readSelectedAddressId()
        const nextSelectedAddressId =
          nextAddresses.find((address) => address.id === storedSelectedAddressId)
            ?.id ||
          nextAddresses.find((address) => address.isPrimary)?.id ||
          nextAddresses[0]?.id ||
          ""

        setProduct(data.product || null)
        setAddresses(nextAddresses)
        setSelectedAddressId(nextSelectedAddressId)
        setShippingOptions(data.shippingOptions || [])
        setPaymentOptions(data.paymentOptions || [])
        setPlatformFee(data.platformFee || 0)
      } catch (error) {
        console.error("Failed to load checkout data:", error)
      } finally {
        setLoading(false)
      }
    }

    void loadCheckout()
  }, [])

  useEffect(() => {
    if (loading) {
      return
    }

    writeStoredAddresses(addresses)
    writeSelectedAddressId(selectedAddressId)
  }, [addresses, loading, selectedAddressId])

  useEffect(() => {
    if (loading) {
      return
    }

    if (!addresses.length) {
      if (selectedAddressId) {
        setSelectedAddressId("")
      }
      return
    }

    if (!addresses.some((address) => address.id === selectedAddressId)) {
      setSelectedAddressId(
        addresses.find((address) => address.isPrimary)?.id || addresses[0].id
      )
    }
  }, [addresses, loading, selectedAddressId])

  const selectedShipping = shippingOptions.find(
    (option) => option.id === shippingMethod
  )
  const activeAddress =
    addresses.find((address) => address.id === selectedAddressId) ||
    addresses.find((address) => address.isPrimary) ||
    null
  const subtotal = (product?.price || 0) * (product?.quantity || 0)
  const shippingCost = selectedShipping?.price || 0
  const total = subtotal + shippingCost + platformFee

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const openAddAddressForm = () => {
    setEditingAddressId(null)
    setAddressError("")
    setAddressForm(createEmptyAddressForm(addresses.length === 0))
    setIsAddressFormOpen(true)
  }

  const openEditAddressForm = () => {
    if (!activeAddress) {
      openAddAddressForm()
      return
    }

    setEditingAddressId(activeAddress.id)
    setAddressError("")
    setAddressForm({
      label: activeAddress.label,
      recipient: activeAddress.recipient,
      phone: activeAddress.phone,
      address: activeAddress.address,
      area: activeAddress.area,
      postalCode: activeAddress.postalCode,
      isPrimary: activeAddress.isPrimary,
    })
    setIsAddressFormOpen(true)
  }

  const closeAddressForm = () => {
    setIsAddressFormOpen(false)
    setEditingAddressId(null)
    setAddressError("")
  }

  const handleAddressInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target
    const { name, value } = target

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setAddressForm((current) => ({
        ...current,
        [name]: target.checked,
      }))
      return
    }

    setAddressForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleAddressSave = () => {
    const draft = {
      label: addressForm.label.trim(),
      recipient: addressForm.recipient.trim(),
      phone: addressForm.phone.trim(),
      address: addressForm.address.trim(),
      area: addressForm.area.trim(),
      postalCode: addressForm.postalCode.trim(),
      isPrimary: addressForm.isPrimary,
    }

    if (
      !draft.label ||
      !draft.recipient ||
      !draft.phone ||
      !draft.address ||
      !draft.area ||
      !draft.postalCode
    ) {
      setAddressError("Semua field alamat harus diisi.")
      return
    }

    const nextId = editingAddressId || createAddressId()
    const nextAddress: DeliveryAddress = {
      id: nextId,
      ...draft,
    }

    const mergedAddresses = editingAddressId
      ? addresses.map((address) =>
          address.id === editingAddressId ? nextAddress : address
        )
      : [nextAddress, ...addresses]

    const preferredPrimaryId = draft.isPrimary
      ? nextId
      : mergedAddresses.find(
          (address) => address.id !== nextId && address.isPrimary
        )?.id ||
        nextId

    const nextAddresses = ensurePrimaryAddress(
      mergedAddresses,
      preferredPrimaryId
    )

    setAddresses(nextAddresses)
    setSelectedAddressId(nextId)
    closeAddressForm()
  }

  const handleCheckout = () => {
    if (!activeAddress) {
      setAddressError("Tambahkan atau pilih alamat pengiriman terlebih dahulu.")
      setIsAddressFormOpen(true)
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onSuccess()
    }, 2000)
  }

  const iconMap = {
    bank: Building2,
    ewallet: Wallet,
    cod: CreditCard,
  } as const

  if (loading) {
    return <PageLoader message="Memuat checkout..." />
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center z-10">
        <button
          onClick={onBack}
          className="text-[#0288D1] hover:bg-[#0288D1]/5 p-2 rounded-full -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="ml-3 text-[#4A4A4A]">Checkout</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <h2 className="text-[#4A4A4A] mb-4">Produk</h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F8FAFC] to-[#E5E7EB] rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                {product?.image || ""}
              </div>
              <div className="flex-1">
                <h3 className="text-[#4A4A4A] mb-1">{product?.name || "-"}</h3>
                <p className="text-sm text-[#6B6B6B] mb-2">
                  {product?.variant || "-"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-[#0288D1]">
                    {formatPrice(product?.price || 0)}
                  </span>
                  <span className="text-sm text-[#6B6B6B]">
                    x{product?.quantity || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0288D1]" />
                <h2 className="text-[#4A4A4A]">Alamat Pengiriman</h2>
              </div>
              <button
                onClick={openEditAddressForm}
                className="text-[#0288D1] text-sm flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Ubah
              </button>
            </div>

            {activeAddress ? (
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#4A4A4A]">{activeAddress.recipient}</p>
                      <span className="text-xs px-2 py-1 rounded-lg bg-[#F3F8FC] text-[#0288D1]">
                        {activeAddress.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B6B6B]">{activeAddress.phone}</p>
                  </div>
                  {activeAddress.isPrimary && (
                    <div className="px-2 py-1 bg-[#0288D1]/10 rounded-lg">
                      <span className="text-xs text-[#0288D1]">Utama</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#6B6B6B] mt-2">
                  {activeAddress.address}
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  {activeAddress.area}, {activeAddress.postalCode}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#CBD5E1] px-4 py-5 text-sm text-[#6B6B6B]">
                Belum ada alamat. Tambahkan alamat pengiriman terlebih dahulu.
              </div>
            )}

            {addresses.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs uppercase tracking-wide text-[#94A3B8]">
                  Pilih alamat
                </p>
                {addresses.map((address) => {
                  const isSelected = address.id === selectedAddressId

                  return (
                    <button
                      key={address.id}
                      onClick={() => {
                        setSelectedAddressId(address.id)
                        setAddressError("")
                      }}
                      className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? "border-[#0288D1] bg-[#0288D1]/5"
                          : "border-[#E5E7EB] hover:border-[#0288D1]/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[#4A4A4A]">{address.recipient}</span>
                            <span className="text-xs px-2 py-1 rounded-lg bg-white text-[#0288D1] border border-[#D6EAF8]">
                              {address.label}
                            </span>
                            {address.isPrimary && (
                              <span className="text-xs px-2 py-1 rounded-lg bg-[#0288D1]/10 text-[#0288D1]">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B6B6B]">{address.phone}</p>
                          <p className="text-xs text-[#6B6B6B] mt-2">
                            {address.address}
                          </p>
                          <p className="text-xs text-[#6B6B6B]">
                            {address.area}, {address.postalCode}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <button
              onClick={openAddAddressForm}
              className="w-full mt-4 py-2 rounded-full border border-[#E5E7EB] text-[#0288D1] hover:bg-[#0288D1]/5 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Alamat Baru
            </button>

            {isAddressFormOpen && (
              <div className="mt-4 rounded-2xl border border-[#D6EAF8] bg-[#F8FCFF] p-4 space-y-4">
                <div>
                  <h3 className="text-[#4A4A4A]">
                    {editingAddressId ? "Ubah Alamat" : "Alamat Baru"}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    Lengkapi detail alamat agar pengiriman tepat sasaran.
                  </p>
                </div>

                {addressError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {addressError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="text-xs text-[#6B6B6B]">Label Alamat</span>
                    <input
                      name="label"
                      value={addressForm.label}
                      onChange={handleAddressInputChange}
                      placeholder="Rumah / Kantor"
                      className="w-full rounded-xl border border-[#D6EAF8] bg-white px-4 py-3 text-sm text-[#4A4A4A] outline-none focus:border-[#0288D1]"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-[#6B6B6B]">Penerima</span>
                    <input
                      name="recipient"
                      value={addressForm.recipient}
                      onChange={handleAddressInputChange}
                      placeholder="Nama penerima"
                      className="w-full rounded-xl border border-[#D6EAF8] bg-white px-4 py-3 text-sm text-[#4A4A4A] outline-none focus:border-[#0288D1]"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-[#6B6B6B]">Nomor HP</span>
                    <input
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressInputChange}
                      placeholder="08xx xxxx xxxx"
                      className="w-full rounded-xl border border-[#D6EAF8] bg-white px-4 py-3 text-sm text-[#4A4A4A] outline-none focus:border-[#0288D1]"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-[#6B6B6B]">Area</span>
                    <input
                      name="area"
                      value={addressForm.area}
                      onChange={handleAddressInputChange}
                      placeholder="Kecamatan, Kota"
                      className="w-full rounded-xl border border-[#D6EAF8] bg-white px-4 py-3 text-sm text-[#4A4A4A] outline-none focus:border-[#0288D1]"
                    />
                  </label>
                </div>

                <label className="space-y-1 block">
                  <span className="text-xs text-[#6B6B6B]">Alamat Lengkap</span>
                  <textarea
                    name="address"
                    value={addressForm.address}
                    onChange={handleAddressInputChange}
                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
                    rows={3}
                    className="w-full rounded-xl border border-[#D6EAF8] bg-white px-4 py-3 text-sm text-[#4A4A4A] outline-none focus:border-[#0288D1] resize-none"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-xs text-[#6B6B6B]">Kode Pos</span>
                  <input
                    name="postalCode"
                    value={addressForm.postalCode}
                    onChange={handleAddressInputChange}
                    placeholder="12345"
                    className="w-full rounded-xl border border-[#D6EAF8] bg-white px-4 py-3 text-sm text-[#4A4A4A] outline-none focus:border-[#0288D1]"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-[#D6EAF8] bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    name="isPrimary"
                    checked={addressForm.isPrimary}
                    onChange={handleAddressInputChange}
                    className="w-4 h-4 accent-[#0288D1]"
                  />
                  <span className="text-sm text-[#4A4A4A]">
                    Jadikan alamat utama
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={closeAddressForm}
                    className="flex-1 rounded-full border border-[#D6EAF8] px-4 py-3 text-sm text-[#0288D1] hover:bg-white transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddressSave}
                    className="flex-1 rounded-full bg-[#0288D1] px-4 py-3 text-sm text-white hover:bg-[#0277BD] transition-colors"
                  >
                    Simpan Alamat
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-[#0288D1]" />
              <h2 className="text-[#4A4A4A]">Metode Pengiriman</h2>
            </div>
            <div className="space-y-3">
              {shippingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setShippingMethod(option.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    shippingMethod === option.id
                      ? "border-[#0288D1] bg-[#0288D1]/5"
                      : "border-[#E5E7EB] hover:border-[#0288D1]/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[#4A4A4A]">{option.name}</h3>
                        {shippingMethod === option.id && (
                          <div className="w-5 h-5 rounded-full bg-[#0288D1] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#6B6B6B] mb-1">
                        {option.duration}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">
                        {option.description}
                      </p>
                    </div>
                    <div className="text-[#0288D1] ml-4">
                      {option.price === 0 ? "GRATIS" : formatPrice(option.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-[#0288D1]" />
              <h2 className="text-[#4A4A4A]">Metode Pembayaran</h2>
            </div>
            <div className="space-y-3">
              {paymentOptions.map((option) => {
                const Icon = iconMap[option.iconKey] || Wallet

                return (
                  <button
                    key={option.id}
                    onClick={() => setPaymentMethod(option.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === option.id
                        ? "border-[#0288D1] bg-[#0288D1]/5"
                        : "border-[#E5E7EB] hover:border-[#0288D1]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            paymentMethod === option.id
                              ? "bg-[#0288D1]"
                              : "bg-[#E5E7EB]"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              paymentMethod === option.id
                                ? "text-white"
                                : "text-[#6B6B6B]"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-[#4A4A4A] mb-0.5">
                            {option.name}
                          </h3>
                          <p className="text-xs text-[#6B6B6B]">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {paymentMethod === option.id && (
                        <div className="w-5 h-5 rounded-full bg-[#0288D1] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <h2 className="text-[#4A4A4A] mb-4">Ringkasan Pembayaran</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B6B6B]">Subtotal Produk</span>
                <span className="text-[#4A4A4A]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B6B6B]">Biaya Pengiriman</span>
                <span className="text-[#4A4A4A]">
                  {shippingCost === 0 ? (
                    <span className="text-[#10B981]">GRATIS</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B6B6B]">Biaya Layanan</span>
                <span className="text-[#4A4A4A]">
                  {formatPrice(platformFee)}
                </span>
              </div>
              <div className="border-t border-[#E5E7EB] pt-3 flex justify-between">
                <span className="text-[#4A4A4A]">Total Pembayaran</span>
                <span className="text-xl text-[#0288D1]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#0288D1]/5 to-[#4FC3F7]/5 border border-[#0288D1]/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0288D1] flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <h4 className="text-[#4A4A4A] mb-1">
                  Transaksi Aman & Terpercaya
                </h4>
                <p className="text-[#6B6B6B] text-xs leading-relaxed">
                  Uang Anda akan ditahan oleh platform hingga barang diterima
                  dengan baik. Garansi 100% uang kembali jika barang tidak
                  sesuai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-6 safe-area-bottom">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#6B6B6B]">Total Pembayaran</span>
            <span className="text-xl text-[#0288D1]">{formatPrice(total)}</span>
          </div>
          <PrimaryButton
            label="Bayar Sekarang"
            onClick={handleCheckout}
            isLoading={isProcessing}
            disabled={!activeAddress}
          />
          <p className="text-xs text-center text-[#6B6B6B]">
            Dengan melanjutkan, Anda menyetujui{" "}
            <span className="text-[#0288D1]">Syarat & Ketentuan</span>{" "}
            BeresinAja
          </p>
        </div>
      </div>
    </div>
  )
}
