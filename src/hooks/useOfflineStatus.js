import { useEffect, useState } from 'react';
import { getOfflineStatus, subscribeOfflineStatus } from '../utils/offlineSync';

export default function useOfflineStatus() {
  const [status, setStatus] = useState(getOfflineStatus);

  useEffect(() => subscribeOfflineStatus(() => setStatus(getOfflineStatus())), []);

  return status;
}
