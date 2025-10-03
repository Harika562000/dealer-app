import { ServiceBooking } from '../store/serviceSlice';

export interface WarrantyValidationResult {
  isValid: boolean;
  status: 'active' | 'expired' | 'expiring_soon' | 'mileage_exceeded' | 'no_warranty';
  message: string;
  daysUntilExpiry?: number;
  mileageRemaining?: number;
  warnings: string[];
}

export interface WarrantyStatus {
  isActive: boolean;
  isExpiringSoon: boolean;
  isMileageExceeded: boolean;
  coveragePercentage: number;
  recommendedActions: string[];
}

/**
 * Validates warranty information for a service booking
 */
export function validateWarranty(booking: ServiceBooking): WarrantyValidationResult {
  const warnings: string[] = [];
  
  // Check if warranty info exists
  if (!booking.warrantyInfo) {
    return {
      isValid: false,
      status: 'no_warranty',
      message: 'No warranty information available for this vehicle',
      warnings: ['Contact service center for warranty details']
    };
  }

  const warranty = booking.warrantyInfo;
  const now = new Date();
  const expiryDate = new Date(warranty.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if warranty is expired
  if (daysUntilExpiry < 0) {
    return {
      isValid: false,
      status: 'expired',
      message: `Warranty expired ${Math.abs(daysUntilExpiry)} days ago`,
      daysUntilExpiry,
      warnings: ['Warranty has expired', 'Service costs may not be covered']
    };
  }

  // Check if warranty is expiring soon (within 30 days)
  if (daysUntilExpiry <= 30) {
    warnings.push(`Warranty expires in ${daysUntilExpiry} days`);
  }

  // Check mileage limits
  let mileageRemaining: number | undefined;
  if (warranty.mileageLimit && warranty.currentMileage) {
    mileageRemaining = warranty.mileageLimit - warranty.currentMileage;
    
    if (mileageRemaining < 0) {
      return {
        isValid: false,
        status: 'mileage_exceeded',
        message: `Warranty mileage limit exceeded by ${Math.abs(mileageRemaining).toLocaleString()} km`,
        daysUntilExpiry,
        mileageRemaining,
        warnings: ['Mileage limit exceeded', 'Warranty may not cover service costs']
      };
    }
    
    if (mileageRemaining <= 5000) {
      warnings.push(`Only ${mileageRemaining.toLocaleString()} km remaining on warranty`);
    }
  }

  // Determine overall status
  let status: WarrantyValidationResult['status'] = 'active';
  if (daysUntilExpiry <= 30) {
    status = 'expiring_soon';
  }

  return {
    isValid: true,
    status,
    message: status === 'expiring_soon' 
      ? `Warranty expires in ${daysUntilExpiry} days`
      : 'Warranty is active and valid',
    daysUntilExpiry,
    mileageRemaining,
    warnings
  };
}

/**
 * Gets comprehensive warranty status information
 */
export function getWarrantyStatus(booking: ServiceBooking): WarrantyStatus {
  const validation = validateWarranty(booking);
  const recommendedActions: string[] = [];

  if (!booking.warrantyInfo) {
    return {
      isActive: false,
      isExpiringSoon: false,
      isMileageExceeded: false,
      coveragePercentage: 0,
      recommendedActions: ['Contact service center for warranty information']
    };
  }

  const warranty = booking.warrantyInfo;
  const now = new Date();
  const expiryDate = new Date(warranty.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const isActive = daysUntilExpiry > 0;
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  
  // Calculate mileage status
  let isMileageExceeded = false;
  if (warranty.mileageLimit && warranty.currentMileage) {
    isMileageExceeded = warranty.currentMileage > warranty.mileageLimit;
  }

  // Calculate coverage percentage based on time and mileage
  let coveragePercentage = 100;
  
  // Time-based coverage (assuming 3-year warranty)
  const totalWarrantyDays = 365 * 3; // 3 years
  const daysUsed = totalWarrantyDays - daysUntilExpiry;
  const timeCoveragePercentage = Math.max(0, 100 - (daysUsed / totalWarrantyDays) * 100);
  
  // Mileage-based coverage
  let mileageCoveragePercentage = 100;
  if (warranty.mileageLimit && warranty.currentMileage) {
    mileageCoveragePercentage = Math.max(0, 100 - (warranty.currentMileage / warranty.mileageLimit) * 100);
  }
  
  // Take the lower of the two percentages
  coveragePercentage = Math.min(timeCoveragePercentage, mileageCoveragePercentage);

  // Generate recommended actions
  if (isExpiringSoon) {
    recommendedActions.push('Schedule service before warranty expires');
    recommendedActions.push('Consider extended warranty options');
  }
  
  if (isMileageExceeded) {
    recommendedActions.push('Warranty mileage limit exceeded');
    recommendedActions.push('Service costs may not be covered');
  }
  
  if (coveragePercentage < 20) {
    recommendedActions.push('Warranty coverage is running low');
    recommendedActions.push('Plan for upcoming service needs');
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push('Warranty is in good standing');
    recommendedActions.push('Continue regular maintenance schedule');
  }

  return {
    isActive,
    isExpiringSoon,
    isMileageExceeded,
    coveragePercentage: Math.round(coveragePercentage),
    recommendedActions
  };
}

/**
 * Gets warranty color based on status
 */
export function getWarrantyStatusColor(status: WarrantyValidationResult['status']): string {
  switch (status) {
    case 'active':
      return '#27ae60'; // Green
    case 'expiring_soon':
      return '#f39c12'; // Orange
    case 'expired':
    case 'mileage_exceeded':
      return '#e74c3c'; // Red
    case 'no_warranty':
      return '#95a5a6'; // Gray
    default:
      return '#95a5a6';
  }
}

/**
 * Gets warranty status icon
 */
export function getWarrantyStatusIcon(status: WarrantyValidationResult['status']): string {
  switch (status) {
    case 'active':
      return 'shield-checkmark';
    case 'expiring_soon':
      return 'shield-warning';
    case 'expired':
    case 'mileage_exceeded':
      return 'shield-close';
    case 'no_warranty':
      return 'shield-outline';
    default:
      return 'shield-outline';
  }
}
