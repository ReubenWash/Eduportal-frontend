import api, { unwrapItem } from './axios';

export const askStudyAssistant = async (question) => {
  const res = await api.post('/study-assistant/ask', { question });
  return unwrapItem(res.data);
};
