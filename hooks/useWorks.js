// hooks/useWorks.js
import { useState, useEffect } from 'react';
import { INITIAL_WORKS_DATA } from '../data/worksData';

export function useWorks() {
  const [allWorks, setAllWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'ongoing', 'completed'
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate real-time API sync with the network gateway
    async function loadWorksData() {
      try {
        setIsLoading(true);
        
        // Simulating network latency
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        setAllWorks(INITIAL_WORKS_DATA);
        setFilteredWorks(INITIAL_WORKS_DATA);
      } catch (err) {
        console.error("Error parsing service operations data matrix:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorksData();
  }, []);

  // Recalculate array filtering instantly on the JavaScript thread whenever tabs shift
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredWorks(allWorks);
    } else {
      const updatedList = allWorks.filter((item) => item.status === activeTab);
      setFilteredWorks(updatedList);
    }
  }, [activeTab, allWorks]);

  // Handler for pulling down the FlatList to sync fresh data batches
  const refreshWorksList = async () => {
    setIsRefreshing(true);
    
    // Simulate re-fetching data packages from database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAllWorks(INITIAL_WORKS_DATA);
    
    setIsRefreshing(false);
  };

  return {
    filteredWorks,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    refreshWorksList
  };
}