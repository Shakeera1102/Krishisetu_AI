import React, { createContext, useContext, useState } from 'react';

const FarmerContext = createContext();

const DEFAULT_LOCATION = {
  lat: 19.2183,
  lng: 72.9781,
  name: 'Nashik, Maharashtra',
  district: 'Nashik',
  state: 'Maharashtra'
};

export const FarmerProvider = ({ children }) => {
  const [selectedCrop, setSelectedCrop] = useState(() => {
    const saved = localStorage.getItem('agri_farmer_crop');
    if (!saved || saved === 'null' || saved === 'undefined') return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' && parsed.name ? parsed : null;
    } catch {
      return null;
    }
  });

  const [farmerLocation, setFarmerLocation] = useState(() => {
    const saved = localStorage.getItem('agri_farmer_location');
    if (!saved || saved === 'null' || saved === 'undefined') return DEFAULT_LOCATION;
    try {
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' && parsed.name ? parsed : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);

  const updateCrop = (cropData) => {
    setSelectedCrop((prev) => {
      const cropName = cropData.name || cropData.crop || prev?.name || 'Cotton';
      const defaultRate = cropName.toLowerCase().includes('cotton') ? 6900 : 3000;
      const price = Number(cropData.expectedPrice) && Number(cropData.expectedPrice) > 2400
        ? Number(cropData.expectedPrice)
        : defaultRate;

      const updated = {
        ...(prev || {}),
        ...cropData,
        name: cropName,
        expectedPrice: price
      };
      localStorage.setItem('agri_farmer_crop', JSON.stringify(updated));
      return updated;
    });
  };

  const resetCrop = () => {
    setSelectedCrop(null);
    localStorage.removeItem('agri_farmer_crop');
  };

  const updateLocation = (locData) => {
    setFarmerLocation((prev) => {
      const updated = typeof locData === 'string'
        ? { ...(prev || DEFAULT_LOCATION), name: locData }
        : { ...(prev || DEFAULT_LOCATION), ...locData };
      localStorage.setItem('agri_farmer_location', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <FarmerContext.Provider
      value={{
        selectedCrop,
        farmerLocation: farmerLocation || DEFAULT_LOCATION,
        analyzeModalOpen,
        setAnalyzeModalOpen,
        updateCrop,
        resetCrop,
        updateLocation
      }}
    >
      {children}
    </FarmerContext.Provider>
  );
};

export const useFarmer = () => {
  const context = useContext(FarmerContext);
  if (!context) {
    return {
      selectedCrop: null,
      farmerLocation: DEFAULT_LOCATION,
      analyzeModalOpen: false,
      setAnalyzeModalOpen: () => {},
      updateCrop: () => {},
      resetCrop: () => {},
      updateLocation: () => {}
    };
  }
  return context;
};

export default FarmerContext;
