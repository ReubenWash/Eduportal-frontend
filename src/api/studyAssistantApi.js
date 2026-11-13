import api, { unwrapItem, unwrapList } from './axios';

export const askStudyAssistant = async (question) => {
  const res = await api.post('/study-assistant/ask', { question });
  return unwrapItem(res.data);
};

export const generateStudyQuiz = async (data = {}) => {
  const res = await api.post('/study-assistant/quiz', data);
  return unwrapList(res.data);
};
