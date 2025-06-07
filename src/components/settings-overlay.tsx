"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { IoMdClose } from "react-icons/io";

interface TeamMember {
  id?: string;
  name: string;
  email: string;
  role: string;
}

interface OverlayProps {
  setShowOverlay: (show: boolean) => void;
  member: TeamMember | null;
  onSave: (member: TeamMember) => void;
}

export const Overlay = ({ setShowOverlay, member, onSave }: OverlayProps) => {
  // Form state
  const [formData, setFormData] = useState<TeamMember>({
    name: member?.name || "",
    email: member?.email || "",
    role: member?.role || "",
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Partial<TeamMember>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for focus management
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key press
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setShowOverlay(false);
    }
  }, [setShowOverlay]);

  // Handle click outside overlay
  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setShowOverlay(false);
    }
  }, [setShowOverlay]);

  // Focus management
  useEffect(() => {
    // Add escape key listener
    document.addEventListener("keydown", handleEscapeKey);
    
    // Focus first input when overlay opens
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
    
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [handleEscapeKey]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<TeamMember> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.role) {
      newErrors.role = "Role is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof TeamMember, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave({
        ...formData,
        id: member?.id || Date.now().toString(), // Generate ID for new members
      });
      
      setShowOverlay(false);
    } catch (error) {
      console.log("Error saving team member:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tab key for focus trapping
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      const focusableElements = overlayRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="overlay-title"
    >
      <div 
        ref={overlayRef}
        className="bg-white relative rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <button
          ref={closeButtonRef}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 z-10"
          onClick={() => setShowOverlay(false)}
          aria-label="Close dialog"
        >
          <IoMdClose className="w-6 h-6" />
        </button>
        
        <div className="p-6">
          <h2 id="overlay-title" className="text-xl font-semibold mb-6">
            {member ? "Edit Team Member" : "Add New Team Member"}
          </h2>
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label 
                  htmlFor="member-name" 
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Name 
                </label>
                <input
                  ref={firstFocusableRef}
                  id="member-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.name 
                      ? "border-red-400 focus:ring-red-500" 
                      : "border-gray-400 focus:ring-blue-500"
                  }`}
                  placeholder="Enter member's name"
                  aria-describedby={errors.name ? "name-error" : undefined}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label 
                  htmlFor="member-email" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email 
                </label>
                <input
                  id="member-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email 
                      ? "border-red-400 focus:ring-red-500" 
                      : "border-gray-400 focus:ring-blue-500"
                  }`}
                  placeholder="Enter member's email"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label 
                  htmlFor="member-role" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Role 
                </label>
                <select
                  id="member-role"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 appearance-none transition-colors ${
                    errors.role 
                      ? "border-red-400 focus:ring-red-500" 
                      : "border-gray-400 focus:ring-blue-500"
                  }`}
                  aria-describedby={errors.role ? "role-error" : undefined}
                  disabled={isSubmitting}
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  <option value="admin">Admin</option>
                  <option value="ta">TCL (Talent Acquisition) Lead</option>
                  <option value="hr">HR Manager</option>
                </select>
                {errors.role && (
                  <p id="role-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.role}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-gray-500 border border-gray-300 hover:border-gray-400 hover:text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                onClick={() => setShowOverlay(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  member ? "Update Member" : "Add Member"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};