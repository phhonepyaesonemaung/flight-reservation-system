// PassengerInfoForm.tsx
import React, { useState } from 'react';

interface PassengerInfoFormProps {
  selectedFlight: any;
  onSubmit: (bookingData: any) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  seatPreference: string;
  specialRequests: string;
}

interface FormErrors {
  [key: string]: string;
}

const PassengerInfoForm: React.FC<PassengerInfoFormProps> = ({ selectedFlight, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: 'Myanmar',
    passportNumber: '',
    seatPreference: 'economy',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (Myanmar format)
    const phoneRegex = /^(\+?95|0)?[0-9]{7,11}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid Myanmar phone number';
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 2 || age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    // Passport validation (optional but if provided must be valid)
    if (formData.passportNumber && formData.passportNumber.length < 6) {
      newErrors.passportNumber = 'Passport number must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare booking data
      const bookingData = {
        flight_id: selectedFlight.id,
        passenger: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          nationality: formData.nationality,
          passport_number: formData.passportNumber || null
        },
        seat_preference: formData.seatPreference,
        special_requests: formData.specialRequests || null
      };

      // Call parent component's submit handler
      await onSubmit(bookingData);
    } catch (error) {
      console.error('Booking submission error:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-primary-800 rounded-t-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Passenger Information</h1>
          <p className="text-blue-200">Please fill in your details to complete the booking</p>
        </div>

        {/* Flight Summary */}
        {selectedFlight && (
          <div className="bg-white border-x-4 border-primary-500 shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Selected Flight</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Flight Number</p>
                <p className="font-semibold text-gray-900">{selectedFlight.flight_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Route</p>
                <p className="font-semibold text-gray-900">
                  {selectedFlight.departure_city} → {selectedFlight.arrival_city}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedFlight.departure_time).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-semibold text-primary-600 text-lg">{selectedFlight.base_price} MMK</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.firstName ? 'border-accent' : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition`}
                  placeholder="Enter first name"
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-accent">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.lastName ? 'border-accent' : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition`}
                  placeholder="Enter last name"
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-accent">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Contact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-accent">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.email ? 'border-accent' : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition`}
                  placeholder="example@email.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-accent">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-accent">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.phone ? 'border-accent' : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition`}
                  placeholder="+959xxxxxxxxx"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-accent">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Personal Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth <span className="text-accent">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.dateOfBirth ? 'border-accent' : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition`}
                  disabled={isSubmitting}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-accent">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label htmlFor="nationality" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nationality <span className="text-accent">*</span>
                </label>
                <select
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                  disabled={isSubmitting}
                >
                  <option value="Myanmar">Myanmar</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Travel Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="passportNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Passport Number <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="passportNumber"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.passportNumber ? 'border-accent' : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition`}
                  placeholder="Enter passport number"
                  disabled={isSubmitting}
                />
                {errors.passportNumber && (
                  <p className="mt-1 text-sm text-accent">{errors.passportNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="seatPreference" className="block text-sm font-semibold text-gray-700 mb-2">
                  Seat Preference <span className="text-accent">*</span>
                </label>
                <select
                  id="seatPreference"
                  name="seatPreference"
                  value={formData.seatPreference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                  disabled={isSubmitting}
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business Class</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label htmlFor="specialRequests" className="block text-sm font-semibold text-gray-700 mb-2">
                Special Requests <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none"
                placeholder="Any special requirements or requests..."
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold transition shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PassengerInfoForm;