// hooks/useProfile.js
import { useState, useEffect } from 'react';

export function useProfile(userId) {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        // Simulating API loading latency
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        setProfileData({
          username: 'ziyaulhaq',
          firstName: 'Mohammad',
          lastName: 'Ziyaulhaq',
          email: 'ziya@evault.money',
          phoneNumber: '+234 801 234 5678',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
        });
      } catch (err) {
        console.error("Error fetching Evault profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  const updateProfile = async (updatedFields) => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProfileData((prev) => ({ ...prev, ...updatedFields }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsSaving(false);
    }
  };

  return { profileData, isLoading, isSaving, updateProfile };
}