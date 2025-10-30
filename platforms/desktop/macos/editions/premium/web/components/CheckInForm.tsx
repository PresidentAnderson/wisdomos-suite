'use client'

import { useState } from 'react'
import { useCreateBooking } from '@/hooks/useCreateBooking'
import { useToast } from '@/components/Toast'

export default function CheckInForm() {
  const { create, loading } = useCreateBooking()
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState({
    // Guest info
    full_name: '',
    email: '',
    phone: '',
    // Booking info
    room_type: 'DORM_8',
    bed_label: '',
    source: 'DIRECT',
    total_price: 0,
    paid_amount: 0,
    payment_method: 'CARD',
    payment_status: 'PENDING',
    checkin_date: new Date().toISOString().split('T')[0],
    checkout_date: '',
    special_requests: '',
    internal_notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const guest = {
        full_name: formData.full_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined
      }
      
      const booking = {
        room_type: formData.room_type,
        bed_label: formData.bed_label || undefined,
        source: formData.source || undefined,
        total_price: formData.total_price,
        paid_amount: formData.paid_amount || undefined,
        payment_method: formData.payment_method || undefined,
        payment_status: formData.payment_status || undefined,
        checkin_date: formData.checkin_date || undefined,
        checkout_date: formData.checkout_date || undefined,
        special_requests: formData.special_requests || undefined,
        internal_notes: formData.internal_notes || undefined
      }
      
      const result = await create(guest, booking)
      
      showToast(
        `Booking created successfully! ID: ${result.booking_id}`,
        'success'
      )
      
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        room_type: 'DORM_8',
        bed_label: '',
        source: 'DIRECT',
        total_price: 0,
        paid_amount: 0,
        payment_method: 'CARD',
        payment_status: 'PENDING',
        checkin_date: new Date().toISOString().split('T')[0],
        checkout_date: '',
        special_requests: '',
        internal_notes: ''
      })
      
    } catch (error: any) {
      // Real error from Supabase/API
      showToast(
        error.message || 'Failed to create booking',
        'error'
      )
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_price' || name === 'paid_amount' 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 flame-text">Guest Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="+1234567890"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 flame-text">Booking Details</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Room Type *
            </label>
            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="DORM_8">8-Bed Dorm</option>
              <option value="DORM_6">6-Bed Dorm</option>
              <option value="DORM_4">4-Bed Dorm</option>
              <option value="PRIVATE">Private Room</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Bed Label
            </label>
            <input
              type="text"
              name="bed_label"
              value={formData.bed_label}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="3A, 2B, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              name="checkin_date"
              value={formData.checkin_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              name="checkout_date"
              value={formData.checkout_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Price *
            </label>
            <input
              type="number"
              name="total_price"
              value={formData.total_price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="100.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Paid Amount
            </label>
            <input
              type="number"
              name="paid_amount"
              value={formData.paid_amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="TRANSFER">Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Status
            </label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Source
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="DIRECT">Direct</option>
              <option value="BOOKING_COM">Booking.com</option>
              <option value="EXPEDIA">Expedia</option>
              <option value="AIRBNB">Airbnb</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Special Requests
          </label>
          <textarea
            name="special_requests"
            value={formData.special_requests}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Any special requests from the guest..."
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Internal Notes
          </label>
          <textarea
            name="internal_notes"
            value={formData.internal_notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Internal notes (not visible to guest)..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-phoenix text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Booking...' : 'Create Booking'}
      </button>
    </form>
  )
}