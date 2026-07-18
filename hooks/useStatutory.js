// hooks/useStatutory.js
import { useState, useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { INITIAL_STATUTORY_DATA } from '../data/statutoryData';

export function useStatutory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filings, setFilings] = useState([]);
  const [filteredFilings, setFilteredFilings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function initFetch() {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setFilings(INITIAL_STATUTORY_DATA);
        setFilteredFilings(INITIAL_STATUTORY_DATA);
      } catch (err) {
        console.error("Filing engine lookup error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initFetch();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFilings(filings);
    } else {
      const query = searchQuery.toLowerCase();
      const records = filings.filter(item => 
        item.companyName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query)
      );
      setFilteredFilings(records);
    }
  }, [searchQuery, filings]);

  const downloadAssetFile = async (url, fileName) => {
    if (!url) {
      Alert.alert("Error", "Document download address path is unavailable.");
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Alert.alert("Downloading Document", `Fetching: ${fileName}`);
        await Linking.openURL(url);
      } else {
        Alert.alert("Link Unreachable", "System cannot process this URL down to your storage layer.");
      }
    } catch (err) {
      Alert.alert("Process Failed", "An error occurred launching the download interface.");
    }
  };

  const refreshRegistry = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setFilings(INITIAL_STATUTORY_DATA);
    setIsRefreshing(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredFilings,
    isLoading,
    isRefreshing,
    refreshRegistry,
    downloadAssetFile
  };
}